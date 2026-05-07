import { PrismaClient, UserRole, JobStatus, Currency } from '@prisma/client';
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
  console.log('🌱 Starting seed...');

  // Create cities
  const cities = await Promise.all([
    prisma.city.upsert({
      where: { name: 'Hà Nội' },
      update: {},
      create: { name: 'Hà Nội' },
    }),
    prisma.city.upsert({
      where: { name: 'Hồ Chí Minh' },
      update: {},
      create: { name: 'Hồ Chí Minh' },
    }),
    prisma.city.upsert({
      where: { name: 'Đà Nẵng' },
      update: {},
      create: { name: 'Đà Nẵng' },
    }),
  ]);

  console.log('✅ Cities created');

  // Create skills
  const skills = await Promise.all([
    prisma.requirementSkill.upsert({
      where: { name: 'JavaScript' },
      update: {},
      create: { name: 'JavaScript' },
    }),
    prisma.requirementSkill.upsert({
      where: { name: 'TypeScript' },
      update: {},
      create: { name: 'TypeScript' },
    }),
    prisma.requirementSkill.upsert({
      where: { name: 'React' },
      update: {},
      create: { name: 'React' },
    }),
    prisma.requirementSkill.upsert({
      where: { name: 'Node.js' },
      update: {},
      create: { name: 'Node.js' },
    }),
    prisma.requirementSkill.upsert({
      where: { name: 'Python' },
      update: {},
      create: { name: 'Python' },
    }),
  ]);

  console.log('✅ Skills created');

  // Create tags
  const tags = await Promise.all([
    prisma.tag.upsert({
      where: { name: 'Remote' },
      update: {},
      create: { name: 'Remote' },
    }),
    prisma.tag.upsert({
      where: { name: 'Full-time' },
      update: {},
      create: { name: 'Full-time' },
    }),
    prisma.tag.upsert({
      where: { name: 'Part-time' },
      update: {},
      create: { name: 'Part-time' },
    }),
  ]);

  console.log('✅ Tags created');

  // Create company type
  const companyType = await prisma.companyType.upsert({
    where: { name: 'Công ty TNHH' },
    update: {},
    create: { name: 'Công ty TNHH' },
  });

  // Create companies
  const companies = await Promise.all([
    prisma.company.upsert({
      where: { id: 'company-1' },
      update: {},
      create: {
        id: 'company-1',
        name: 'TechViet Solutions',
        size: '100-500',
        nation: 'Việt Nam',
        description: 'Công ty công nghệ hàng đầu Việt Nam',
        address: 'Hà Nội',
        typeId: companyType.id,
      },
    }),
    prisma.company.upsert({
      where: { id: 'company-2' },
      update: {},
      create: {
        id: 'company-2',
        name: 'Digital Innovation Corp',
        size: '50-100',
        nation: 'Việt Nam',
        description: 'Chuyên về giải pháp số',
        address: 'Hồ Chí Minh',
        typeId: companyType.id,
      },
    }),
    prisma.company.upsert({
      where: { id: 'company-3' },
      update: {},
      create: {
        id: 'company-3',
        name: 'Smart Tech Vietnam',
        size: '20-50',
        nation: 'Việt Nam',
        description: 'Startup công nghệ năng động',
        address: 'Đà Nẵng',
        typeId: companyType.id,
      },
    }),
  ]);

  console.log('✅ Companies created');

  // Create recruiter user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const recruiterUser = await prisma.user.upsert({
    where: { email: 'recruiter@example.com' },
    update: {},
    create: {
      email: 'recruiter@example.com',
      password: hashedPassword,
      role: UserRole.RECRUITER,
    },
  });

  const recruiter = await prisma.recruiter.upsert({
    where: { userId: recruiterUser.id },
    update: {},
    create: {
      userId: recruiterUser.id,
      firstName: 'Nguyễn',
      lastName: 'Văn A',
      phoneNumber: '0123456789',
      companyId: companies[0].id,
    },
  });

  console.log('✅ Recruiter created');

  // Create jobs
  const jobTitles = [
    'Senior Frontend Developer',
    'Backend Engineer',
    'Full Stack Developer',
    'DevOps Engineer',
    'Data Scientist',
    'Mobile Developer',
    'UI/UX Designer',
    'Product Manager',
    'QA Engineer',
    'System Administrator',
  ];

  for (let i = 0; i < 27; i++) {
    const company = companies[i % companies.length];
    const city = cities[i % cities.length];
    const title = jobTitles[i % jobTitles.length];

    await prisma.job.create({
      data: {
        title: `${title} ${i + 1}`,
        description: `Chúng tôi đang tìm kiếm ${title} có kinh nghiệm để tham gia đội ngũ phát triển sản phẩm. Đây là cơ hội tuyệt vời để làm việc với các công nghệ hiện đại và đội ngũ chuyên nghiệp.`,
        headcount: Math.floor(Math.random() * 5) + 1,
        minSalary: (Math.floor(Math.random() * 20) + 10) * 1000000,
        maxSalary: (Math.floor(Math.random() * 20) + 30) * 1000000,
        currency: Currency.VND,
        status: JobStatus.PUBLISHED,
        companyId: company.id,
        recruiterId: recruiter.id,
        cityId: city.id,
        tags: {
          connect: [
            { id: tags[0].id },
            { id: tags[1].id },
          ],
        },
        skills: {
          connect: [
            { id: skills[i % skills.length].id },
            { id: skills[(i + 1) % skills.length].id },
          ],
        },
      },
    });
  }

  console.log('✅ Jobs created');
  console.log('🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
