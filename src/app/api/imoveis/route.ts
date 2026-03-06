import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Filtros
    const typeId = searchParams.get("typeId");
    const cityId = searchParams.get("cityId");
    const region = searchParams.get("region");
    const status = searchParams.get("status");
    const amenities = searchParams.get("amenities")?.split(",");
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;

    const where: any = {};
    if (typeId) where.typeId = typeId;
    if (cityId) where.cityId = cityId;
    if (region) where.region = region;
    if (status) where.status = status;

    if (amenities && amenities.length > 0) {
        where.amenities = {
            some: {
                amenityId: { in: amenities }
            }
        };
    }
    if (minPrice || maxPrice) {
        where.price = {
            gte: minPrice,
            lte: maxPrice,
        };
    }

    try {
        const [total, properties] = await Promise.all([
            prisma.property.count({ where }),
            prisma.property.findMany({
                where,
                include: {
                    type: true,
                    city: { include: { state: true } },
                    images: { orderBy: { order: 'asc' }, take: 1 },
                    amenities: { include: { amenity: true } },
                    customValues: { include: { customField: true } }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            })
        ]);

        return NextResponse.json({
            data: properties,
            total,
            page,
            totalPages: Math.ceil(total / limit)
        });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao buscar imóveis" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await req.json();
    const {
        title, code, status, address, zipCode, price, description,
        deliveryDate, showDeliveryDate, whatsappBR, whatsappExt,
        region, typeId, cityId, images, amenities, customValues,
        bedrooms, bathrooms, parkingSpaces, totalArea, usefulArea, floor
    } = body;

    try {
        const property = await prisma.property.create({
            data: {
                title,
                code,
                status,
                address,
                zipCode,
                price: parseFloat(price.toString()),
                description,
                deliveryDate: deliveryDate ? new Date(deliveryDate) : null,
                showDeliveryDate: !!showDeliveryDate,
                whatsappBR: !!whatsappBR,
                whatsappExt: !!whatsappExt,
                region: region || "BRASIL",
                typeId,
                cityId,
                bedrooms: parseInt(bedrooms?.toString() || "0"),
                bathrooms: parseInt(bathrooms?.toString() || "0"),
                parkingSpaces: parseInt(parkingSpaces?.toString() || "0"),
                totalArea: parseFloat(totalArea?.toString() || "0"),
                usefulArea: parseFloat(usefulArea?.toString() || "0"),
                floor: floor ? parseInt(floor.toString()) : null,
                images: {
                    create: images?.map((url: string, index: number) => ({
                        url,
                        order: index
                    })) || []
                },
                amenities: {
                    create: amenities?.map((id: string) => ({
                        amenityId: id
                    })) || []
                },
                customValues: {
                    create: customValues?.map((cv: any) => ({
                        customFieldId: cv.customFieldId,
                        value: cv.value.toString()
                    })) || []
                }
            }
        });

        return NextResponse.json(property);
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: "Erro ao salvar imóvel: " + error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Não autorizado" }, { status: 401 });

    const body = await req.json();
    const { id, ...data } = body;

    try {
        // Para simplificar o update (remove e recria relações dinâmicas)
        if (data.amenities) {
            await prisma.propertyAmenity.deleteMany({ where: { propertyId: id } });
            data.amenities = {
                create: data.amenities.map((amenityId: string) => ({ amenityId }))
            };
        }
        if (data.customValues) {
            await prisma.propertyValue.deleteMany({ where: { propertyId: id } });
            data.customValues = {
                create: data.customValues.map((cv: any) => ({
                    customFieldId: cv.customFieldId,
                    value: cv.value.toString()
                }))
            };
        }
        if (data.images) {
            await prisma.propertyImage.deleteMany({ where: { propertyId: id } });
            data.images = {
                create: data.images.map((url: string, index: number) => ({
                    url,
                    order: index
                }))
            };
        }

        const property = await prisma.property.update({
            where: { id: id as string },
            data: {
                ...data,
                price: data.price ? parseFloat(data.price.toString()) : undefined,
                deliveryDate: data.deliveryDate ? new Date(data.deliveryDate) : undefined,
                bedrooms: data.bedrooms !== undefined ? parseInt(data.bedrooms.toString()) : undefined,
                bathrooms: data.bathrooms !== undefined ? parseInt(data.bathrooms.toString()) : undefined,
                parkingSpaces: data.parkingSpaces !== undefined ? parseInt(data.parkingSpaces.toString()) : undefined,
                totalArea: data.totalArea !== undefined ? parseFloat(data.totalArea.toString()) : undefined,
                usefulArea: data.usefulArea !== undefined ? parseFloat(data.usefulArea.toString()) : undefined,
                floor: data.floor !== undefined ? (data.floor ? parseInt(data.floor.toString()) : null) : undefined,
            }
        });

        return NextResponse.json(property);
    } catch (error: any) {
        return NextResponse.json({ error: "Erro ao atualizar imóvel" }, { status: 500 });
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
        await prisma.property.delete({ where: { id: id as string } });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Erro ao excluir imóvel" }, { status: 500 });
    }
}
