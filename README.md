# JobConnect - Nền tảng Tìm kiếm Việc làm & Tuyển dụng

JobConnect là một nền tảng tìm kiếm việc làm và tuyển dụng hiện đại, được xây dựng với NestJS, Next.js, PostgreSQL và TypeScript.

## 🚀 Tính năng chính

### Dành cho Ứng viên
- ✅ Đăng ký và đăng nhập với xác thực JWT
- ✅ Tìm kiếm việc làm với bộ lọc nâng cao (địa điểm, loại công việc, mức lương)
- ✅ Xem chi tiết công việc với thông tin đầy đủ
- ✅ Ứng tuyển công việc với CV
- ✅ Quản lý CV (tải lên, xóa, đặt mặc định)
- ✅ Theo dõi trạng thái đơn ứng tuyển
- ✅ Quản lý hồ sơ cá nhân

### Dành cho Nhà tuyển dụng
- ✅ Đăng tin tuyển dụng
- ✅ Quản lý công ty
- ✅ Xem và quản lý đơn ứng tuyển
- ✅ Cập nhật trạng thái đơn ứng tuyển

### Dành cho Admin
- ✅ Quản lý người dùng
- ✅ Xem thống kê và phân tích
- ✅ Quản lý toàn bộ hệ thống

## 🛠️ Công nghệ sử dụng

### Backend
- **NestJS** - Framework Node.js cho backend
- **PostgreSQL** - Cơ sở dữ liệu quan hệ
- **Prisma ORM** - Object-Relational Mapping
- **JWT** - JSON Web Tokens cho xác thực
- **Bcrypt** - Mã hóa mật khẩu
- **Class Validator** - Validation dữ liệu
- **Jest** - Testing framework

### Frontend
- **Next.js 16.2.4** - React framework với SSR
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Icon library
- **React Context** - State management

## 📦 Cài đặt

### Yêu cầu hệ thống
- Node.js 18+ 
- PostgreSQL 14+
- npm hoặc yarn

### 1. Clone repository
```bash
git clone <repository-url>
cd JobConnect_webApp
```

### 2. Cài đặt Backend

```bash
cd backend

# Cài đặt dependencies
npm install

# Cấu hình environment variables
cp .env.example .env
# Chỉnh sửa file .env với thông tin database của bạn

# Chạy migrations
npx prisma migrate dev

# Seed database với dữ liệu mẫu
npx prisma db seed

# Khởi động backend
npm run start:dev
```

Backend sẽ chạy tại: http://localhost:3000

### 3. Cài đặt Frontend

```bash
cd frontend

# Cài đặt dependencies
npm install

# Cấu hình environment variables
# File .env.local đã được tạo với:
# NEXT_PUBLIC_API_URL=http://localhost:3000

# Khởi động frontend
npm run dev
```

Frontend sẽ chạy tại: http://localhost:3001

## 🔐 Tài khoản test

Sau khi seed database, bạn có thể sử dụng các tài khoản sau:

### Ứng viên
- Email: `testuser@example.com`
- Password: `Password123`

### Nhà tuyển dụng
- Email: `recruiter@example.com`
- Password: `Password123`

### Admin
- Email: `admin@example.com`
- Password: `Password123`

## 📚 API Documentation

### Authentication Endpoints
- `POST /auth/register` - Đăng ký tài khoản mới
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Làm mới access token

### Job Endpoints
- `GET /jobs` - Lấy danh sách việc làm (có phân trang và filter)
- `GET /jobs/:id` - Lấy chi tiết việc làm
- `POST /jobs` - Tạo việc làm mới (Recruiter only)
- `PATCH /jobs/:id` - Cập nhật việc làm (Recruiter only)
- `DELETE /jobs/:id` - Xóa việc làm (Recruiter only)

### Application Endpoints
- `GET /applications` - Lấy danh sách đơn ứng tuyển
- `GET /applications/:id` - Lấy chi tiết đơn ứng tuyển
- `POST /applications` - Tạo đơn ứng tuyển mới
- `PATCH /applications/:id/status` - Cập nhật trạng thái (Recruiter only)
- `DELETE /applications/:id` - Rút đơn ứng tuyển

### CV Endpoints
- `GET /candidates/me/cvs` - Lấy danh sách CV
- `POST /candidates/me/cvs` - Tải lên CV mới
- `DELETE /candidates/me/cvs/:id` - Xóa CV
- `POST /candidates/me/cvs/:id/default` - Đặt CV mặc định

### User Endpoints
- `GET /users/me` - Lấy thông tin người dùng hiện tại
- `PATCH /users/me` - Cập nhật thông tin cá nhân

## 🧪 Testing

### Backend Tests
```bash
cd backend

# Chạy tất cả tests
npm run test

# Chạy tests với coverage
npm run test:cov

# Chạy property-based tests
npm run test -- --testPathPattern=property
```

### Test Coverage
- **Overall Coverage**: 92.13%
- **Total Tests**: 490/498 passing (98.4%)
- **Property-based Tests**: 52 properties với 100 iterations mỗi property

## 📁 Cấu trúc thư mục

```
JobConnect_webApp/
├── backend/
│   ├── src/
│   │   ├── auth/              # Authentication module
│   │   ├── common/            # Common utilities, filters, interceptors
│   │   ├── modules/           # Feature modules
│   │   │   ├── admin/
│   │   │   ├── application/
│   │   │   ├── candidate/
│   │   │   ├── company/
│   │   │   ├── cv/
│   │   │   ├── job/
│   │   │   ├── recruiter/
│   │   │   └── user/
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.ts
│   └── test/
├── frontend/
│   ├── app/                   # Next.js app directory
│   │   ├── auth/             # Authentication pages
│   │   ├── jobs/             # Job listing & detail pages
│   │   ├── applications/     # Application pages
│   │   ├── profile/          # Profile & CV management
│   │   ├── dashboard/        # Dashboard page
│   │   └── page.tsx          # Homepage
│   ├── components/           # React components
│   │   ├── jobs/
│   │   └── ui/
│   ├── context/              # React contexts
│   ├── lib/                  # Utilities & API client
│   └── public/
└── .kiro/                    # Kiro specs & configuration
```

## 🔧 Scripts hữu ích

### Backend
```bash
npm run start:dev      # Khởi động development server
npm run build          # Build production
npm run start:prod     # Khởi động production server
npm run test           # Chạy tests
npm run test:cov       # Chạy tests với coverage
npm run lint           # Lint code
npm run format         # Format code với Prettier
```

### Frontend
```bash
npm run dev            # Khởi động development server
npm run build          # Build production
npm run start          # Khởi động production server
npm run lint           # Lint code
```

## 🌟 Tính năng nổi bật

### 1. Tìm kiếm thông minh
- Tìm kiếm theo từ khóa (vị trí, công ty, kỹ năng)
- Lọc theo địa điểm, loại công việc, mức lương
- Hiển thị kết quả theo thời gian thực

### 2. Quản lý CV hiệu quả
- Tải lên nhiều CV
- Đặt CV mặc định
- Validation file (PDF, DOC, DOCX, max 5MB)

### 3. Theo dõi đơn ứng tuyển
- Xem trạng thái đơn ứng tuyển (Đã ứng tuyển, Đang xem xét, Đã chấp nhận, Đã từ chối)
- Rút đơn ứng tuyển
- Lịch sử ứng tuyển đầy đủ

### 4. Bảo mật cao
- JWT authentication với access & refresh tokens
- Password hashing với bcrypt
- Rate limiting cho auth endpoints
- Role-based access control (RBAC)

### 5. UI/UX hiện đại
- Responsive design
- Toast notifications
- Loading states
- Error handling
- Vietnamese language

## 📝 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/jobconnect-db"
JWT_SECRET="your-secret-key-minimum-32-characters-long"
JWT_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
GEMINI_API_KEY="your-gemini-api-key"
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### Backend không khởi động được
1. Kiểm tra PostgreSQL đã chạy chưa
2. Kiểm tra DATABASE_URL trong .env
3. Chạy `npx prisma migrate dev` để tạo database schema

### Frontend không kết nối được với Backend
1. Kiểm tra Backend đang chạy tại port 3000
2. Kiểm tra NEXT_PUBLIC_API_URL trong .env.local
3. Kiểm tra CORS settings trong backend

### Không đăng nhập được
1. Kiểm tra password có đúng format không (8+ ký tự, có chữ hoa, chữ thường, số)
2. Kiểm tra JWT_SECRET trong backend .env
3. Xóa localStorage và thử lại

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Developed by JobConnect Team

## 📞 Support

For support, email support@jobconnect.vn or create an issue in the repository.

---

**Happy Job Hunting! 🎯**
