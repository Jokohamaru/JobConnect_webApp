# JobConnect Frontend

Nền tảng tìm kiếm việc làm và tuyển dụng - Frontend Application

## 🚀 Công nghệ sử dụng

- **Next.js 16.2.4** - React Framework với App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **React Query** - Data fetching và state management
- **Lucide React** - Icon library

## 📦 Cài đặt

```bash
npm install
```

## 🔧 Cấu hình

Tạo file `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NODE_ENV=development
```

## 🏃 Chạy ứng dụng

### Development mode
```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3001

### Production build
```bash
npm run build
npm start
```

## 📁 Cấu trúc thư mục

```
frontend/
├── app/                    # Next.js App Router
│   ├── auth/              # Trang xác thực
│   │   ├── login/         # Đăng nhập
│   │   └── register/      # Đăng ký
│   ├── dashboard/         # Bảng điều khiển
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Trang chủ
│   └── providers.tsx      # Context providers
├── components/            # React components
│   └── ui/               # UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── toast.tsx
├── context/              # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utilities
│   ├── api-client.ts     # API client
│   └── utils.ts          # Helper functions
└── public/               # Static files
```

## 🔐 Xác thực

Ứng dụng sử dụng JWT authentication với:
- Access token (15 phút)
- Refresh token (7 ngày)
- LocalStorage để lưu trữ tokens

## 📝 Yêu cầu mật khẩu

Khi đăng ký, mật khẩu phải:
- Ít nhất 8 ký tự
- Chứa ít nhất một chữ hoa (A-Z)
- Chứa ít nhất một chữ thường (a-z)
- Chứa ít nhất một số (0-9)

**Ví dụ mật khẩu hợp lệ:**
- `Password123`
- `MyPass2024`
- `JobConnect1`

## 🎨 Tính năng

### Đã hoàn thành
- ✅ Đăng ký tài khoản
- ✅ Đăng nhập
- ✅ Đăng xuất
- ✅ Quản lý phiên đăng nhập
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Bảng điều khiển cơ bản

### Sắp ra mắt
- 🔄 Tìm kiếm việc làm
- 🔄 Quản lý hồ sơ ứng tuyển
- 🔄 Theo dõi đơn ứng tuyển
- 🔄 Quản lý CV
- 🔄 Thông báo real-time

## 🔗 API Endpoints

Backend API chạy tại: http://localhost:3000

### Authentication
- `POST /auth/register` - Đăng ký
- `POST /auth/login` - Đăng nhập
- `POST /auth/refresh` - Refresh token

### User
- `GET /users/me` - Lấy thông tin user hiện tại
- `PATCH /users/me` - Cập nhật thông tin

## 🐛 Troubleshooting

### Port đã được sử dụng
Nếu port 3001 đã được sử dụng, thay đổi trong `package.json`:
```json
"dev": "next dev -p 3002"
```

### Lỗi kết nối API
Kiểm tra:
1. Backend đang chạy tại port 3000
2. File `.env.local` có cấu hình đúng
3. CORS được cấu hình đúng ở backend

### Lỗi đăng nhập
- Kiểm tra mật khẩu có đúng yêu cầu
- Kiểm tra email đã được đăng ký
- Xem console để biết chi tiết lỗi

## 📄 License

Private - JobConnect Project
