# Company Module

Module quản lý thông tin công ty trong hệ thống JobConnect.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Cấu trúc](#cấu-trúc)
- [API Endpoints](#api-endpoints)
- [Database Schema](#database-schema)
- [Sử dụng](#sử-dụng)
- [Tài liệu](#tài-liệu)

## 🎯 Tổng quan

Module Company cung cấp các chức năng:

### Cho Admin:
- ✅ Tạo, sửa, xóa công ty
- ✅ Upload và quản lý logo công ty
- ✅ Phân loại công ty theo type (Product, Outsourcing, etc.)
- ✅ Xem thống kê công ty
- ✅ Tìm kiếm và phân trang

### Cho Public:
- ✅ Xem danh sách công ty
- ✅ Tìm kiếm công ty
- ✅ Xem chi tiết công ty
- ✅ Xem việc làm của công ty
- ✅ Xem skills của công ty

## 📁 Cấu trúc

```
company/
├── company.controller.ts       # Public endpoints
├── company.service.ts          # Business logic cho public
├── company.module.ts           # Module configuration
├── COMPANY_API.md             # API documentation
├── CHANGELOG.md               # Lịch sử thay đổi
├── company.examples.http      # API examples
└── README.md                  # This file

admin/
├── admin.controller.ts        # Admin endpoints (company section)
├── admin.service.ts           # Business logic cho admin
└── dto/
    ├── create-company.dto.ts  # DTO cho tạo công ty
    └── update-company.dto.ts  # DTO cho cập nhật công ty
```

## 🔌 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/companies` | Lấy danh sách công ty |
| GET | `/companies/:id` | Lấy chi tiết công ty |

### Admin Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/admin/companies/stats` | Thống kê công ty | Admin |
| GET | `/admin/companies` | Danh sách công ty (admin) | Admin |
| GET | `/admin/companies/types` | Danh sách loại công ty | Admin |
| POST | `/admin/companies` | Tạo công ty mới | Admin |
| GET | `/admin/companies/:id` | Chi tiết công ty (admin) | Admin |
| PUT | `/admin/companies/:id` | Cập nhật công ty | Admin |
| DELETE | `/admin/companies/:id` | Xóa công ty | Admin |

## 🗄️ Database Schema

### Company Model

```prisma
model Company {
  id            String      @id @default(uuid())
  name          String      // Tên công ty (unique)
  size          String?     // Quy mô (vd: "100-500")
  nation        String?     // Quốc gia
  description   String?     @db.Text
  address       String?     // Địa chỉ
  logoUrl       String?     // Link logo (AWS S3 hoặc local)
  websiteUrl    String?     // Website
  
  typeId        String?
  type          CompanyType? @relation(fields: [typeId], references: [id])
  
  recruiters    Recruiter[]
  jobs          Job[]
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  deletedAt     DateTime?   // Soft delete

  @@map("companies")
}
```

### CompanyType Model

```prisma
model CompanyType {
  id        String    @id @default(uuid())
  name      String    @unique
  companies Company[]

  @@map("company_types")
}
```

## 🚀 Sử dụng

### 1. Import Module

```typescript
import { CompanyModule } from './modules/company/company.module';

@Module({
  imports: [CompanyModule],
})
export class AppModule {}
```

### 2. Sử dụng Service

```typescript
import { CompanyService } from './modules/company/company.service';

@Injectable()
export class SomeService {
  constructor(private companyService: CompanyService) {}

  async getCompanies() {
    return await this.companyService.findAll({
      skip: 0,
      take: 20,
      search: 'FPT',
    });
  }

  async getCompanyDetail(id: string) {
    return await this.companyService.findOne(id);
  }
}
```

### 3. Call API từ Frontend

```typescript
// Get all companies
const response = await fetch('/companies?page=1&pageSize=20');
const { data, total, page, pageSize, totalPages } = await response.json();

// Get company detail
const company = await fetch('/companies/company-id');
const companyData = await company.json();

// Create company (Admin)
const formData = new FormData();
formData.append('name', 'FPT Software');
formData.append('size', '1000+');
formData.append('logo', logoFile);

const response = await fetch('/admin/companies', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${adminToken}`,
  },
  body: formData,
});
```

## 📚 Tài liệu

### Chi tiết API
Xem file [COMPANY_API.md](./COMPANY_API.md) để biết chi tiết về:
- Request/Response format
- Query parameters
- Error responses
- Authentication requirements

### Examples
Xem file [company.examples.http](./company.examples.http) để có các ví dụ:
- Các request mẫu
- Test cases
- Error cases
- Complete workflow

### Changelog
Xem file [CHANGELOG.md](./CHANGELOG.md) để biết:
- Lịch sử thay đổi
- Features đã hoàn thành
- Next steps

## 🔒 Security

### Authentication & Authorization
- Public endpoints: Không cần authentication
- Admin endpoints: Yêu cầu JWT token với ADMIN role

### File Upload
- Chỉ cho phép: jpg, jpeg, png, gif
- Max size: 5MB
- Lưu tại: `backend/uploads/companies/`
- Filename: Unique (timestamp + random)

### Validation
- Tên công ty: Required, unique
- Website URL: Valid URL format
- File type: Image only
- File size: Max 5MB

### Soft Delete
- Công ty bị xóa vẫn còn trong database
- `deletedAt` field được set = current timestamp
- Không hiển thị trong danh sách
- Có thể restore nếu cần

## ⚠️ Lưu ý

### Xóa công ty
Không thể xóa công ty nếu:
- Còn việc làm đang hoạt động
- Còn nhà tuyển dụng

Phải xóa hết jobs và recruiters trước khi xóa company.

### Upload logo
- Logo được lưu local tại `backend/uploads/companies/`
- Trong production nên dùng AWS S3 hoặc CDN
- Cần implement image optimization/resize

### Performance
- Sử dụng pagination cho danh sách
- Index trên các field thường search (name)
- Eager loading relations khi cần thiết

## 🧪 Testing

### Manual Testing
Sử dụng file `company.examples.http` với REST Client extension trong VS Code.

### Unit Testing
```bash
npm run test -- company.service.spec.ts
```

### E2E Testing
```bash
npm run test:e2e -- company.e2e-spec.ts
```

## 🔄 Next Steps

Các tính năng có thể mở rộng:
- [ ] Unit tests
- [ ] E2E tests
- [ ] AWS S3 integration cho logo
- [ ] Image optimization/resize
- [ ] Company verification
- [ ] Company rating/review
- [ ] Bulk operations
- [ ] Advanced filtering
- [ ] Export to CSV/Excel

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng:
1. Xem [COMPANY_API.md](./COMPANY_API.md)
2. Xem [company.examples.http](./company.examples.http)
3. Check [CHANGELOG.md](./CHANGELOG.md)
4. Contact team lead

---

**Version:** 1.0.0  
**Last Updated:** 11/05/2026  
**Author:** Development Team
