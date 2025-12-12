import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Order from "@/models/Order";

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId") || searchParams.get("transactionId");

    if (!orderId) {
      return NextResponse.json(
        { message: "Order ID tidak ditemukan" },
        { status: 400 }
      );
    }

    // Get payment status
    const payment = await Payment.findOne({ orderId });
    if (!payment) {
      return NextResponse.json(
        { message: "Data pembayaran tidak ditemukan" },
        { status: 404 }
      );
    }

    // Get order details
    const order = await Order.findOne({ orderId });
    if (!order) {
      return NextResponse.json(
        { message: "Data pesanan tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        payment: {
          transactionId: payment.transactionId,
          status: payment.status,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          createdAt: payment.createdAt,
        },
        order: {
          orderId: order.orderId,
          status: order.status,
          totalPrice: order.totalPrice,
          items: order.items,
          shippingAddress: order.shippingAddress,
          createdAt: order.createdAt,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error fetching payment status:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error fetching payment status";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// POST - Update payment status (used by dummy payment)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const { transactionId, orderId, status } = await request.json();
    
    // Accept either transactionId or orderId (they're the same)
    const id = orderId || transactionId;

    if (!id || !status) {
      return NextResponse.json(
        { message: "Order ID/Transaction ID dan status harus diisi" },
        { status: 400 }
      );
    }

    // Update payment status
    const payment = await Payment.findOneAndUpdate(
      { $or: [{ orderId: id }, { transactionId: id }] },
      { status },
      { new: true }
    );

    if (!payment) {
      return NextResponse.json(
        { message: "Data pembayaran tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update order status based on payment status
    const orderStatus =
      status === "settlement" ? "processing" : status === "pending" ? "pending" : "cancelled";

    await Order.findOneAndUpdate(
      { $or: [{ orderId: id }, { transactionId: id }] },
      { status: orderStatus },
      { new: true }
    );

    return NextResponse.json(
      {
        message: "Status pembayaran berhasil diperbarui",
        payment: {
          transactionId: payment.transactionId,
          orderId: payment.orderId,
          status: payment.status,
          amount: payment.amount,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Error updating payment status:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error updating payment status";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// PATCH - Clear all payments (for testing/reset purposes)
export async function PATCH(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);
    const clearAll = searchParams.get("clearAll");

    if (clearAll !== "true") {
      return NextResponse.json(
        { message: "Invalid request. Use ?clearAll=true parameter" },
        { status: 400 }
      );
    }

    const result = await Payment.deleteMany({});

    console.log(`Deleted ${result.deletedCount} payments from database`);

    return NextResponse.json({
      message: `Successfully deleted ${result.deletedCount} payments`,
      deletedCount: result.deletedCount,
    });
  } catch (error: unknown) {
    console.error("Error clearing payments:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Error clearing payments";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
