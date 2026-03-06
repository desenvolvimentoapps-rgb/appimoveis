import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
    try {
        const tipos = await prisma.propertyType.findMany({
            include: {
                customFields: true,
                _count: {
                    select: { properties: true }
                }
            },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(tipos);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar tipos" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).level !== "MASTER" && (session.user as any).level !== "GESTOR")) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { name } = await req.json();
    if (!name) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

    try {
        const tipo = await prisma.propertyType.create({ data: { name } });
        return NextResponse.json(tipo);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao criar tipo. Verifique se já existe." }, { status: 400 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).level !== "MASTER" && (session.user as any).level !== "GESTOR")) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id, name } = await req.json();
    if (!id || !name) return NextResponse.json({ error: "ID e Nome são obrigatórios" }, { status: 400 });

    try {
        const tipo = await prisma.propertyType.update({
            where: { id: id as string },
            data: { name }
        });
        return NextResponse.json(tipo);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao atualizar tipo" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).level !== "MASTER" && (session.user as any).level !== "GESTOR")) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

    try {
        await prisma.propertyType.delete({ where: { id: id as string } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao excluir tipo. Pode haver imóveis vinculados." }, { status: 500 });
    }
}
