import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const typeId = searchParams.get("typeId");

    try {
        const fields = await prisma.customField.findMany({
            where: typeId ? { propertyTypeId: typeId } : {},
            include: { propertyType: true },
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(fields);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar campos" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).level !== "MASTER") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { name, type, required, showInSearch, showInList, propertyTypeId } = await req.json();

    try {
        const field = await prisma.customField.create({
            data: {
                name,
                type,
                isRequired: !!required,
                showInSearch: !!showInSearch,
                showInList: !!showInList,
                propertyTypeId
            }
        });
        return NextResponse.json(field);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao criar campo" }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).level !== "MASTER") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id, name, type, required, showInSearch, showInList } = await req.json();

    try {
        const field = await prisma.customField.update({
            where: { id },
            data: {
                name,
                type,
                isRequired: !!required,
                showInSearch: !!showInSearch,
                showInList: !!showInList
            }
        });
        return NextResponse.json(field);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao atualizar campo" }, { status: 500 });
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
        await prisma.customField.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao excluir campo" }, { status: 500 });
    }
}
