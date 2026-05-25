import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Creating test applications...');

  // Find candidate
  const candidateUser = await prisma.user.findUnique({
    where: { email: 'candidate@example.com' },
    include: { candidate: true },
  });

  if (!candidateUser || !candidateUser.candidate) {
    console.log('❌ Candidate user not found. Run seed-candidate first.');
    return;
  }

  const candidateId = candidateUser.candidate.id;

  // Find candidate's CVs
  const cvs = await prisma.cV.findMany({
    where: { candidateId, deletedAt: null },
  });

  if (cvs.length === 0) {
    console.log('❌ No CVs found for candidate. Run seed-candidate first.');
    return;
  }

  console.log(`✅ Found ${cvs.length} CVs for candidate`);

  // Find published jobs from recruiter
  const publishedJobs = await prisma.job.findMany({
    where: { status: 'PUBLISHED', deletedAt: null },
    take: 5, // Apply to first 5 jobs
    orderBy: { createdAt: 'desc' },
  });

  if (publishedJobs.length === 0) {
    console.log('❌ No published jobs found. Run main seed first.');
    return;
  }

  console.log(`✅ Found ${publishedJobs.length} published jobs`);

  let created = 0;
  for (const job of publishedJobs) {
    // Use alternating CVs
    const cv = cvs[created % cvs.length];

    // Check if application already exists
    const existing = await prisma.application.findFirst({
      where: {
        jobId: job.id,
        cvId: cv.id,
        deletedAt: null,
      },
    });

    if (existing) {
      console.log(`  ⏭️  Already applied to "${job.title}" - skipping`);
      continue;
    }

    await prisma.application.create({
      data: {
        jobId: job.id,
        cvId: cv.id,
      },
    });

    created++;
    console.log(`  ✅ Applied to "${job.title}" with CV "${cv.title}"`);
  }

  console.log(`\n🎉 Created ${created} test applications!`);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
