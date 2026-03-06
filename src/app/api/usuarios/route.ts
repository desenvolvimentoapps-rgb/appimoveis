import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).level !== "MASTER") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                level: true,
                status: true,
                forceReset: true,
                createdAt: true
            },
            orderBy: { createdAt: 'desc' }
        });
        return NextResponse.json(users);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar usuários" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).level !== "MASTER") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { name, email, password, level, forceReset } = await req.json();

    if (!email || !password || !level) {
        return NextResponse.json({ error: "Campos obrigatórios ausentes" }, { status: 400 });
    }

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                level,
                status: "ATIVO",
                forceReset: !!forceReset
            }
        });

        const { passwordHash: _, ...userWithoutPass } = user;
        return NextResponse.json(userWithoutPass);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao criar usuário. Email pode já estar em uso." }, { status: 400 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).level !== "MASTER") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { id, name, email, password, level, status, forceReset } = await req.json();

    try {
        const updateData: any = { name, email, level, status, forceReset: !!forceReset };
        if (password) {
            updateData.passwordHash = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        });

        const { passwordHash: _, ...userWithoutPass } = user;
        return NextResponse.json(userWithoutPass);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao atualizar usuário" }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).level !== "MASTER") {
        return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID é obrigatório" }, { status: 400 });

    try {
        await prisma.user.delete({ where: { id } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao excluir usuário" }, { status: 500 });
    }
}
