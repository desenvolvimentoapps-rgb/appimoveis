import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const userId = (session.user as any).id;
    const userLevel = (session.user as any).level;

    try {
        // Se for Master, vê tudo. Se não, vê apenas os que tem acesso.
        const charts = await prisma.chart.findMany({
            where: userLevel === "MASTER" ? {} : {
                allowedUsers: {
                    some: { userId }
                }
            },
            include: {
                allowedUsers: {
                    include: { user: { select: { id: true, name: true, email: true } } }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Lógica para buscar os dados de cada gráfico
        const chartsWithData = await Promise.all(charts.map(async (chart) => {
            let data: any[] = [];

            if (chart.dataSource === "property_type") {
                const results = await prisma.propertyType.findMany({
                    include: { _count: { select: { properties: true } } }
                });
                data = results.map(r => ({ label: r.name, value: r._count.properties }));
            } else if (chart.dataSource === "region") {
                const results = await prisma.property.groupBy({
                    by: ["region"],
                    _count: true
                });
                data = results.map(r => ({ label: r.region, value: r._count }));
            } else if (chart.dataSource === "status") {
                const results = await prisma.property.groupBy({
                    by: ["status"],
                    _count: true
                });
                data = results.map(r => ({ label: r.status, value: r._count }));
            } else if (chart.dataSource === "city") {
                const results = await prisma.locationCity.findMany({
                    include: { _count: { select: { properties: true } } }
                });
                data = results.map(r => ({ label: r.name, value: r._count.properties }));
            } else if (chart.dataSource === "amenity") {
                const results = await prisma.amenity.findMany({
                    include: { _count: { select: { properties: true } } }
                });
                data = results.map(r => ({ label: r.name, value: r._count.properties }));
            }

            return { ...chart, data };
        }));

        return NextResponse.json(chartsWithData);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar gráficos" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).level !== "MASTER") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { title, type, dataSource, allowedUserIds, dashboardId } = await req.json();

    try {
        // Criar o gráfico e associar aos usuários permitidos
        const chart = await prisma.chart.create({
            data: {
                title,
                type,
                dataSource,
                dashboardId: dashboardId || (await prisma.dashboard.findFirst({ where: { creatorId: (session.user as any).id } }))?.id || (await prisma.dashboard.create({ data: { name: "Dashboard Principal", creatorId: (session.user as any).id } })).id,
                allowedUsers: {
                    create: allowedUserIds?.map((uid: string) => ({
                        userId: uid
                    })) || []
                }
            }
        });

        return NextResponse.json(chart);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao criar gráfico" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).level !== "MASTER") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    try {
        await prisma.chart.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao excluir gráfico" }, { status: 500 });
    }
}
