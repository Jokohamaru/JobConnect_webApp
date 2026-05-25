import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// 50 trending keyword tags for job searching in Vietnam
const TRENDING_TAGS = [
  // Công nghệ thông tin
  'IT - Phần mềm',
  'Lập trình viên',
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'DevOps Engineer',
  'Data Analyst',
  'Data Engineer',
  'Machine Learning',
  'AI - Trí tuệ nhân tạo',
  'An toàn thông tin',
  'Cloud Computing',
  'Mobile Developer',
  'UI/UX Designer',
  'QA - Kiểm thử phần mềm',

  // Tài chính - Ngân hàng - Kế toán
  'Tài chính - Ngân hàng',
  'Kế toán',
  'Kiểm toán',
  'Bảo hiểm',
  'Chứng khoán',

  // Kinh doanh - Bán hàng - Marketing
  'Marketing',
  'Digital Marketing',
  'Kinh doanh',
  'Sale - Bán hàng',
  'Thương mại điện tử',
  'Content Marketing',
  'SEO - SEM',
  'Trade Marketing',

  // Nhân sự - Hành chính
  'Nhân sự',
  'Tuyển dụng',
  'Hành chính - Văn phòng',
  'Pháp lý - Luật',

  // Sản xuất - Kỹ thuật
  'Kỹ thuật - Cơ khí',
  'Điện - Điện tử',
  'Xây dựng - Kiến trúc',
  'Sản xuất - Vận hành',
  'Logistics - Chuỗi cung ứng',
  'Quản lý dự án',

  // Chăm sóc khách hàng - Dịch vụ
  'Chăm sóc khách hàng',
  'Bán lẻ - Tiêu dùng',
  'Du lịch - Nhà hàng - Khách sạn',
  'Y tế - Dược phẩm',
  'Giáo dục - Đào tạo',

  // Sáng tạo - Truyền thông
  'Thiết kế đồ họa',
  'Truyền thông - Báo chí',
  'Quảng cáo',

  // Quản lý cấp cao
  'Giám đốc - Quản lý cấp cao',
  'Quản lý kho',
  'Xuất nhập khẩu',
];

async function main() {
  console.log('🌱 Seeding 50 trending tags...');

  const results = await Promise.all(
    TRENDING_TAGS.map((name) =>
      prisma.tag.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  console.log(`✅ Seeded ${results.length} tags:`);
  results.forEach((tag) => console.log(`  - ${tag.name}`));
  console.log('\n🎉 Trending tags seed completed!');
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
