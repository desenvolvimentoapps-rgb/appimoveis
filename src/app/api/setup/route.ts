import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET() {
    try {
        const adminEmail = 'admin@oliviaprado.com.br';

        let existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (!existingAdmin) {
            const passwordHash = await bcrypt.hash('admin123', 10);

            existingAdmin = await prisma.user.create({
                data: {
                    name: 'Administrador Master',
                    email: adminEmail,
                    passwordHash,
                    level: 'MASTER',
                    status: 'ATIVO',
                    forceReset: false
                }
            });
            return NextResponse.json({ message: 'Usuário Master criado com sucesso!', email: adminEmail });
        }

        return NextResponse.json({ message: 'Usuário Master já exite!', email: adminEmail });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
