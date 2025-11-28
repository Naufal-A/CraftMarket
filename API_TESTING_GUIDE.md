# API Testing Guide - CraftMarket

Panduan lengkap untuk test semua database APIs menggunakan Postman atau cURL.

## 1. USERS API

### Register Buyer
**Method:** POST  
**URL:** `http://localhost:3000/api/auth/register`

**Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "buyer@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "buyer"
}
```

**Expected Response (201):**
```json
{
  "message": "User registered successfully",
  "user": {
    "_id": "...",
    "name": "John Doe",
    "email": "buyer@example.com",
    "role": "buyer"
  },
  "token": "eyJhbGc..."
}
```

### Register Seller
**Method:** POST  
**URL:** `http://localhost:3000/api/auth/register`

**Body (JSON):**
```json
{
  "name": "Shop Owner",
  "email": "seller@example.com",
  "password": "password123",
  "confirmPassword": "password123",
  "role": "seller",
  "shopName": "My Craft Shop"
}
```

### Login
**Method:** POST  
**URL:** `http://localhost:3000/api/auth/login`

**Body (JSON):**
```json
{
  "email": "buyer@example.com",
  "password": "password123",
  "role": "buyer"
}
```

---

## 2. PRODUCTS API

### Get All Products
**Method:** GET  
**URL:** `http://localhost:3000/api/products`

**Response:** Array of products

### Get Product by ID
**Method:** GET  
**URL:** `http://localhost:3000/api/products/[productId]`

### Create Product (Seller)
**Method:** POST  
**URL:** `http://localhost:3000/api/products`

**Body (JSON):**
```json
{
  "name": "Wooden Chair",
  "description": "Beautiful handmade wooden chair",
  "price": 250000,
  "category": "Furniture",
  "stock": 10,
  "sellerId": "seller-user-id",
  "image": "data:image/png;base64,iVBORw0KG...",
  "images": []
}
```

**Expected Response (201):**
```json
{
  "message": "Product created successfully",
  "product": {
    "_id": "...",
    "name": "Wooden Chair",
    "price": 250000,
    "images": ["data:image/png;base64,..."],
    ...
  }
}
```

---

## 3. REVIEWS API

### Get Reviews for Product
**Method:** GET  
**URL:** `http://localhost:3000/api/reviews?productId=[productId]`

**Response:**
```json
{
  "reviews": [
    {
      "_id": "...",
      "productId": "...",
      "buyerId": "...",
      "buyerName": "John Doe",
      "rating": 5,
      "comment": "Excellent product! Very satisfied",
      "createdAt": "2025-11-29T10:00:00Z"
    }
  ],
  "averageRating": "4.5",
  "totalReviews": 2
}
```

### Create Review
**Method:** POST  
**URL:** `http://localhost:3000/api/reviews`

**Body (JSON):**
```json
{
  "productId": "product-id-here",
  "buyerId": "buyer-id-here",
  "buyerName": "John Doe",
  "rating": 5,
  "comment": "Excellent product! Very satisfied with the quality and design"
}
```

**Required:**
- Rating: 1-5
- Comment: minimum 10 characters, maximum 500 characters

**Expected Response (201):**
```json
{
  "message": "Review created successfully",
  "review": {
    "_id": "...",
    "productId": "...",
    "rating": 5,
    "comment": "Excellent product!..."
  }
}
```

---

## 4. CART API

### Get User Cart
**Method:** GET  
**URL:** `http://localhost:3000/api/cart?buyerId=[buyerId]`

**Response:**
```json
{
  "_id": "...",
  "buyerId": "buyer-id",
  "items": [
    {
      "productId": "...",
      "productName": "Wooden Chair",
      "price": 250000,
      "quantity": 2,
      "image": "..."
    }
  ],
  "totalPrice": 500000,
  "createdAt": "2025-11-29T10:00:00Z"
}
```

### Add Item to Cart
**Method:** POST  
**URL:** `http://localhost:3000/api/cart`

**Body (JSON):**
```json
{
  "buyerId": "buyer-id-here",
  "productId": "product-id-here",
  "productName": "Wooden Chair",
  "price": 250000,
  "quantity": 2,
  "image": "data:image/png;base64,..."
}
```

**Note:** Jika product sudah ada di cart, quantity akan ditambah otomatis

**Expected Response (201):**
```json
{
  "message": "Item added to cart",
  "cart": {
    "items": [...],
    "totalPrice": 500000
  }
}
```

### Update Cart Item Quantity
**Method:** PUT  
**URL:** `http://localhost:3000/api/cart`

**Body (JSON):**
```json
{
  "buyerId": "buyer-id-here",
  "productId": "product-id-here",
  "quantity": 5
}
```

**Note:** Jika quantity = 0 atau negatif, item akan dihapus dari cart

### Remove Item from Cart
**Method:** DELETE  
**URL:** `http://localhost:3000/api/cart?buyerId=[buyerId]&productId=[productId]`

**Response:**
```json
{
  "message": "Item removed from cart",
  "cart": {
    "items": [...],
    "totalPrice": 250000
  }
}
```

---

## 5. ORDERS API

### Get Orders (Buyer)
**Method:** GET  
**URL:** `http://localhost:3000/api/orders?buyerId=[buyerId]`

### Get Orders (Seller)
**Method:** GET  
**URL:** `http://localhost:3000/api/orders?sellerId=[sellerId]`

### Get Specific Order
**Method:** GET  
**URL:** `http://localhost:3000/api/orders?orderId=[orderId]`

**Response:**
```json
{
  "_id": "...",
  "orderId": "ORD-1732876800000-5234",
  "buyerId": "...",
  "buyerName": "John Doe",
  "buyerEmail": "john@example.com",
  "sellerId": "...",
  "items": [
    {
      "productId": "...",
      "productName": "Wooden Chair",
      "price": 250000,
      "quantity": 2,
      "image": "..."
    }
  ],
  "totalPrice": 500000,
  "status": "pending",
  "shippingAddress": {...},
  "paymentMethod": "Transfer Bank",
  "createdAt": "2025-11-29T10:00:00Z"
}
```

### Create Order
**Method:** POST  
**URL:** `http://localhost:3000/api/orders`

**Body (JSON):**
```json
{
  "buyerId": "buyer-id-here",
  "buyerName": "John Doe",
  "buyerEmail": "john@example.com",
  "sellerId": "seller-id-here",
  "items": [
    {
      "productId": "product-id",
      "productName": "Wooden Chair",
      "price": 250000,
      "quantity": 2,
      "image": "..."
    }
  ],
  "totalPrice": 500000,
  "shippingAddress": {
    "fullName": "John Doe",
    "phone": "081234567890",
    "address": "Jl. Merdeka No. 123",
    "city": "Jakarta",
    "province": "DKI Jakarta",
    "postalCode": "12345"
  },
  "paymentMethod": "Transfer Bank",
  "notes": "Please wrap carefully"
}
```

**Expected Response (201):**
```json
{
  "message": "Order created successfully",
  "order": {
    "orderId": "ORD-1732876800000-5234",
    "status": "pending",
    ...
  }
}
```

### Update Order Status (Seller)
**Method:** PUT  
**URL:** `http://localhost:3000/api/orders`

**Body (JSON):**
```json
{
  "orderId": "ORD-1732876800000-5234",
  "status": "processing",
  "trackingNumber": "JNE-1234567890",
  "notes": "Order sedang diproses"
}
```

**Valid Status:**
- `pending` - Menunggu pembayaran
- `processing` - Sedang diproses
- `shipped` - Sudah dikirim
- `delivered` - Sudah diterima
- `cancelled` - Dibatalkan

### Cancel Order
**Method:** DELETE  
**URL:** `http://localhost:3000/api/orders?orderId=[orderId]`

**Response:**
```json
{
  "message": "Order cancelled",
  "order": {
    "orderId": "...",
    "status": "cancelled"
  }
}
```

---

## Testing Steps dengan Postman

### 1. Setup Environment Variables
Di Postman, buat Environment variable:
- `BASE_URL` = `http://localhost:3000`
- `BUYER_ID` = (dari register buyer)
- `SELLER_ID` = (dari register seller)
- `PRODUCT_ID` = (dari create product)
- `ORDER_ID` = (dari create order)

### 2. Flow Testing

**Step 1: Register Buyer**
```
POST {{BASE_URL}}/api/auth/register
Body: buyer data
Simpan BUYER_ID dari response
```

**Step 2: Register Seller**
```
POST {{BASE_URL}}/api/auth/register
Body: seller data
Simpan SELLER_ID dari response
```

**Step 3: Create Product**
```
POST {{BASE_URL}}/api/products
Body: product data dengan sellerId dari Step 2
Simpan PRODUCT_ID dari response
```

**Step 4: Create Review**
```
POST {{BASE_URL}}/api/reviews
Body: review data dengan productId dari Step 3, buyerId dari Step 1
```

**Step 5: Add to Cart**
```
POST {{BASE_URL}}/api/cart
Body: cart item dengan buyerId, productId
```

**Step 6: Get Cart**
```
GET {{BASE_URL}}/api/cart?buyerId={{BUYER_ID}}
```

**Step 7: Create Order**
```
POST {{BASE_URL}}/api/orders
Body: order data dengan buyerId, sellerId, items
Simpan ORDER_ID dari response
```

**Step 8: Update Order Status**
```
PUT {{BASE_URL}}/api/orders
Body: {orderId, status: "processing"}
```

**Step 9: Get Order**
```
GET {{BASE_URL}}/api/orders?orderId={{ORDER_ID}}
```

---

## Testing dengan cURL

### Register Buyer
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "buyer@example.com",
    "password": "password123",
    "confirmPassword": "password123",
    "role": "buyer"
  }'
```

### Get All Products
```bash
curl http://localhost:3000/api/products
```

### Create Product
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wooden Chair",
    "description": "Beautiful handmade wooden chair",
    "price": 250000,
    "category": "Furniture",
    "stock": 10,
    "sellerId": "seller-id-here"
  }'
```

### Add to Cart
```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json" \
  -d '{
    "buyerId": "buyer-id-here",
    "productId": "product-id-here",
    "productName": "Wooden Chair",
    "price": 250000,
    "quantity": 2
  }'
```

### Create Review
```bash
curl -X POST http://localhost:3000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "productId": "product-id-here",
    "buyerId": "buyer-id-here",
    "buyerName": "John Doe",
    "rating": 5,
    "comment": "Excellent product! Very satisfied with quality"
  }'
```

### Create Order
```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "buyerId": "buyer-id-here",
    "buyerName": "John Doe",
    "buyerEmail": "john@example.com",
    "sellerId": "seller-id-here",
    "items": [{
      "productId": "product-id",
      "productName": "Wooden Chair",
      "price": 250000,
      "quantity": 2
    }],
    "totalPrice": 500000,
    "shippingAddress": {
      "fullName": "John Doe",
      "phone": "081234567890",
      "address": "Jl. Merdeka No. 123",
      "city": "Jakarta",
      "province": "DKI Jakarta",
      "postalCode": "12345"
    },
    "paymentMethod": "Transfer Bank"
  }'
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Missing required fields"
}
```

### 404 Not Found
```json
{
  "error": "Product not found"
}
```

### 500 Server Error
```json
{
  "error": "Failed to create product"
}
```

---

## Tips Testing

1. **Gunakan Postman Collection** - Simpan semua requests untuk reusable
2. **Set Environment Variables** - Lebih mudah swap data
3. **Test Sequential** - Follow flow: Register → Create Product → Add Cart → Create Order
4. **Check MongoDB** - Buka MongoDB Compass untuk verify data di database
5. **Monitor Server Logs** - Terminal akan menampilkan request logs

---

## Database Verification

Untuk verify data langsung di MongoDB:

```bash
# Connect ke MongoDB
mongosh

# Switch to database
use craftmarket

# Check users
db.users.find().pretty()

# Check products
db.products.find().pretty()

# Check orders
db.orders.find().pretty()

# Check cart
db.carts.find().pretty()

# Check reviews
db.reviews.find().pretty()
```
