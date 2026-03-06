import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const adminEmail = 'admin@oliviaprado.com.br'
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail }
    })

    if (!existingAdmin) {
        const passwordHash = await bcrypt.hash('admin123', 10)

        await prisma.user.create({
            data: {
                name: 'Administrador Master',
                email: adminEmail,
                passwordHash,
                level: 'MASTER',
                status: 'ATIVO',
                forceReset: false
            }
        })
        console.log('✅ Usuário Master criado: admin@oliviaprado.com.br / admin123')
    } else {
        console.log('✅ Usuário Master já existe.')
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
