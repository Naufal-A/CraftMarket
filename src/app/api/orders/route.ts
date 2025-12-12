import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

// GET - Get orders (by buyer, seller, or all)
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const buyerId = searchParams.get("buyerId");
    const sellerId = searchParams.get("sellerId");
    const orderId = searchParams.get("orderId");
    const status = searchParams.get("status");

    const query: Record<string, unknown> = {};

    if (buyerId) query.buyerId = buyerId;
    if (sellerId) query.sellerId = sellerId;
    if (orderId) query.orderId = orderId;
    if (status) query.status = status;

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json({
      message: "Orders retrieved successfully",
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error fetching orders";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

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

    // Validation
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

    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

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

// PUT - Update order status
export async function PUT(req: NextRequest) {
  try {
    await dbConnect();

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

// DELETE - Cancel order
export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

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

// PATCH - Clear all orders (for testing/reset purposes)
export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const clearAll = searchParams.get("clearAll");

    if (clearAll !== "true") {
      return NextResponse.json(
        { error: "Invalid request. Use ?clearAll=true parameter" },
        { status: 400 }
      );
    }

    const result = await Order.deleteMany({});

    console.log(`Deleted ${result.deletedCount} orders from database`);

    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} orders`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error clearing orders:", error);
    return NextResponse.json(
      { error: "Failed to clear orders" },
      { status: 500 }
    );
  }
}
