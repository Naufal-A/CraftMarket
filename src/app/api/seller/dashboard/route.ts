import { NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Order, { IOrderItem } from "@/models/Order";
import Product from "@/models/Product";

export async function GET(req: Request) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) {
      return NextResponse.json(
        { error: "Seller ID is required" },
        { status: 400 }
      );
    }

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get yesterday's date range
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayEnd = new Date(yesterday);
    yesterdayEnd.setDate(yesterdayEnd.getDate() + 1);

    // Get all orders for this seller
    const allOrders = await Order.find({ sellerId }).sort({ createdAt: -1 });

    // Get today's orders
    const todayOrders = allOrders.filter(
      (order) =>
        new Date(order.createdAt) >= today && new Date(order.createdAt) < tomorrow
    );

    // Get yesterday's orders
    const yesterdayOrders = allOrders.filter(
      (order) =>
        new Date(order.createdAt) >= yesterday && new Date(order.createdAt) < yesterdayEnd
    );

    // Calculate metrics
    const todaysOrderCount = todayOrders.length;
    const todaysRevenue = todayOrders.reduce((sum, order) => {
      const price = typeof order.totalPrice === "string" 
        ? parseFloat(order.totalPrice.replace(/\./g, "").replace(",", "."))
        : order.totalPrice;
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    const yesterdayOrderCount = yesterdayOrders.length;
    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => {
      const price = typeof order.totalPrice === "string"
        ? parseFloat(order.totalPrice.replace(/\./g, "").replace(",", "."))
        : order.totalPrice;
      return sum + (isNaN(price) ? 0 : price);
    }, 0);

    // Calculate percentage changes
    const orderChange = yesterdayOrderCount > 0 
      ? Math.round(((todaysOrderCount - yesterdayOrderCount) / yesterdayOrderCount) * 100)
      : todaysOrderCount > 0 ? 100 : 0;

    const revenueChange = yesterdayRevenue > 0
      ? Math.round(((todaysRevenue - yesterdayRevenue) / yesterdayRevenue) * 100)
      : todaysRevenue > 0 ? 100 : 0;

    // Count pending shipments (processing status)
    const pendingShipments = allOrders.filter(
      (order) => order.status === "processing"
    ).length;

    // Count delivered items (sum of delivered orders)
    const deliveredItems = allOrders
      .filter((order) => order.status === "delivered")
      .reduce((sum, order) => {
        const quantity = order.items.reduce((itemSum: number, item: IOrderItem) => itemSum + (item.quantity || 1), 0);
        return sum + quantity;
      }, 0);

    // Get recent orders (last 10)
    const recentOrders = allOrders.slice(0, 10);

    // Get seller's products count
    const productsCount = await Product.countDocuments({ sellerId });

    return NextResponse.json({
      stats: {
        todaysOrders: todaysOrderCount,
        orderChangePercent: orderChange,
        pendingShipments,
        deliveredItems,
        todaysRevenue: Math.round(todaysRevenue),
        revenueChangePercent: revenueChange,
        totalProducts: productsCount,
      },
      recentOrders: recentOrders.map((order) => ({
        id: order.orderId,
        name: order.buyerName,
        status: order.status,
        price: order.totalPrice,
        createdAt: order.createdAt,
      })),
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
