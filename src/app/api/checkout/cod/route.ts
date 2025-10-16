import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceAPI } from '@/lib/woocommerce-api';
import { generateOrderHash } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { items, billingInfo, paymentMethod } = body;

    // Validate required fields
    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'No items in cart' },
        { status: 400 }
      );
    }

    if (!billingInfo || !billingInfo.email) {
      return NextResponse.json(
        { error: 'Billing information is required' },
        { status: 400 }
      );
    }

    // Prepare line items for WooCommerce
    const lineItems = items.map((item: any) => {
      const lineItem: any = {
        product_id: item.product.databaseId || parseInt(item.product.id),
        quantity: item.quantity,
      };
      
      // Only add variation_id if it exists and is a valid number
      if (item.variation && item.variation.databaseId && typeof item.variation.databaseId === 'number') {
        lineItem.variation_id = item.variation.databaseId;
      }
      
      return lineItem;
    });

    // Validate that we have valid line items
    if (lineItems.length === 0) {
      return NextResponse.json(
        { error: 'No valid line items found' },
        { status: 400 }
      );
    }

    // Create order data
    const orderData = {
      payment_method: 'cod',
      payment_method_title: 'Cash on Delivery',
      set_paid: false,
      billing: {
        first_name: billingInfo.firstName,
        last_name: billingInfo.lastName,
        address_1: billingInfo.address1,
        address_2: billingInfo.address2 || '',
        city: billingInfo.city,
        state: billingInfo.state,
        postcode: billingInfo.postcode,
        country: billingInfo.country,
        email: billingInfo.email,
        phone: billingInfo.phone,
      },
      shipping: {
        first_name: billingInfo.firstName,
        last_name: billingInfo.lastName,
        address_1: billingInfo.address1,
        address_2: billingInfo.address2 || '',
        city: billingInfo.city,
        state: billingInfo.state,
        postcode: billingInfo.postcode,
        country: billingInfo.country,
      },
      line_items: lineItems,
      status: 'processing',
      meta_data: [
        {
          key: '_payment_method',
          value: 'cod'
        },
        {
          key: '_order_created_via',
          value: 'headless_storefront'
        }
      ]
    };

    // Create order in WooCommerce
    const order = await wooCommerceAPI.createOrder(orderData);
    
    // Generate order hash for session-based access
    const orderHash = generateOrderHash(order.id);
    
    // Create response with order hash cookie
    const response = NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.number,
      total: order.total,
      status: order.status,
      orderHash: orderHash, // Include hash in response for redirect
    });
    
    // Set secure cookie for order access
    response.cookies.set('order_hash', orderHash, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('COD Order creation error:', error);
    
    if (error.response?.data) {
      console.error('WooCommerce API Error:', error.response.data);
      console.error('Error status:', error.response.status);
      console.error('Error headers:', error.response.headers);
      
      // Handle specific permission errors
      if (error.response.status === 401) {
        return NextResponse.json(
          { error: 'API authentication failed. Please check WooCommerce API credentials.' },
          { status: 401 }
        );
      }
      
      if (error.response.status === 403) {
        return NextResponse.json(
          { error: 'Permission denied. Please ensure the WooCommerce API key has write permissions.' },
          { status: 403 }
        );
      }
      
      return NextResponse.json(
        { error: error.response.data.message || 'Failed to create order' },
        { status: error.response.status || 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}