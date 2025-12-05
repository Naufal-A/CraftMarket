import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order from "@/models/Order";

export async function GET() {
  try {
    await dbConnect();

    // Get all orders and group by sellerId
    const orders = await Order.find({}).sort({ createdAt: -1 });

    // Group by sellerId
    const sellerOrders: Record<string, number> = {};
    orders.forEach((order) => {
      if (sellerOrders[order.sellerId]) {
        sellerOrders[order.sellerId]++;
      } else {
        sellerOrders[order.sellerId] = 1;
      }
    });

    return NextResponse.json({
      message: "Orders grouped by seller",
      totalOrders: orders.length,
      sellerOrders,
      orders: orders.map((o) => ({
        orderId: o.orderId,
        sellerId: o.sellerId,
        buyerName: o.buyerName,
        status: o.status,
        createdAt: o.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}
