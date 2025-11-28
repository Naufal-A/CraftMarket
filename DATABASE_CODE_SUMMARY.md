# Database Code Summary - CraftMarket

**Deskripsi:**
Dokumentasi lengkap semua kode backend database CraftMarket dalam satu file referensi. Berisi 5 database models (User, Product, Cart, Order, Review) dan 3 API routes (Cart, Orders, Reviews) dengan penjelasan lengkap struktur, validasi, dan cara penggunaan masing-masing. File ini dibuat sebagai panduan cepat untuk memahami seluruh arsitektur database dan API endpoints sistem e-commerce CraftMarket.

**Isi:**
- **Models (5):** Definisi struktur data dengan Mongoose schemas dan TypeScript interfaces
- **APIs (3):** RESTful endpoints dengan CRUD operations (GET, POST, PUT, DELETE)
- **Database:** MongoDB connection dan collections overview

Semua kode database yang telah dibuat untuk CraftMarket.

---

    ## 1. USER MODEL
    **File:** `src/models/User.ts`

    ```typescript
    import mongoose, { Schema, Document } from "mongoose";
    import bcryptjs from "bcryptjs";

    export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: "buyer" | "seller";
  shopName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["buyer", "seller"],
      default: "buyer",
    },
    shopName: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcryptjs.genSalt(10);
    this.password = await bcryptjs.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

export default mongoose.models.User ||
  mongoose.model<IUser>("User", UserSchema);
```

---

## 2. PRODUCT MODEL
**File:** `src/models/Product.ts`

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  rating: number;
  reviews: number;
  sellerId: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: 0,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      min: 0,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    reviews: {
      type: Number,
      default: 0,
    },
    sellerId: {
      type: String,
      required: [true, "Seller ID is required"],
      index: true,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Product ||
  mongoose.model<IProduct>("Product", ProductSchema);
```

---

## 3. CART MODEL
**File:** `src/models/Cart.ts`

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface ICartItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface ICart extends Document {
  buyerId: string;
  items: ICartItem[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const CartItemSchema = new Schema({
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
  },
});

const CartSchema = new Schema<ICart>(
  {
    buyerId: {
      type: String,
      required: [true, "Buyer ID is required"],
      unique: true,
      index: true,
    },
    items: [CartItemSchema],
    totalPrice: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total price before saving
CartSchema.pre("save", function (this: ICart) {
  this.totalPrice = this.items.reduce(
    (sum: number, item: ICartItem) => sum + item.price * item.quantity,
    0
  );
});

export default mongoose.models.Cart ||
  mongoose.model<ICart>("Cart", CartSchema);
```

---

## 4. ORDER MODEL
**File:** `src/models/Order.ts`

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IOrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image?: string;
  customizationDetails?: {
    material?: string;
    color?: string;
    design?: string;
  };
}

export interface IOrder extends Document {
  orderId: string;
  buyerId: string;
  buyerName: string;
  buyerEmail: string;
  sellerId: string;
  items: IOrderItem[];
  totalPrice: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  shippingAddress: {
    fullName: string;
    phone: string;
    address: string;
    city: string;
    province: string;
    postalCode: string;
  };
  paymentMethod: string;
  trackingNumber?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema({
  productId: {
    type: String,
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  image: {
    type: String,
  },
  customizationDetails: {
    material: String,
    color: String,
    design: String,
  },
});

const ShippingAddressSchema = new Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
  },
  phone: {
    type: String,
    required: [true, "Phone number is required"],
  },
  address: {
    type: String,
    required: [true, "Address is required"],
  },
  city: {
    type: String,
    required: [true, "City is required"],
  },
  province: {
    type: String,
    required: [true, "Province is required"],
  },
  postalCode: {
    type: String,
    required: [true, "Postal code is required"],
  },
});

const OrderSchema = new Schema<IOrder>(
  {
    orderId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    buyerId: {
      type: String,
      required: [true, "Buyer ID is required"],
      index: true,
    },
    buyerName: {
      type: String,
      required: [true, "Buyer name is required"],
    },
    buyerEmail: {
      type: String,
      required: [true, "Buyer email is required"],
    },
    sellerId: {
      type: String,
      required: [true, "Seller ID is required"],
      index: true,
    },
    items: [OrderItemSchema],
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
      index: true,
    },
    shippingAddress: ShippingAddressSchema,
    paymentMethod: {
      type: String,
      required: true,
    },
    trackingNumber: {
      type: String,
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Order ||
  mongoose.model<IOrder>("Order", OrderSchema);
```

---

## 5. REVIEW MODEL
**File:** `src/models/Review.ts`

```typescript
import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  productId: string;
  buyerId: string;
  buyerName: string;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    productId: {
      type: String,
      required: [true, "Product ID is required"],
      index: true,
    },
    buyerId: {
      type: String,
      required: [true, "Buyer ID is required"],
    },
    buyerName: {
      type: String,
      required: [true, "Buyer name is required"],
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, "Comment is required"],
      minlength: [10, "Comment must be at least 10 characters"],
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.Review ||
  mongoose.model<IReview>("Review", ReviewSchema);
```

---

## 6. CART API
**File:** `src/app/api/cart/route.ts`

```typescript
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Cart from "@/models/Cart";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/craftmarket";

export async function GET(req: Request) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");

    if (!buyerId) {
      return NextResponse.json(
        { error: "Buyer ID is required" },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ buyerId });

    if (!cart) {
      cart = new Cart({ buyerId, items: [], totalPrice: 0 });
      await cart.save();
    }

    return NextResponse.json(cart);
  } catch (error) {
    console.error("Error fetching cart:", error);
    return NextResponse.json(
      { error: "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const { buyerId, productId, productName, price, quantity, image } = await req.json();

    if (!buyerId || !productId || !productName || !price || !quantity) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ buyerId });

    if (!cart) {
      cart = new Cart({
        buyerId,
        items: [],
      });
    }

    const existingItem = cart.items.find(
      (item: Record<string, unknown>) => item.productId === productId
    );

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.items.push({
        productId,
        productName,
        price,
        quantity,
        image,
      });
    }

    await cart.save();

    return NextResponse.json(
      { message: "Item added to cart", cart },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding to cart:", error);
    return NextResponse.json(
      { error: "Failed to add to cart" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const { buyerId, productId, quantity } = await req.json();

    if (!buyerId || !productId) {
      return NextResponse.json(
        { error: "Buyer ID and Product ID are required" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ buyerId });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    const item = cart.items.find((item: Record<string, unknown>) => item.productId === productId);

    if (!item) {
      return NextResponse.json(
        { error: "Product not found in cart" },
        { status: 404 }
      );
    }

    if (quantity <= 0) {
      cart.items = cart.items.filter((item: Record<string, unknown>) => item.productId !== productId);
    } else {
      item.quantity = quantity;
    }

    await cart.save();

    return NextResponse.json(
      { message: "Cart updated", cart },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");
    const productId = searchParams.get("productId");

    if (!buyerId || !productId) {
      return NextResponse.json(
        { error: "Buyer ID and Product ID are required" },
        { status: 400 }
      );
    }

    const cart = await Cart.findOne({ buyerId });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    cart.items = cart.items.filter((item: Record<string, unknown>) => item.productId !== productId);

    await cart.save();

    return NextResponse.json(
      { message: "Item removed from cart", cart },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting from cart:", error);
    return NextResponse.json(
      { error: "Failed to delete from cart" },
      { status: 500 }
    );
  }
}
```

---

## 7. ORDER API
**File:** `src/app/api/orders/route.ts`

```typescript
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Order from "@/models/Order";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/craftmarket";

function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
}

export async function GET(req: Request) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");
    const sellerId = searchParams.get("sellerId");
    const orderId = searchParams.get("orderId");

    const query: Record<string, string> = {};

    if (buyerId) query.buyerId = buyerId;
    if (sellerId) query.sellerId = sellerId;
    if (orderId) query.orderId = orderId;

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json(orders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const {
      buyerId,
      buyerName,
      buyerEmail,
      sellerId,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod,
      notes,
    } = await req.json();

    if (
      !buyerId ||
      !buyerName ||
      !buyerEmail ||
      !sellerId ||
      !items ||
      items.length === 0 ||
      !totalPrice ||
      !shippingAddress ||
      !paymentMethod
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const orderId = generateOrderId();

    const order = new Order({
      orderId,
      buyerId,
      buyerName,
      buyerEmail,
      sellerId,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod,
      notes,
      status: "pending",
    });

    await order.save();

    return NextResponse.json(
      { message: "Order created successfully", order },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const { orderId, status, trackingNumber, notes } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json(
        { error: "Order ID and status are required" },
        { status: 400 }
      );
    }

    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      {
        status,
        ...(trackingNumber && { trackingNumber }),
        ...(notes && { notes }),
      },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Order updated successfully", order },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await Order.findOneAndUpdate(
      { orderId },
      { status: "cancelled" },
      { new: true }
    );

    if (!order) {
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Order cancelled", order },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
```

---

## 8. REVIEW API
**File:** `src/app/api/reviews/route.ts`

```typescript
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Review from "@/models/Review";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/craftmarket";

export async function GET(req: Request) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });

    const averageRating =
      reviews.length > 0
        ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return NextResponse.json({
      reviews,
      averageRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const { productId, buyerId, buyerName, rating, comment } = await req.json();

    if (!productId || !buyerId || !buyerName || !rating || !comment) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }

    if (comment.length < 10) {
      return NextResponse.json(
        { error: "Comment must be at least 10 characters" },
        { status: 400 }
      );
    }

    const existingReview = await Review.findOne({ productId, buyerId });
    if (existingReview) {
      return NextResponse.json(
        { error: "You have already reviewed this product" },
        { status: 400 }
      );
    }

    const review = new Review({
      productId,
      buyerId,
      buyerName,
      rating,
      comment,
    });

    await review.save();

    return NextResponse.json(
      { message: "Review created successfully", review },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to create review" },
      { status: 500 }
    );
  }
}
```

---

## Database Collections Overview

| Collection | Fields | Primary Use |
|-----------|--------|------------|
| **Users** | name, email, password, role, shopName | Authentication & user management |
| **Products** | name, description, price, category, stock, images, sellerId | Product catalog |
| **Cart** | buyerId, items[], totalPrice | Shopping cart |
| **Orders** | orderId, buyerId, sellerId, items[], status, shippingAddress | Order management |
| **Reviews** | productId, buyerId, rating, comment | Product reviews |

---

## MongoDB Connection
```typescript
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/craftmarket";
```

Semua kode database sudah lengkap! 🎉
