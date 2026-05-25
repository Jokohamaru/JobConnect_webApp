import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function seedCompanyTypes() {
  console.log('🌱 Seeding company types...');

  const companyTypes = [
    { name: 'Công ty TNHH' },
    { name: 'Công ty Cổ phần' },
    { name: 'Doanh nghiệp tư nhân' },
    { name: 'Công ty Đa quốc gia' },
    { name: 'Startup' },
    { name: 'Công ty Nhà nước' },
    { name: 'Công ty Liên doanh' },
    { name: 'Chi nhánh' },
    { name: 'Văn phòng đại diện' },
    { name: 'Tổ chức phi lợi nhuận' },
  ];
  for (const type of companyTypes) {
    await prisma.companyType.upsert({
      where: { name: type.name },
      update: {},
      create: type,
    });
  }
  console.log('✅ Company types seeded successfully!');
}

seedCompanyTypes()
  .catch((e) => {
    console.error('❌ Error seeding company types:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });