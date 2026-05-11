# 🚀 Quick Start - Company Module

## Module Company đã hoàn thiện! Đây là cách sử dụng nhanh.

---

## ⚡ Start Backend

```bash
cd backend
npm run start:dev
```

Server chạy tại: `http://localhost:3000`

---

## 📚 Documentation

### 1. API Reference
📄 **File:** `backend/src/modules/company/COMPANY_API.md`

Mô tả đầy đủ tất cả 9 endpoints với request/response examples.

### 2. API Examples
📄 **File:** `backend/src/modules/company/company.examples.http`

19+ examples để test API với REST Client extension trong VS Code.

### 3. Module Overview
📄 **File:** `backend/src/modules/company/README.md`

Tổng quan về module, cách sử dụng, database schema.

### 4. Complete Summary
📄 **File:** `COMPANY_MODULE_SUMMARY.md`

Tổng kết đầy đủ về những gì đã hoàn thành.

### 5. Verification Checklist
📄 **File:** `VERIFICATION_CHECKLIST.md`

Hướng dẫn chi tiết để verify module hoạt động đúng.

---

## 🔥 Quick Test

### 1. Test Public Endpoint
```bash
curl http://localhost:3000/companies?page=1&pageSize=20
```

### 2. Login as Admin
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

Copy `accessToken` từ response.

### 3. Get Companies Stats
```bash
curl http://localhost:3000/admin/companies/stats \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Create Company
```bash
curl -X POST http://localhost:3000/admin/companies \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Company",
    "size": "50-100",
    "nation": "Việt Nam",
    "description": "Test description",
    "address": "Hà Nội",
    "websiteUrl": "https://testcompany.com"
  }'
```

---

## 📋 API Endpoints Summary

### Public (No Auth)
- `GET /companies` - Danh sách công ty
- `GET /companies/:id` - Chi tiết công ty

### Admin (Require ADMIN role)
- `GET /admin/companies/stats` - Thống kê
- `GET /admin/companies` - Danh sách (admin)
- `GET /admin/companies/types` - Loại công ty
- `POST /admin/companies` - Tạo công ty
- `GET /admin/companies/:id` - Chi tiết (admin)
- `PUT /admin/companies/:id` - Cập nhật
- `DELETE /admin/companies/:id` - Xóa

---

## 🎯 Key Features

✅ **CRUD đầy đủ** - Create, Read, Update, Delete  
✅ **Upload logo** - jpg, jpeg, png, gif (max 5MB)  
✅ **Search** - Tìm kiếm theo tên, mô tả  
✅ **Pagination** - Phân trang với metadata  
✅ **Soft Delete** - Xóa an toàn, có thể restore  
✅ **Validation** - Tên unique, file type, size  
✅ **Security** - JWT auth, role-based authorization  

---

## 🔧 Testing Tools

### Option 1: REST Client (VS Code)
1. Install extension: **REST Client**
2. Open: `backend/src/modules/company/company.examples.http`
3. Click "Send Request" để test

### Option 2: Postman
1. Import examples từ file `.http`
2. Set `baseUrl` = `http://localhost:3000`
3. Set `adminToken` = your JWT token
4. Test các endpoints

### Option 3: curl
Sử dụng các curl commands trong file này.

---

## 📁 Important Files

```
backend/src/modules/
├── company/
│   ├── company.controller.ts      # Public endpoints
│   ├── company.service.ts         # Public logic
│   ├── COMPANY_API.md            # 📚 API docs
│   ├── README.md                 # 📚 Overview
│   └── company.examples.http     # 🧪 Examples
├── admin/
│   ├── admin.controller.ts        # Admin endpoints
│   ├── admin.service.ts           # Admin logic
│   └── dto/
│       ├── create-company.dto.ts  # Create DTO
│       └── update-company.dto.ts  # Update DTO
└── uploads/
    └── companies/                 # Logo storage
```

---

## ⚠️ Important Notes

### 1. Admin Token
Cần login với admin account để lấy token cho admin endpoints.

### 2. Upload Logo
Sử dụng `multipart/form-data` khi upload logo. Dùng Postman hoặc curl với `-F` flag.

### 3. Soft Delete
Company bị xóa vẫn còn trong database với `deletedAt != null`.

### 4. Validation
- Tên công ty phải unique
- Không thể xóa company có jobs hoặc recruiters
- File upload: chỉ image, max 5MB

---

## 🎓 Next Steps

### For Frontend Developers
1. Read `COMPANY_API.md` để hiểu API
2. Use `company.examples.http` để test
3. Integrate với frontend pages

### For Backend Developers
1. Read `README.md` để hiểu architecture
2. Check `CHANGELOG.md` để biết features
3. Extend với features mới nếu cần

### For QA/Testers
1. Follow `VERIFICATION_CHECKLIST.md`
2. Test tất cả endpoints
3. Verify error cases

---

## 📞 Need Help?

### Documentation
- **API Docs:** `backend/src/modules/company/COMPANY_API.md`
- **Overview:** `backend/src/modules/company/README.md`
- **Examples:** `backend/src/modules/company/company.examples.http`
- **Summary:** `COMPANY_MODULE_SUMMARY.md`
- **Checklist:** `VERIFICATION_CHECKLIST.md`

### Common Issues
- **401 Unauthorized:** Check admin token
- **409 Conflict:** Company name already exists
- **400 Bad Request:** Check validation errors
- **Cannot delete:** Company has jobs/recruiters

---

## ✅ Status

**Module Company: COMPLETED ✅**

- ✅ 9 API endpoints
- ✅ Full CRUD operations
- ✅ File upload
- ✅ Authentication & Authorization
- ✅ Validation & Error handling
- ✅ Documentation complete
- ✅ Build successful
- ✅ Production ready

---

**Happy Coding! 🚀**

Date: 11/05/2026  
Version: 1.0.0
