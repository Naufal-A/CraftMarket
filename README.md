# CraftMarket - E-Commerce Platform

Platform e-commerce full-stack untuk menjual produk handmade, furniture, dan crafts dengan fitur review, cart, checkout, dan seller dashboard.

## 🛠 Tech Stack

- **Frontend:** React 19 + Next.js 16 (App Router)
- **Styling:** Tailwind CSS 4 + Custom Theme
- **Backend:** Next.js API Routes
- **Database:** MongoDB + Mongoose
- **Auth:** JWT + bcryptjs
- **Icons:** Lucide React
- **Language:** TypeScript

## ✨ Fitur Utama

✅ User Authentication (Register/Login)  
✅ Product Browsing & Search  
✅ Shopping Cart & Checkout  
✅ Payment Integration (Midtrans dummy)  
✅ Order Management  
✅ Product Reviews & Ratings  
✅ Seller Dashboard  
✅ Real-time Order Status Update  

## 📦 Instalasi & Setup

### **Requirement**
- Node.js v18+ 
- MongoDB (Cloud atau Local)
- Git

### **Quick Start**

```bash
# 1. Clone repository
git clone https://github.com/your-username/craftmarket.git
cd craftmarket

# 2. Install dependencies
npm install

# 3. Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan MongoDB URI Anda

# 4. Run development server
npm run dev
```

Akses di: **http://localhost:3000**

📚 Dokumentasi Lengkap

Untuk setup lebih detail, MongoDB setup, deployment, troubleshooting → Baca [SETUP.md](SETUP.md)

Untuk dokumentasi perubahan & perbaikan yang telah dilakukan → Baca [CHANGELOG.md](CHANGELOG.md)

## 🏗 Project Structure

```
src/
├── app/
│   ├── api/              ← Backend API Routes
│   ├── products/         ← Product pages
│   ├── seller/           ← Seller Dashboard
│   ├── checkout/         ← Checkout
│   └── ...
├── models/               ← MongoDB Schemas
├── components/           ← Reusable Components
├── lib/                  ← Utilities
└── types/                ← TypeScript Types
```

## 🚀 Deployment

**Recommended:** [Vercel](https://vercel.com)

```bash
# 1. Push ke GitHub
git push origin main

# 2. Deploy di Vercel
# - Connect GitHub repository
# - Set MONGODB_URI environment variable
# - Deploy!
```

## 📝 Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm start        # Run production build
npm run lint     # Check code quality
```

## 🔐 Environment Variables

| Variable | Wajib | Contoh |
|----------|-------|--------|
| `MONGODB_URI` | ✅ | `mongodb+srv://user:pass@cluster.mongodb.net/craftmarket` |
| `NODE_ENV` | ❌ | `development` |
| `NEXT_PUBLIC_API_URL` | ❌ | `http://localhost:3000` |

Copy dari `.env.example` dan sesuaikan dengan environment Anda.

## 👥 User Roles

1. **Regular User (Pembeli)**
   - Browse & search products
   - Add to cart & checkout
   - Submit reviews & ratings
   - Track orders

2. **Seller**
   - Dashboard dengan stats
   - Add/Edit/Delete products
   - View orders
   - Manage delivery status

## 🔗 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout

### **Products**
- `GET /api/products` - Get all products
- `GET /api/products/[id]` - Get product detail
- `POST /api/products` - Create product (seller)

### **Reviews**
- `GET /api/reviews?productId=xyz` - Get reviews
- `POST /api/reviews` - Submit review

### **Orders**
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create order
- `PATCH /api/orders/[id]` - Update order status

## 🐛 Troubleshooting

**Error: MONGODB_URI is not defined**
→ Pastikan `.env.local` ada dan filled dengan MongoDB connection string

**Port 3000 sudah digunakan**
```bash
npm run dev -- -p 3001
```

**Build error**
```bash
npm run lint -- --fix
```

## 📞 Support

- Baca [SETUP.md](SETUP.md) untuk dokumentasi lengkap
- Check MongoDB connection: https://www.mongodb.com/cloud/atlas
- Next.js docs: https://nextjs.org/docs

---

**Made with ❤️ for e-commerce**

## 🚀 Deployment

### Production Build

```bash
npm run dev
```

## 🔄 Git Workflow

### Commit Convention

```
type(scope): subject
feat(auth): add user authentication
fix(api): handle network errors
docs(readme): update deployment steps
```

### Branch Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: New features
- `fix/*`: Bug fixes


