import { PrismaClient, UserRole, CVStatus } from '@prisma/client';
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
  console.log('🌱 Creating candidate user with CVs...');

  const hashedPassword = await bcrypt.hash('candidate123', 10);

  // Create candidate user
  const candidateUser = await prisma.user.upsert({
    where: { email: 'candidate@example.com' },
    update: {
      password: hashedPassword,
      role: UserRole.CANDIDATE,
      firstName: 'John',
      lastName: 'Doe',
    },
    create: {
      email: 'candidate@example.com',
      password: hashedPassword,
      role: UserRole.CANDIDATE,
      firstName: 'John',
      lastName: 'Doe',
    },
  });

  console.log('✅ Candidate user created:', candidateUser.email);

  // Create or update candidate profile
  const candidate = await prisma.candidate.upsert({
    where: { userId: candidateUser.id },
    update: {
      phoneNumber: '0123456789',
      careerRole: 'Software Engineer',
    },
    create: {
      userId: candidateUser.id,
      phoneNumber: '0123456789',
      careerRole: 'Software Engineer',
    },
  });

  console.log('✅ Candidate profile created');

  // Create sample CVs
  const cv1 = await prisma.cV.create({
    data: {
      title: 'Software Engineer CV',
      cvUrl: 'https://example.com/cv/john-doe-software-engineer.pdf',
      status: CVStatus.DONE,
      candidateId: candidate.id,
    },
  });

  const cv2 = await prisma.cV.create({
    data: {
      title: 'Frontend Developer CV',
      cvUrl: 'https://example.com/cv/john-doe-frontend.pdf',
      status: CVStatus.DONE,
      candidateId: candidate.id,
    },
  });

  console.log('✅ Sample CVs created');
  console.log('\n📧 Login credentials:');
  console.log('   Email: candidate@example.com');
  console.log('   Password: candidate123');
  console.log('   Role: CANDIDATE');
  console.log('\n📄 CVs:');
  console.log('   1. Software Engineer CV');
  console.log('   2. Frontend Developer CV');
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
