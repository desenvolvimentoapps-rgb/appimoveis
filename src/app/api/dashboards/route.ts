import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export const dynamic = "force-dynamic";


export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).level !== "MASTER") {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
    }

    try {
        // 1. Distribuição por Tipo
        const porTipo = await prisma.property.groupBy({
            by: ["typeId"],
            _count: { id: true },
        });

        // Buscar nomes dos tipos
        const tipos = await prisma.propertyType.findMany();
        const chartTipos = porTipo.map(item => ({
            label: tipos.find(t => t.id === item.typeId)?.name || "Outros",
            count: item._count.id
        }));

        // 2. Distribuição por Cidade
        const porCidade = await prisma.property.groupBy({
            by: ["cityId"],
            _count: { id: true },
        });
        const cidades = await prisma.locationCity.findMany();
        const chartCidades = porCidade.map(item => ({
            label: cidades.find(c => c.id === item.cityId)?.name || "Outros",
            count: item._count.id
        }));

        // 3. Status
        const porStatus = await prisma.property.groupBy({
            by: ["status"],
            _count: { id: true },
        });

        // 4. Últimos Cadastros (Performance)
        const totalImoveis = await prisma.property.count();
        const totalViews = await prisma.property.aggregate({ _sum: { views: true } });
        const totalClicks = await prisma.property.aggregate({ _sum: { clicks: true } });

        return NextResponse.json({
            tipos: chartTipos,
            cidades: chartCidades,
            status: porStatus.map(s => ({ label: s.status, count: s._count.id })),
            metrics: {
                totalImoveis,
                views: totalViews._sum.views || 0,
                clicks: totalClicks._sum.clicks || 0
            }
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
