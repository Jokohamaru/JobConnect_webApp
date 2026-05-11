# ✅ Verification Checklist - Company Module

## Hướng dẫn kiểm tra module Company đã hoàn thiện

---

## 🔍 1. Backend Build & Compilation

```bash
cd backend
npm run build
```

**Expected:** ✅ Build successful, no errors

---

## 🔍 2. Start Backend Server

```bash
cd backend
npm run start:dev
```

**Expected:** ✅ Server running on http://localhost:3000

---

## 🔍 3. Test Public Endpoints

### 3.1. Get All Companies
```bash
GET http://localhost:3000/companies?page=1&pageSize=20
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Response có: data, total, page, pageSize, totalPages
- ✅ Mỗi company có: id, name, type, _count.jobs, etc.

### 3.2. Get Company Detail
```bash
GET http://localhost:3000/companies/{company-id}
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Response có: company info, jobs array, skills array
- ✅ Jobs có: city, tags, skills

---

## 🔍 4. Test Admin Endpoints (Cần Admin Token)

### 4.1. Login as Admin
```bash
POST http://localhost:3000/auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Response có: accessToken
- ✅ Copy token để dùng cho các request sau

### 4.2. Get Companies Stats
```bash
GET http://localhost:3000/admin/companies/stats
Authorization: Bearer {your-admin-token}
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Response có: totalCompanies, newCompanies, activeCompanies, companiesWithWebsite

### 4.3. Get Company Types
```bash
GET http://localhost:3000/admin/companies/types
Authorization: Bearer {your-admin-token}
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Response là array of types: [{ id, name }, ...]

### 4.4. Create Company (without logo)
```bash
POST http://localhost:3000/admin/companies
Authorization: Bearer {your-admin-token}
Content-Type: application/json

{
  "name": "Test Company",
  "size": "50-100",
  "nation": "Việt Nam",
  "description": "Test description",
  "address": "Hà Nội",
  "websiteUrl": "https://testcompany.com",
  "typeId": "{type-id-from-step-4.3}"
}
```

**Expected:**
- ✅ Status: 201 Created
- ✅ Response có: id, name, logoUrl, type
- ✅ Save company ID để dùng cho các test sau

### 4.5. Create Company (with logo) - Dùng Postman
```bash
POST http://localhost:3000/admin/companies
Authorization: Bearer {your-admin-token}
Content-Type: multipart/form-data

Form Data:
- name: "Test Company 2"
- size: "100-500"
- logo: [select image file]
- typeId: "{type-id}"
```

**Expected:**
- ✅ Status: 201 Created
- ✅ Response có logoUrl: "/uploads/companies/..."
- ✅ File được lưu trong backend/uploads/companies/

### 4.6. Get Company by ID (Admin)
```bash
GET http://localhost:3000/admin/companies/{company-id-from-4.4}
Authorization: Bearer {your-admin-token}
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Response có: full company info, jobsCount, recruitersCount

### 4.7. Update Company (without logo)
```bash
PUT http://localhost:3000/admin/companies/{company-id-from-4.4}
Authorization: Bearer {your-admin-token}
Content-Type: application/json

{
  "description": "Updated description",
  "size": "100-200"
}
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Response có updated data

### 4.8. Update Company (with logo) - Dùng Postman
```bash
PUT http://localhost:3000/admin/companies/{company-id-from-4.4}
Authorization: Bearer {your-admin-token}
Content-Type: multipart/form-data

Form Data:
- logo: [select new image file]
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Response có logoUrl mới
- ✅ File mới được lưu trong backend/uploads/companies/

### 4.9. Delete Company
```bash
DELETE http://localhost:3000/admin/companies/{company-id-from-4.4}
Authorization: Bearer {your-admin-token}
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Response: { "message": "Xóa công ty thành công" }

### 4.10. Verify Soft Delete
```bash
GET http://localhost:3000/companies/{company-id-from-4.4}
```

**Expected:**
- ✅ Status: 404 Not Found hoặc null
- ✅ Company không hiển thị trong danh sách

---

## 🔍 5. Test Error Cases

### 5.1. Create Company with Duplicate Name
```bash
POST http://localhost:3000/admin/companies
Authorization: Bearer {your-admin-token}
Content-Type: application/json

{
  "name": "Test Company"  // Tên đã tồn tại
}
```

**Expected:**
- ✅ Status: 409 Conflict
- ✅ Message: "Tên công ty đã tồn tại trong hệ thống"

### 5.2. Create Company without Required Fields
```bash
POST http://localhost:3000/admin/companies
Authorization: Bearer {your-admin-token}
Content-Type: application/json

{
  "size": "100-500"  // Thiếu name
}
```

**Expected:**
- ✅ Status: 400 Bad Request
- ✅ Validation errors

### 5.3. Access Admin Endpoint without Token
```bash
GET http://localhost:3000/admin/companies/stats
```

**Expected:**
- ✅ Status: 401 Unauthorized

### 5.4. Upload Invalid File Type
```bash
POST http://localhost:3000/admin/companies
Authorization: Bearer {your-admin-token}
Content-Type: multipart/form-data

Form Data:
- name: "Test"
- logo: [select .pdf or .txt file]
```

**Expected:**
- ✅ Status: 400 Bad Request
- ✅ Error: "Only image files are allowed!"

### 5.5. Upload File Too Large
```bash
POST http://localhost:3000/admin/companies
Authorization: Bearer {your-admin-token}
Content-Type: multipart/form-data

Form Data:
- name: "Test"
- logo: [select file > 5MB]
```

**Expected:**
- ✅ Status: 400 Bad Request
- ✅ Error về file size

---

## 🔍 6. Test Search & Pagination

### 6.1. Search Companies
```bash
GET http://localhost:3000/companies?search=FPT
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Chỉ trả về companies có "FPT" trong name hoặc description

### 6.2. Pagination
```bash
GET http://localhost:3000/companies?page=1&pageSize=5
GET http://localhost:3000/companies?page=2&pageSize=5
```

**Expected:**
- ✅ Status: 200 OK
- ✅ Page 1 có 5 companies
- ✅ Page 2 có 5 companies khác
- ✅ totalPages tính đúng

---

## 🔍 7. Verify File Structure

### 7.1. Check Backend Files
```bash
ls backend/src/modules/company/
ls backend/src/modules/admin/dto/
ls backend/uploads/companies/
```

**Expected:**
```
✅ backend/src/modules/company/
   - company.controller.ts
   - company.service.ts
   - company.module.ts
   - COMPANY_API.md
   - CHANGELOG.md
   - README.md
   - company.examples.http

✅ backend/src/modules/admin/dto/
   - create-company.dto.ts
   - update-company.dto.ts

✅ backend/uploads/companies/
   - .gitkeep
   - [uploaded logo files]
```

### 7.2. Check Documentation
```bash
cat backend/src/modules/company/COMPANY_API.md
cat backend/src/modules/company/README.md
cat backend/src/modules/company/CHANGELOG.md
```

**Expected:**
- ✅ Files tồn tại
- ✅ Nội dung đầy đủ
- ✅ Format đúng markdown

---

## 🔍 8. Verify Database

### 8.1. Check Company Types
```bash
npx prisma studio
```

**Expected:**
- ✅ Table `company_types` có data
- ✅ Có các types: Product, Outsourcing, etc.

### 8.2. Check Companies
**Expected:**
- ✅ Table `companies` có data
- ✅ Các field đầy đủ: id, name, size, nation, description, address, logoUrl, websiteUrl, typeId, createdAt, updatedAt, deletedAt
- ✅ Deleted companies có deletedAt != null

---

## 🔍 9. Code Quality

### 9.1. TypeScript Compilation
```bash
cd backend
npm run build
```

**Expected:**
- ✅ No TypeScript errors
- ✅ Build successful

### 9.2. Linting
```bash
cd backend
npm run lint
```

**Expected:**
- ✅ No linting errors

---

## 🔍 10. Documentation

### 10.1. Check API Documentation
```bash
cat backend/src/modules/company/COMPANY_API.md
```

**Expected:**
- ✅ Có mô tả tất cả 9 endpoints
- ✅ Có request/response examples
- ✅ Có error responses

### 10.2. Check Examples
```bash
cat backend/src/modules/company/company.examples.http
```

**Expected:**
- ✅ Có 19+ examples
- ✅ Có test workflow
- ✅ Có error cases

---

## ✅ Final Checklist

- [ ] Backend build successful
- [ ] Server starts without errors
- [ ] Public endpoints work
- [ ] Admin endpoints work (with auth)
- [ ] Create company works (with/without logo)
- [ ] Update company works (with/without logo)
- [ ] Delete company works (soft delete)
- [ ] Search works
- [ ] Pagination works
- [ ] Error handling works
- [ ] File upload validation works
- [ ] Duplicate name validation works
- [ ] Soft delete verified
- [ ] Files structure correct
- [ ] Documentation complete
- [ ] Database schema correct
- [ ] No TypeScript errors
- [ ] No linting errors

---

## 🎉 Success Criteria

Nếu tất cả các test trên đều **PASS**, module Company đã hoàn thiện thành công! ✅

---

## 📞 Troubleshooting

### Issue: Cannot upload file
**Solution:** 
- Check thư mục `backend/uploads/companies/` tồn tại
- Check permissions của thư mục
- Check multer configuration

### Issue: 401 Unauthorized
**Solution:**
- Check admin token còn valid
- Check JWT_SECRET trong .env
- Re-login để lấy token mới

### Issue: 409 Duplicate name
**Solution:**
- Check database có company với tên đó chưa
- Dùng tên khác
- Xóa company cũ trước

### Issue: Cannot delete company
**Solution:**
- Check company có jobs hoặc recruiters không
- Xóa jobs và recruiters trước
- Hoặc dùng company khác để test

---

**Date:** 11/05/2026  
**Version:** 1.0.0
