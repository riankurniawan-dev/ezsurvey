import { PrismaClient, Role } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ezsurvey.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@ezsurvey.com',
      password: adminPassword,
      role: Role.ADMIN,
      phone: '081234567890',
    },
  })
  console.log({ admin })

  // Create Surveyor User
  const surveyorPassword = await bcrypt.hash('surveyor123', 10)
  const surveyor = await prisma.user.upsert({
    where: { email: 'surveyor@ezsurvey.com' },
    update: {},
    create: {
      name: 'John Surveyor',
      email: 'surveyor@ezsurvey.com',
      password: surveyorPassword,
      role: Role.SURVEYOR,
      phone: '081234567891',
    },
  })
  console.log({ surveyor })

  // Create Supervisor User
  const supervisorPassword = await bcrypt.hash('supervisor123', 10)
  const supervisor = await prisma.user.upsert({
    where: { email: 'supervisor@ezsurvey.com' },
    update: {},
    create: {
      name: 'Jane Supervisor',
      email: 'supervisor@ezsurvey.com',
      password: supervisorPassword,
      role: Role.SUPERVISOR,
      phone: '081234567892',
    },
  })
  console.log({ supervisor })

  console.log('Database seeding completed.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
