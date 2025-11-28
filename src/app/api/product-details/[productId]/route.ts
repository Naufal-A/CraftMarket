import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import ProductDetail from '@/models/ProductDetail';

// GET product detail by product ID
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await dbConnect();

    const { productId } = params;

    const detail = await ProductDetail.findOne({ productId });
    if (!detail) {
      return NextResponse.json(
        { message: 'Detail produk tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Detail produk berhasil diambil',
        detail,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Get product detail error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// POST create or update product detail
export async function POST(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    await dbConnect();

    const { productId } = params;
    const { material, dimensions, weight, color, customizable, customizationOptions, deliveryTime, shippingCost, warranty, careInstructions } = await request.json();

    let detail = await ProductDetail.findOne({ productId });

    if (detail) {
      // Update existing detail
      detail = await ProductDetail.findOneAndUpdate(
        { productId },
        {
          material,
          dimensions,
          weight,
          color,
          customizable,
          customizationOptions,
          deliveryTime,
          shippingCost,
          warranty,
          careInstructions,
        },
        { new: true, runValidators: true }
      );
    } else {
      // Create new detail
      detail = new ProductDetail({
        productId,
        material,
        dimensions,
        weight,
        color,
        customizable,
        customizationOptions,
        deliveryTime,
        shippingCost,
        warranty,
        careInstructions,
      });

      await detail.save();
    }

    return NextResponse.json(
      {
        message: 'Detail produk berhasil disimpan',
        detail,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Save product detail error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
