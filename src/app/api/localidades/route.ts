import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // state or city

    try {
        if (type === "state") {
            const states = await prisma.locationState.findMany({
                include: { _count: { select: { cities: true } } },
                orderBy: { uf: 'asc' }
            });
            return NextResponse.json(states);
        } else {
            const cities = await prisma.locationCity.findMany({
                include: { state: true },
                orderBy: { name: 'asc' }
            });
            return NextResponse.json(cities);
        }
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar localidades" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).level !== "MASTER" && (session.user as any).level !== "GESTOR")) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { type, uf, name, stateId } = await req.json();

    try {
        if (type === "state") {
            const state = await prisma.locationState.create({
                data: { uf: uf.toUpperCase(), name }
            });
            return NextResponse.json(state);
        } else {
            const city = await prisma.locationCity.create({
                data: { name, stateId }
            });
            return NextResponse.json(city);
        }
    } catch (error) {
        return NextResponse.json({ error: "Erro ao cadastrar localidade" }, { status: 400 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).level !== "MASTER" && (session.user as any).level !== "GESTOR")) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    try {
        if (type === "state") {
            await prisma.locationState.delete({ where: { id } });
        } else {
            await prisma.locationCity.delete({ where: { id } });
        }
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao excluir localidade" }, { status: 500 });
    }
}
