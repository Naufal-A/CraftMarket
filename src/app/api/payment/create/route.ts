import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Order from "@/models/Order";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const {
      buyerId,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod,
      sellerId,
    } = body;

    // Validation
    if (!buyerId || !items || !totalPrice || !shippingAddress || !sellerId) {
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Get buyer info
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      return NextResponse.json(
        { message: "Pembeli tidak ditemukan" },
        { status: 404 }
      );
    }

    // Generate unique order ID and transaction ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create order in database
    const order = new Order({
      orderId,
      buyerId,
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      sellerId,
      items: items.map((item: Record<string, unknown>) => ({
        productId: item.productId,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image,
        customizationDetails: item.customizationDetails,
      })),
      totalPrice,
      status: "processing",
      shippingAddress,
      paymentMethod,
    });
    await order.save();

    // Save payment record
    const payment = new Payment({
      transactionId,
      orderId,
      buyerId,
      amount: totalPrice,
      currency: "IDR",
      paymentMethod,
      status: "settlement",
      midtransResponse: {
        token: "auto_payment",
        redirect_url: `/orders?status=processing`,
      },
    });
    await payment.save();

    return NextResponse.json(
      {
        message: "Pembayaran berhasil diproses",
        order: {
          orderId,
          totalPrice,
        },
        redirectUrl: `/orders`,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating payment:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan saat membuat pembayaran";
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
