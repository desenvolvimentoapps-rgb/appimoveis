import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;

    try {
        const property = await prisma.property.findUnique({
            where: { id },
            include: {
                type: true,
                city: { include: { state: true } },
                images: { orderBy: { order: 'asc' } },
                amenities: { include: { amenity: true } },
                customValues: { include: { customField: true } }
            }
        });

        if (!property) return NextResponse.json({ error: "Imóvel não encontrado" }, { status: 404 });

        // Incrementar visualizações
        await prisma.property.update({
            where: { id },
            data: { views: { increment: 1 } }
        });

        return NextResponse.json(property);
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar imóvel" }, { status: 500 });
    }
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
    const { id } = params;
    const { action } = await req.json();

    if (action === "click") {
        await prisma.property.update({
            where: { id },
            data: { clicks: { increment: 1 } }
        });
        return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
}
