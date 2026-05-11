# Company API Documentation

## Public Endpoints (không cần authentication)

### 1. Get All Companies
**GET** `/companies`

Lấy danh sách tất cả các công ty với phân trang và tìm kiếm.

**Query Parameters:**
- `page` (optional): Số trang (mặc định: 1)
- `pageSize` (optional): Số lượng công ty mỗi trang (mặc định: 20)
- `search` (optional): Tìm kiếm theo tên hoặc mô tả công ty

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Tên công ty",
      "size": "100-500",
      "nation": "Việt Nam",
      "description": "Mô tả công ty",
      "address": "Địa chỉ",
      "logoUrl": "/uploads/companies/logo.png",
      "websiteUrl": "https://company.com",
      "typeId": "uuid",
      "type": {
        "id": "uuid",
        "name": "Product"
      },
      "_count": {
        "jobs": 10
      },
      "createdAt": "2026-05-11T00:00:00.000Z",
      "updatedAt": "2026-05-11T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5
}
```

### 2. Get Company Detail
**GET** `/companies/:id`

Lấy thông tin chi tiết của một công ty, bao gồm danh sách việc làm đang tuyển.

**Response:**
```json
{
  "id": "uuid",
  "name": "Tên công ty",
  "size": "100-500",
  "nation": "Việt Nam",
  "description": "Mô tả công ty",
  "address": "Địa chỉ",
  "logoUrl": "/uploads/companies/logo.png",
  "websiteUrl": "https://company.com",
  "typeId": "uuid",
  "type": {
    "id": "uuid",
    "name": "Product"
  },
  "jobs": [
    {
      "id": "uuid",
      "title": "Senior Backend Developer",
      "city": {
        "id": "uuid",
        "name": "Hà Nội"
      },
      "tags": [
        {
          "id": "uuid",
          "name": "Remote"
        }
      ],
      "skills": [
        {
          "id": "uuid",
          "name": "Node.js"
        }
      ]
    }
  ],
  "skills": ["Node.js", "React", "TypeScript"],
  "createdAt": "2026-05-11T00:00:00.000Z",
  "updatedAt": "2026-05-11T00:00:00.000Z"
}
```

---

## Admin Endpoints (yêu cầu ADMIN role)

### 1. Get Companies Stats
**GET** `/admin/companies/stats`

Lấy thống kê về công ty.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "totalCompanies": 100,
  "newCompanies": 5,
  "activeCompanies": 80,
  "companiesWithWebsite": 90
}
```

### 2. Get All Companies (Admin)
**GET** `/admin/companies`

Lấy danh sách công ty với thông tin chi tiết cho admin.

**Headers:**
- `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (optional): Số trang (mặc định: 1)
- `limit` (optional): Số lượng công ty mỗi trang (mặc định: 10)
- `search` (optional): Tìm kiếm theo tên công ty

**Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Tên công ty",
      "size": "100-500",
      "nation": "Việt Nam",
      "address": "Địa chỉ",
      "logoUrl": "/uploads/companies/logo.png",
      "websiteUrl": "https://company.com",
      "type": "Product",
      "jobsCount": 10,
      "recruitersCount": 5,
      "createdAt": "2026-05-11T00:00:00.000Z"
    }
  ],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

### 3. Get Company Types
**GET** `/admin/companies/types`

Lấy danh sách các loại công ty.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Product"
  },
  {
    "id": "uuid",
    "name": "Outsourcing"
  }
]
```

### 4. Create Company
**POST** `/admin/companies`

Tạo công ty mới.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (form-data):**
- `name` (required): Tên công ty
- `size` (optional): Quy mô công ty (vd: "100-500")
- `nation` (optional): Quốc gia
- `description` (optional): Mô tả công ty
- `address` (optional): Địa chỉ
- `websiteUrl` (optional): Website URL
- `typeId` (optional): ID loại công ty
- `logo` (optional): File ảnh logo (jpg, jpeg, png, gif, max 5MB)

**Response:**
```json
{
  "id": "uuid",
  "name": "Tên công ty",
  "logoUrl": "/uploads/companies/logo.png",
  "type": "Product"
}
```

### 5. Get Company By ID (Admin)
**GET** `/admin/companies/:id`

Lấy thông tin chi tiết công ty cho admin.

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": "uuid",
  "name": "Tên công ty",
  "size": "100-500",
  "nation": "Việt Nam",
  "description": "Mô tả công ty",
  "address": "Địa chỉ",
  "logoUrl": "/uploads/companies/logo.png",
  "websiteUrl": "https://company.com",
  "type": {
    "id": "uuid",
    "name": "Product"
  },
  "jobsCount": 10,
  "recruitersCount": 5,
  "createdAt": "2026-05-11T00:00:00.000Z",
  "updatedAt": "2026-05-11T00:00:00.000Z"
}
```

### 6. Update Company
**PUT** `/admin/companies/:id`

Cập nhật thông tin công ty.

**Headers:**
- `Authorization: Bearer <token>`
- `Content-Type: multipart/form-data`

**Body (form-data):**
- `name` (optional): Tên công ty
- `size` (optional): Quy mô công ty
- `nation` (optional): Quốc gia
- `description` (optional): Mô tả công ty
- `address` (optional): Địa chỉ
- `websiteUrl` (optional): Website URL
- `typeId` (optional): ID loại công ty
- `logo` (optional): File ảnh logo mới (jpg, jpeg, png, gif, max 5MB)

**Response:**
```json
{
  "id": "uuid",
  "name": "Tên công ty",
  "size": "100-500",
  "nation": "Việt Nam",
  "description": "Mô tả công ty",
  "address": "Địa chỉ",
  "logoUrl": "/uploads/companies/logo-new.png",
  "websiteUrl": "https://company.com",
  "type": "Product"
}
```

### 7. Delete Company
**DELETE** `/admin/companies/:id`

Xóa công ty (soft delete).

**Headers:**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Xóa công ty thành công"
}
```

**Lưu ý:**
- Không thể xóa công ty nếu còn việc làm đang hoạt động
- Không thể xóa công ty nếu còn nhà tuyển dụng

---

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": ["Validation error messages"],
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "Forbidden resource"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Không tìm thấy công ty"
}
```

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Tên công ty đã tồn tại trong hệ thống"
}
```
