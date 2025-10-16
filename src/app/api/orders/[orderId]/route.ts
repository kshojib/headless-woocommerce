import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceAPI } from '@/lib/woocommerce-api';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth';

async function verifyOrderAccess(order: any, hasValidHash: boolean, authenticatedUser: any): Promise<boolean> {
  // Allow access if user has valid hash (immediate post-checkout access)
  if (hasValidHash) {
    return true;
  }

  // Allow access if user is authenticated and owns the order
  if (authenticatedUser && order.billing && order.billing.email) {
    // Check if the authenticated user's email matches the order's billing email
    if (authenticatedUser.user_email === order.billing.email) {
      return true;
    }
  }

  // Check if order was created recently (within last 10 minutes) for guest checkout
  const orderDate = new Date(order.date_created);
  const now = new Date();
  const timeDiff = now.getTime() - orderDate.getTime();
  const tenMinutesInMs = 10 * 60 * 1000;

  // Allow recent orders for guest checkout (temporary window)
  if (timeDiff < tenMinutesInMs) {
    return true;
  }

  return false;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const orderId = params.orderId;
    const { searchParams } = new URL(request.url);
    const orderHash = searchParams.get('hash');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Check for order hash (for immediate post-checkout access)
    const sessionOrderHash = cookies().get('order_hash')?.value;
    const hasValidHash = orderHash && sessionOrderHash && orderHash === sessionOrderHash;

    // Check for authenticated user
    let authenticatedUser = null;
    try {
      const token = cookies().get('auth_token')?.value;
      if (token) {
        authenticatedUser = await verifyToken(token);
      }
    } catch (error) {
      // Token verification failed, continue without authentication
    }

    // Fetch order details from WooCommerce
    const order = await wooCommerceAPI.getOrder(parseInt(orderId));

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Security Check: Verify access permissions
    const canAccess = await verifyOrderAccess(order, !!hasValidHash, authenticatedUser);
    
    if (!canAccess) {
      return NextResponse.json(
        { error: 'Access denied. You are not authorized to view this order.' },
        { status: 403 }
      );
    }

    // Clear the order hash cookie after successful access
    if (hasValidHash) {
      cookies().delete('order_hash');
    }

    // Transform the order data to match our interface
    const transformedOrder = {
      id: order.id,
      number: order.number,
      status: order.status,
      total: order.total,
      currency: order.currency,
      date_created: order.date_created,
      payment_method_title: order.payment_method_title,
      billing: order.billing,
      shipping: order.shipping,
      line_items: order.line_items.map((item: any) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        total: item.total,
        image: item.image || null,
      })),
      shipping_total: order.shipping_total,
      tax_total: order.tax_total,
    };

    return NextResponse.json(transformedOrder);

  } catch (error: any) {
    console.error('Error fetching order details:', error);
    
    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
}