import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET() {
    try {
        const amenities = await prisma.amenity.findMany({
            orderBy: { name: 'asc' }
        });
        return NextResponse.json(amenities);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar comodidades" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).level !== "MASTER" && (session.user as any).level !== "GESTOR")) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { name, icon } = await req.json();
    if (!name) return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });

    try {
        const amenity = await prisma.amenity.create({
            data: { name, icon }
        });
        return NextResponse.json(amenity);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao cadastrar comodidade" }, { status: 400 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).level !== "MASTER" && (session.user as any).level !== "GESTOR")) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    try {
        await prisma.amenity.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao excluir comodidade" }, { status: 500 });
    }
}
