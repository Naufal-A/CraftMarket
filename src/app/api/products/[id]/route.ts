import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Product from '@/models/Product';
import ProductDetail from '@/models/ProductDetail';

// GET single product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { message: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    const productDetail = await ProductDetail.findOne({ productId: id });

    return NextResponse.json(
      {
        message: 'Produk berhasil diambil',
        product,
        detail: productDetail,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Get product error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat mengambil produk';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// PUT update product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;
    const { name, description, price, category, images, stock } = await request.json();

    const product = await Product.findByIdAndUpdate(
      id,
      { name, description, price, category, images, stock },
      { new: true, runValidators: true }
    );

    if (!product) {
      return NextResponse.json(
        { message: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Produk berhasil diperbarui',
        product,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Update product error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat memperbarui produk';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}

// DELETE product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    const { id } = await params;

    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return NextResponse.json(
        { message: 'Produk tidak ditemukan' },
        { status: 404 }
      );
    }

    // Also delete product detail
    await ProductDetail.deleteOne({ productId: id });

    return NextResponse.json(
      {
        message: 'Produk berhasil dihapus',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Delete product error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan saat menghapus produk';
    return NextResponse.json(
      { message: errorMessage },
      { status: 500 }
    );
  }
}
