// 6. BACKEND API ROUTE - CART API
// File: src/app/api/cart/route.ts (Cuplikan untuk SS)

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
      cart = new Cart({ buyerId, items: [] });
    }

    const existingItem = cart.items.find(
      (item) => item.productId === productId
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
