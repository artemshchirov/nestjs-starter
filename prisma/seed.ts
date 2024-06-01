import { PrismaClient, Role, Status } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seedRoles() {
  const roles: Role[] = [
    { id: 1, name: 'ADMIN' },
    { id: 2, name: 'USER' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }
  console.log({ roles });
}

async function seedStatuses() {
  const statuses: Status[] = [
    { id: 1, name: 'ACTIVE' },
    { id: 2, name: 'INACTIVE' },
  ];

  for (const status of statuses) {
    await prisma.status.upsert({
      where: { id: status.id },
      update: {},
      create: status,
    });
  }
  console.log({ statuses });
}

async function seedUsers() {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash('secret', salt);
  const users = [
    {
      firstName: 'Super',
      lastName: 'Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      roleId: 1,
      statusId: 1,
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: hashedPassword,
      roleId: 2,
      statusId: 1,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    });
  }
  console.log({ users });
}

async function main() {
  console.log('Seeding...');
  await seedRoles();
  await seedStatuses();
  await seedUsers();
  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
