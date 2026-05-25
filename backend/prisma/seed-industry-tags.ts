import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Industry tags to create
const INDUSTRY_TAG_NAMES = [
  'Kế toán',
  'Marketing',
  'IT - Phần mềm',
  'Kinh doanh',
  'Nhân sự',
  'Logistics',
  'Tài chính - Ngân hàng',
];

// Map job title keywords to industry tags
const TITLE_TO_INDUSTRY: { keywords: string[]; industry: string }[] = [
  {
    keywords: ['frontend', 'backend', 'fullstack', 'full stack', 'developer', 'engineer', 'devops', 'mobile', 'qa', 'system admin', 'data', 'ui/ux', 'designer', 'software'],
    industry: 'IT - Phần mềm',
  },
  {
    keywords: ['marketing', 'seo', 'content', 'brand'],
    industry: 'Marketing',
  },
  {
    keywords: ['product manager', 'business', 'sales', 'kinh doanh'],
    industry: 'Kinh doanh',
  },
  {
    keywords: ['kế toán', 'accountant', 'accounting'],
    industry: 'Kế toán',
  },
  {
    keywords: ['hr', 'nhân sự', 'human resource', 'recruitment'],
    industry: 'Nhân sự',
  },
  {
    keywords: ['logistics', 'supply chain', 'warehouse', 'shipping'],
    industry: 'Logistics',
  },
  {
    keywords: ['finance', 'banking', 'financial', 'tài chính', 'ngân hàng'],
    industry: 'Tài chính - Ngân hàng',
  },
];

async function main() {
  console.log('🌱 Creating industry tags...');

  // Upsert all industry tags
  const industryTags = await Promise.all(
    INDUSTRY_TAG_NAMES.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  console.log('✅ Industry tags created:', industryTags.map((t) => t.name).join(', '));

  // Build a map: tagName -> tag object
  const tagMap = new Map(industryTags.map((t) => [t.name, t]));

  // Fetch all published jobs
  const jobs = await prisma.job.findMany({
    where: { deletedAt: null },
    select: { id: true, title: true, tags: { select: { name: true } } },
  });

  console.log(`📋 Found ${jobs.length} jobs. Assigning industry tags...`);

  let updated = 0;
  for (const job of jobs) {
    const titleLower = job.title.toLowerCase();

    // Find matching industry
    let matchedIndustry: string | null = null;
    for (const mapping of TITLE_TO_INDUSTRY) {
      if (mapping.keywords.some((kw) => titleLower.includes(kw.toLowerCase()))) {
        matchedIndustry = mapping.industry;
        break;
      }
    }

    // Default to IT - Phần mềm if no match (since all seed jobs are tech-related)
    if (!matchedIndustry) {
      matchedIndustry = 'IT - Phần mềm';
    }

    // Check if already has this tag
    const alreadyHasTag = job.tags.some((t) => t.name === matchedIndustry);
    if (!alreadyHasTag) {
      const tag = tagMap.get(matchedIndustry);
      if (tag) {
        await prisma.job.update({
          where: { id: job.id },
          data: {
            tags: {
              connect: { id: tag.id },
            },
          },
        });
        updated++;
        console.log(`  ✓ Job "${job.title}" → tagged as "${matchedIndustry}"`);
      }
    } else {
      console.log(`  ⏭ Job "${job.title}" already has tag "${matchedIndustry}"`);
    }
  }

  console.log(`\n✅ Updated ${updated} jobs with industry tags`);
  console.log('🎉 Industry tag seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
