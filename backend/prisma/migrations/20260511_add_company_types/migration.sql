-- Insert company types
INSERT INTO "company_types" ("id", "name") VALUES 
  (gen_random_uuid(), 'Công ty TNHH'),
  (gen_random_uuid(), 'Công ty Cổ phần'),
  (gen_random_uuid(), 'Doanh nghiệp tư nhân'),
  (gen_random_uuid(), 'Công ty Đa quốc gia'),
  (gen_random_uuid(), 'Startup'),
  (gen_random_uuid(), 'Công ty Nhà nước'),
  (gen_random_uuid(), 'Công ty Liên doanh'),
  (gen_random_uuid(), 'Chi nhánh'),
  (gen_random_uuid(), 'Văn phòng đại diện'),
  (gen_random_uuid(), 'Tổ chức phi lợi nhuận')
ON CONFLICT ("name") DO NOTHING;