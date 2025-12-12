# 🛠️ Setup & Installation Guide - CraftMarket

Dokumentasi lengkap untuk menjalankan CraftMarket di local machine atau production.

---

## 📋 **Persyaratan (Requirements)**

### **1. Node.js & NPM**
- **Node.js**: v18+ (LTS recommended)
- **NPM**: v9+ (comes with Node.js)

**Cek versi:**
```bash
node --version
npm --version
```

**Download:** https://nodejs.org/

---

### **2. MongoDB Database**

CraftMarket menggunakan MongoDB untuk database. Ada 2 pilihan:

#### **Option A: MongoDB Cloud (Recommended)**
1. Buat akun di https://www.mongodb.com/cloud/atlas
2. Buat cluster gratis (M0 tier)
3. Dapatkan connection string: `mongodb+srv://username:password@cluster.mongodb.net/craftmarket`

#### **Option B: MongoDB Local**
```bash
# Windows
# Download dari https://www.mongodb.com/try/download/community
# Install dan jalankan MongoDB service

# Atau gunakan Docker:
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Connection string:
mongodb://localhost:27017/craftmarket
```

---

### **3. Git (Optional, untuk push ke GitHub)**
**Download:** https://git-scm.com/

---

## ⚡ **Quick Start**

### **Step 1: Clone Repository**
```bash
git clone https://github.com/your-username/craftmarket.git
cd craftmarket
```

### **Step 2: Install Dependencies**
```bash
npm install
```

### **Step 3: Setup Environment Variables**
Buat file `.env.local` di root project:

```bash
# Copy dari template
cp .env.example .env.local

# Edit .env.local dengan text editor
```

**Edit `.env.local`:**
```
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/craftmarket?retryWrites=true&w=majority
NODE_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### **Step 4: Run Development Server**
```bash
npm run dev
```

**Server berjalan di:** http://localhost:3000

---

## 📁 **Project Structure**

```
craftmarket/
├── src/
│   ├── app/
│   │   ├── api/              ← Backend API Routes
│   │   ├── products/         ← Product pages
│   │   ├── seller/           ← Seller dashboard
│   │   ├── checkout/         ← Checkout page
│   │   ├── cart/             ← Cart page
│   │   ├── login/            ← Login page
│   │   ├── register/         ← Register page
│   │   └── ...
│   ├── models/               ← MongoDB Schemas
│   │   ├── User.ts
│   │   ├── Product.ts
│   │   ├── Order.ts
│   │   ├── Review.ts
│   │   └── ...
│   ├── components/           ← Reusable Components
│   ├── lib/                  ← Utilities (MongoDB connection)
│   └── types/                ← TypeScript Types
├── public/                   ← Static files (images, etc)
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── .env.example              ← Environment template
├── .env.local                ← Your local environment (git ignored)
└── README.md
```

---

## 🚀 **Build & Production**

### **Build untuk Production:**
```bash
npm run build
npm start
```

### **Deploy ke Vercel (Recommended untuk Next.js):**

1. Push ke GitHub
2. Masuk ke https://vercel.com
3. Connect GitHub repository
4. Set environment variables di Vercel dashboard:
   ```
   MONGODB_URI = your-mongodb-uri
   ```
5. Deploy!

**Vercel secara otomatis handle build dan deployment**

---

## 🔑 **Environment Variables Penjelasan**

| Variable | Wajib? | Penjelasan |
|----------|--------|-----------|
| `MONGODB_URI` | ✅ | Connection string ke MongoDB database |
| `NODE_ENV` | ❌ | development / production (auto terdeteksi) |
| `NEXT_PUBLIC_API_URL` | ❌ | Base URL untuk API calls (optional) |

**⚠️ PENTING:** 
- Jangan commit `.env.local` ke GitHub
- `.env.local` sudah di `.gitignore`
- Gunakan `.env.example` sebagai template

---

## 📦 **Dependencies Overview**

```json
{
  "next": "16.0.1",           // React framework
  "react": "19.2.0",          // UI library
  "mongoose": "^9.0.0",       // MongoDB ORM
  "bcryptjs": "^3.0.3",       // Password hashing
  "jsonwebtoken": "^9.0.2",   // JWT authentication
  "tailwindcss": "^4",        // CSS framework
  "lucide-react": "^0.554.0"  // Icon library
}
```

---

## ✅ **Testing Checklist**

Sebelum push ke GitHub atau production, pastikan:

- [ ] `npm run dev` berjalan tanpa error
- [ ] http://localhost:3000 bisa diakses
- [ ] MongoDB terkoneksi (check di browser console)
- [ ] Bisa register user baru
- [ ] Bisa login
- [ ] Bisa browse products
- [ ] Bisa add to cart
- [ ] Bisa submit review
- [ ] Rating update di product card
- [ ] Seller dashboard ter-update

---

## 🐛 **Troubleshooting**

### **Error: "MONGODB_URI is not defined"**
```
✅ Solution: Pastikan .env.local ada dan MONGODB_URI terisi
```

### **Port 3000 sudah digunakan**
```bash
# Gunakan port berbeda:
npm run dev -- -p 3001
```

### **MongoDB connection timeout**
```
✅ Pastikan:
  - MongoDB server running
  - Connection string benar
  - Whitelist IP address (jika MongoDB Cloud)
```

### **Build error: "Type errors found"**
```bash
# Fix: jalankan linter
npm run lint

# Atau fix automatic
npm run lint -- --fix
```

---

## 📝 **Git Setup untuk GitHub**

### **Initialize & Push ke GitHub:**

```bash
# Initialize git (jika belum)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: CraftMarket e-commerce platform"

# Add remote repository
git remote add origin https://github.com/your-username/craftmarket.git

# Push ke GitHub
git push -u origin main
```

### **`.gitignore` sudah include:**
- `node_modules/`
- `.env.local`
- `.next/`
- `out/`
- `build/`

---

## 🔐 **Security Notes**

✅ **Sudah diimplementasi:**
- JWT token authentication
- Password hashing dengan bcryptjs
- Environment variables untuk sensitive data
- Protected API routes

⚠️ **Untuk production:**
- Update `NEXT_PUBLIC_API_URL` ke domain production
- Enable HTTPS
- Set strong database password
- Use database backup
- Monitor logs

---

## 📞 **Support & Documentation**

- **Next.js Docs:** https://nextjs.org/docs
- **MongoDB Docs:** https://docs.mongodb.com/
- **Tailwind CSS:** https://tailwindcss.com/docs
- **Mongoose:** https://mongoosejs.com/docs

---

## 📄 **License**

Private project - Gunakan untuk keperluan akademik/personal

---

**Happy coding! 🚀**
