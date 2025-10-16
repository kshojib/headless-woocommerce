import { NextResponse } from 'next/server';
import { wooCommerceAPI } from '@/lib/woocommerce-api';

export async function GET() {
  try {
    console.log('Testing recent products API...');
    const products = await wooCommerceAPI.getRecentProducts(6);
    console.log('Got products:', products?.length || 0);
    
    return NextResponse.json({
      success: true,
      count: products?.length || 0,
      products: products || [],
    });
  } catch (error: any) {
    console.error('Test recent products error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.response?.data || null,
    }, { status: 500 });
  }
}