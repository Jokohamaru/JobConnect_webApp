import { PrismaClient, UserRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Creating recruiter user...');

  const hashedPassword = await bcrypt.hash('recruiter123', 10);

  // Create recruiter user
  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter@example.com' },
    update: {
      password: hashedPassword,
      role: UserRole.RECRUITER,
    },
    create: {
      email: 'recruiter@example.com',
      password: hashedPassword,
      role: UserRole.RECRUITER,
    },
  });

  console.log('✅ Recruiter user created:', recruiterUser.email);

  // Get or create a company
  const company = await prisma.company.findFirst();
  
  if (!company) {
    console.log('❌ No company found. Please run main seed first.');
    return;
  }

  // Create or update recruiter profile
  const recruiter = await prisma.recruiter.upsert({
    where: { userId: recruiterUser.id },
    update: {
      firstName: 'Recruiter',
      lastName: 'Test',
      phoneNumber: '0987654321',
      companyId: company.id,
    },
    create: {
      userId: recruiterUser.id,
      firstName: 'Recruiter',
      lastName: 'Test',
      phoneNumber: '0987654321',
      companyId: company.id,
    },
  });

  console.log('✅ Recruiter profile created');
  console.log('\n📧 Login credentials:');
  console.log('   Email: recruiter@example.com');
  console.log('   Password: recruiter123');
  console.log('   Role: RECRUITER');
  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
