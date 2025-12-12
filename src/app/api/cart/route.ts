import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Cart from "@/models/Cart";

// GET - Get user's cart
export async function GET(req: Request) {
  try {
    await dbConnect();

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
    await dbConnect();

    const { buyerId, productId, productName, price, quantity, image, sellerId } = await req.json();

    if (!buyerId || !productId || !productName || !price || quantity === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate quantity is positive
    if (quantity < 0) {
      return NextResponse.json(
        { error: "Quantity cannot be negative" },
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
    const existingItemIndex = cart.items.findIndex(
      (item: Record<string, unknown>) => item.productId === productId
    );

    if (existingItemIndex !== -1) {
      // Update existing item quantity - REPLACE not ADD
      cart.items[existingItemIndex].quantity = quantity;
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
    await dbConnect();

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
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");
    const productId = searchParams.get("productId");
    const clearAll = searchParams.get("clearAll");

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

    if (clearAll === "true") {
      // Clear all items from cart
      cart.items = [];
    } else if (productId) {
      // Remove specific product
      cart.items = cart.items.filter((item: Record<string, unknown>) => 
        String(item.productId) !== String(productId)
      );
    }

    const savedCart = await cart.save();

    return NextResponse.json(
      { message: "Cart updated", cart: savedCart },
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
