# Database Setup untuk Login & Register

## Daftar File yang Dibuat

1. **`.env.local`** - Environment variables untuk MongoDB dan JWT
2. **`src/lib/mongodb.ts`** - MongoDB connection helper
3. **`src/models/User.ts`** - User schema dan model dengan Mongoose
4. **`src/app/api/auth/register/route.ts`** - Register API endpoint
5. **`src/app/api/auth/login/route.ts`** - Login API endpoint
6. **`src/app/login/page.tsx`** - Updated login page dengan form handling
7. **`src/app/register/page.tsx`** - Updated register page dengan form handling

## Setup Instructions

### 1. Install MongoDB

**Option A: MongoDB Atlas (Cloud)**
- Buka https://www.mongodb.com/cloud/atlas
- Buat account gratis
- Buat cluster baru
- Copy connection string

**Option B: MongoDB Local**
- Download dari https://www.mongodb.com/try/download/community
- Install MongoDB Community Edition
- MongoDB akan berjalan di `mongodb://localhost:27017`

### 2. Update `.env.local`

```env
MONGODB_URI=mongodb://localhost:27017/craftmarket
JWT_SECRET=your_secret_key_here_change_this_in_production
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 3. Jalankan Development Server

```bash
npm run dev
```

Server akan berjalan di `http://localhost:3000`

## Fitur yang Tersedia

### Register
- Form dengan validation (nama, email, password, konfirmasi password)
- Password hashing dengan bcryptjs
- Email validation
- Check duplikasi email

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Login
- Form dengan validation (email, password)
- Password comparison dengan hashed password
- JWT token generation
- Cookie storage

**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login berhasil",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "buyer"
  },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

## User Schema

```typescript
{
  _id: ObjectId,
  name: String (required),
  email: String (required, unique),
  password: String (required, hashed),
  role: String (enum: 'buyer' | 'seller', default: 'buyer'),
  createdAt: Date,
  updatedAt: Date
}
```

## Fitur Keamanan

✅ Password hashing dengan bcryptjs (salt: 10)
✅ JWT token dengan expiry 7 hari
✅ HTTP-only cookies untuk token storage
✅ Email validation
✅ Required field validation
✅ Duplicate email prevention
✅ Password strength minimum 6 characters

## Testing API

Gunakan Postman atau curl:

### Register:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name":"Test User",
    "email":"test@example.com",
    "password":"password123",
    "confirmPassword":"password123"
  }'
```

### Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"test@example.com",
    "password":"password123"
  }'
```

## Troubleshooting

**Error: "connect ECONNREFUSED"**
- MongoDB service tidak berjalan
- Pastikan MongoDB sudah diinstall dan running

**Error: "Cannot find module 'mongoose'"**
- Jalankan `npm install mongoose bcryptjs jsonwebtoken dotenv`

**Error: "MONGODB_URI is not defined"**
- Pastikan `.env.local` sudah dibuat dengan MONGODB_URI

## Next Steps

1. Tambahkan middleware untuk protected routes
2. Implement logout functionality
3. Tambahkan email verification
4. Implement password reset feature
5. Tambahkan role-based access control (RBAC)
6. Setup social authentication (Google, Facebook)
