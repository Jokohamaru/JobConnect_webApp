# 🚀 JobConnect - Hướng dẫn Khởi động Nhanh

## ⚡ Khởi động trong 3 bước

### Bước 1: Khởi động Backend
```bash
cd backend
npm run start:dev
```
✅ Backend chạy tại: **http://localhost:3000**

### Bước 2: Khởi động Frontend
```bash
cd frontend
npm run dev
```
✅ Frontend chạy tại: **http://localhost:3001**

### Bước 3: Truy cập ứng dụng
Mở trình duyệt và truy cập: **http://localhost:3001**

---

## 🔑 Tài khoản Test

### Ứng viên (Candidate)
- **Email**: `testuser@example.com`
- **Password**: `Password123`

### Nhà tuyển dụng (Recruiter)
- **Email**: `recruiter@example.com`
- **Password**: `Password123`

### Quản trị viên (Admin)
- **Email**: `admin@example.com`
- **Password**: `Password123`

---

## 🎯 Các tính năng có thể thử ngay

### 1. Tìm kiếm việc làm
1. Truy cập trang chủ
2. Nhập từ khóa vào ô tìm kiếm (ví dụ: "Developer", "Marketing")
3. Chọn địa điểm (Hà Nội, TP.HCM, v.v.)
4. Click "Tìm Kiếm"

### 2. Xem chi tiết công việc
1. Click vào bất kỳ job card nào
2. Xem thông tin chi tiết: mô tả, yêu cầu, lương, địa điểm
3. Click "Ứng tuyển ngay"

### 3. Đăng ký tài khoản
1. Click "Đăng ký" ở góc phải trên
2. Điền thông tin:
   - Email
   - Mật khẩu (tối thiểu 8 ký tự, có chữ hoa, chữ thường, số)
   - Họ tên
   - Vai trò (Candidate/Recruiter)
3. Click "Đăng ký"

### 4. Đăng nhập
1. Click "Đăng nhập"
2. Nhập email và password
3. Click "Đăng nhập"

### 5. Ứng tuyển công việc
1. Đăng nhập với tài khoản Candidate
2. Tìm và chọn công việc
3. Click "Ứng tuyển ngay"
4. Chọn CV (hoặc tải lên CV mới)
5. Click "Gửi đơn ứng tuyển"

### 6. Quản lý CV
1. Đăng nhập với tài khoản Candidate
2. Vào "Bảng điều khiển" → "Quản lý CV"
3. Tải lên CV mới (PDF, DOC, DOCX, max 5MB)
4. Đặt CV mặc định
5. Xóa CV không cần thiết

### 7. Theo dõi đơn ứng tuyển
1. Đăng nhập với tài khoản Candidate
2. Vào "Đơn ứng tuyển"
3. Xem trạng thái các đơn:
   - Đã ứng tuyển
   - Đang xem xét
   - Đã chấp nhận
   - Đã từ chối
4. Rút đơn nếu cần

### 8. Quản lý hồ sơ
1. Đăng nhập
2. Vào "Bảng điều khiển" → "Thông tin cá nhân"
3. Cập nhật họ tên
4. Click "Lưu thay đổi"

---

## 🔍 Bộ lọc tìm kiếm nâng cao

### Lọc theo địa điểm
- Hà Nội
- TP. Hồ Chí Minh
- Đà Nẵng
- Cần Thơ
- Hải Phòng

### Lọc theo loại công việc
- Toàn thời gian (Full-time)
- Bán thời gian (Part-time)
- Hợp đồng (Contract)
- Thực tập (Internship)

### Lọc theo mức lương
- Dưới 10 triệu
- 10-15 triệu
- 15-20 triệu
- 20-30 triệu
- Trên 30 triệu

---

## 📱 Các trang chính

### Trang công khai (không cần đăng nhập)
- **Trang chủ**: `/`
- **Danh sách việc làm**: `/jobs`
- **Chi tiết việc làm**: `/jobs/:id`
- **Đăng nhập**: `/auth/login`
- **Đăng ký**: `/auth/register`

### Trang yêu cầu đăng nhập
- **Bảng điều khiển**: `/dashboard`
- **Ứng tuyển**: `/jobs/:id/apply`
- **Đơn ứng tuyển**: `/applications`
- **Hồ sơ cá nhân**: `/profile`
- **Quản lý CV**: `/profile/cvs`

---

## 🎨 Giao diện

### Trang chủ
- Hero section với search box lớn
- Popular categories (IT, Marketing, Tài chính, v.v.)
- Top cities (Hà Nội, TP.HCM, Đà Nẵng, Cần Thơ)
- Features section
- Call-to-action section
- Footer với links

### Trang tìm việc
- Sidebar filters (có thể ẩn/hiện)
- Job cards với:
  - Company logo
  - Job title
  - Company name
  - Salary (highlighted in green)
  - Location
  - Job type
  - Tags/skills
  - Time posted
- Load more button
- Sort options

### Trang chi tiết việc làm
- Company logo và info
- Job title
- Detailed information:
  - Location
  - Salary range
  - Job type
  - Posted date
  - Required skills (tags)
  - Full description
- Apply button (prominent)

---

## 🛠️ Troubleshooting

### Không thể đăng nhập?
✅ Kiểm tra password có đúng format:
- Tối thiểu 8 ký tự
- Có chữ HOA
- Có chữ thường
- Có số

### Không thấy việc làm?
✅ Kiểm tra:
- Backend đang chạy tại port 3000
- Database đã được seed
- Thử xóa bộ lọc

### Không ứng tuyển được?
✅ Kiểm tra:
- Đã đăng nhập chưa
- Đã có CV chưa (vào Quản lý CV để tải lên)
- Chưa ứng tuyển công việc này trước đó

### Lỗi kết nối?
✅ Kiểm tra:
- Backend chạy tại: http://localhost:3000
- Frontend chạy tại: http://localhost:3001
- File `.env.local` có `NEXT_PUBLIC_API_URL=http://localhost:3000`

---

## 📞 Cần trợ giúp?

### Xem logs
```bash
# Backend logs
cd backend
npm run start:dev

# Frontend logs
cd frontend
npm run dev
```

### Reset database
```bash
cd backend
npx prisma migrate reset
npx prisma db seed
```

### Clear browser cache
1. Mở DevTools (F12)
2. Application → Storage → Clear site data
3. Refresh trang (Ctrl+R)

---

## 🎉 Chúc bạn trải nghiệm tốt!

Nếu gặp vấn đề, hãy kiểm tra:
1. ✅ Backend đang chạy
2. ✅ Frontend đang chạy
3. ✅ Database đã được seed
4. ✅ Environment variables đúng

**Happy Job Hunting! 💼**
