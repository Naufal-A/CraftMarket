import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import crypto from "crypto";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const payload = await request.json();
    const { order_id, status_code, transaction_status, signature_key } = payload;

    // Verify signature for security
    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const expectedSignature = crypto
      .createHash("sha512")
      .update(
        `${order_id}${status_code}${payload.gross_amount}${serverKey}`
      )
      .digest("hex");

    if (expectedSignature !== signature_key) {
      console.warn("Invalid signature received");
      return NextResponse.json(
        { message: "Invalid signature" },
        { status: 401 }
      );
    }

    // Update payment status
    const payment = await Payment.findOne({ transactionId: order_id });
    if (!payment) {
      return NextResponse.json(
        { message: "Payment record not found" },
        { status: 404 }
      );
    }

    // Update payment status based on Midtrans transaction status
    let newStatus = "pending";
    if (
      transaction_status === "capture" ||
      transaction_status === "settlement"
    ) {
      newStatus = "completed";
    } else if (
      transaction_status === "cancel" ||
      transaction_status === "deny"
    ) {
      newStatus = "failed";
    } else if (transaction_status === "expire") {
      newStatus = "expired";
    }

    payment.status = newStatus;
    payment.midtransResponse = payload;
    await payment.save();

    // Update order status
    const order = await Order.findOne({ orderId: order_id });
    if (order) {
      if (newStatus === "completed") {
        order.status = "processing";
        // Clear user's cart after successful payment
        await Cart.updateOne(
          { buyerId: order.buyerId },
          { items: [] }
        );
      } else if (newStatus === "failed" || newStatus === "expired") {
        order.status = "cancelled";
      }
      await order.save();
    }

    return NextResponse.json(
      { message: "Webhook processed successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Webhook error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
