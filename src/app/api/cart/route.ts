import { NextResponse } from "next/server";
import mongoose from "mongoose";
import Cart from "@/models/Cart";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/craftmarket";

// GET - Get user's cart
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

// POST - Add item to cart or update existing item
export async function POST(req: Request) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const { buyerId, productId, productName, price, quantity, image, sellerId } = await req.json();

    if (!buyerId || !productId || !productName || !price || quantity === undefined) {
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

    // Check if product already exists in cart
    const existingItem = cart.items.find(
      (item: Record<string, unknown>) => item.productId === productId
    );

    if (existingItem) {
      // Add to existing quantity (accumulate)
      existingItem.quantity = (existingItem.quantity as number) + quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        productName,
        price,
        quantity,
        image,
        sellerId,
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

// PUT - Update cart item quantity
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
      // Remove item if quantity is 0 or negative
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

// DELETE - Remove item from cart
export async function DELETE(req: Request) {
  try {
    if (!mongoose.connections[0].readyState) {
      await mongoose.connect(MONGODB_URI);
    }

    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");
    const productId = searchParams.get("productId");
    const clearAll = searchParams.get("clearAll");

    console.log(`DELETE request: buyerId=${buyerId}, productId=${productId}, clearAll=${clearAll}`);

    if (!buyerId) {
      return NextResponse.json(
        { error: "Buyer ID is required" },
        { status: 400 }
      );
    }

    let cart = await Cart.findOne({ buyerId });

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    console.log(`Cart found with ${cart.items.length} items`);

    if (clearAll === "true") {
      // Clear all items from cart
      console.log(`Clearing all items from cart for buyer ${buyerId}`);
      cart.items = [];
    } else if (productId) {
      // Filter items - remove items where productId matches (both string comparison)
      const initialLength = cart.items.length;
      const itemsBeforeFilter = cart.items.map((item: Record<string, unknown>) => item.productId);
      console.log(`Items before filter: ${JSON.stringify(itemsBeforeFilter)}`);
      
      cart.items = cart.items.filter((item: Record<string, unknown>) => 
        String(item.productId) !== String(productId)
      );

      console.log(`Items removed: ${initialLength - cart.items.length} out of ${initialLength}`);

      // Check if item was actually removed
      if (cart.items.length === initialLength) {
        console.warn(`Product ${productId} not found in cart for buyer ${buyerId}`);
      }
    }

    const savedCart = await cart.save();
    console.log(`Cart saved with ${savedCart.items.length} items`);

    return NextResponse.json(
      { message: "Cart updated", cart: savedCart },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating cart:", error);
    return NextResponse.json(
      { error: "Failed to update cart", details: String(error) },
      { status: 500 }
    );
  }
}
