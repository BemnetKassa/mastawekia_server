import 'dotenv/config';
import { PrismaClient, Role } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

const adminEmail = 'admin@mastawekia.local';
const adminPassword = 'admin-password';

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL must be set before running the admin seed.');
  }

  const pool = new Pool({ connectionString });
  const prisma = new PrismaClient({
    adapter: new PrismaPg(pool),
  });

  try {
    const password = await bcrypt.hash(adminPassword, 10);
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: {
        password,
        role: Role.ADMIN,
        moderationStatus: 'ACTIVE',
      },
      create: {
        email: adminEmail,
        password,
        role: Role.ADMIN,
      },
    });

    console.log(`Seeded admin user: ${adminEmail}`);
    console.log(`Admin password: ${adminPassword}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});