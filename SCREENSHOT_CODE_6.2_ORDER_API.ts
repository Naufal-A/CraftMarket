// 6.2 BACKEND API ROUTE - ORDER API
// File: src/app/api/orders/route.ts (Cuplikan untuk SS)

import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Order from "@/models/Order";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/craftmarket";

function generateOrderId() {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `ORD-${timestamp}-${random}`;
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
