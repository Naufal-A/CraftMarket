import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Payment from "@/models/Payment";
import Order from "@/models/Order";
import User from "@/models/User";

export async function POST(request: NextRequest) {
  try {
    console.log("[Payment API] Starting payment creation...");
    
    await dbConnect();
    console.log("[Payment API] Database connected");

    const body = await request.json();
    const {
      buyerId,
      items,
      totalPrice,
      shippingAddress,
      paymentMethod,
      sellerId,
    } = body;
    
    console.log("[Payment API] Request body:", {
      buyerId,
      itemsCount: items?.length,
      totalPrice,
      hasShippingAddress: !!shippingAddress,
      paymentMethod,
      sellerId,
    });

    // Validation
    if (!buyerId || !items || !totalPrice || !shippingAddress || !sellerId) {
      console.error("[Payment API] Validation failed - missing required fields");
      return NextResponse.json(
        { message: "Data tidak lengkap" },
        { status: 400 }
      );
    }

    // Get buyer info
    console.log("[Payment API] Fetching buyer with ID:", buyerId);
    const buyer = await User.findById(buyerId);
    if (!buyer) {
      console.error("[Payment API] Buyer not found:", buyerId);
      return NextResponse.json(
        { message: "Pembeli tidak ditemukan" },
        { status: 404 }
      );
    }
    console.log("[Payment API] Buyer found:", buyer.name);

    // Generate unique order ID
    const orderId = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    // Generate unique transaction ID for payment
    const transactionId = `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    console.log("[Payment API] Generated IDs - orderId:", orderId, "transactionId:", transactionId);

    // Create order in database
    const orderData = {
      orderId,
      buyerId,
      buyerName: buyer.name,
      buyerEmail: buyer.email,
      sellerId: sellerId,
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
    };
    
    console.log("[Payment API] Creating order with data:", orderData);
    
    const order = new Order(orderData);
    await order.save();
    console.log("[Payment API] Order saved successfully:", orderId);

    // Save payment record with settlement status (automatic payment)
    const paymentData = {
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
    };
    
    console.log("[Payment API] Creating payment with data:", paymentData);
    
    const payment = new Payment(paymentData);
    await payment.save();
    console.log("[Payment API] Payment saved successfully:", transactionId);

    console.log("[Payment API] Payment creation completed successfully");
    
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
    console.error("[Payment API] Error occurred:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Terjadi kesalahan saat membuat pembayaran";
    console.error("[Payment API] Full error details:", JSON.stringify(error, null, 2));
    return NextResponse.json(
      { message: errorMessage, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
