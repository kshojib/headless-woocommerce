import { NextRequest, NextResponse } from 'next/server';
import { wooCommerceAPI } from '@/lib/woocommerce-api';

export async function GET(request: NextRequest) {
  try {
    console.log('Testing WooCommerce API connection...');
    
    // Test basic API connection by fetching products
    const products = await wooCommerceAPI.getProducts({ per_page: 1 });
    console.log('Products fetch successful:', products.length > 0);
    
    // Test if we can fetch orders (this requires read permission)
    try {
      // Use a method that exists in the WooCommerceAPI class
      const testOrderFetch = await wooCommerceAPI.getOrder(1); // Try to get order with ID 1
      console.log('Orders read permission: OK');
    } catch (orderError: any) {
      console.error('Orders read permission test (expected if order #1 doesnt exist):', orderError.response?.status);
    }
    
    // Test creating a simple test order to check write permissions
    try {
      const testOrder = {
        payment_method: 'cod',
        payment_method_title: 'Cash on Delivery',
        billing: {
          first_name: 'Test',
          last_name: 'User',
          address_1: 'Test Address',
          city: 'Test City',
          state: 'Test State',
          postcode: '12345',
          country: 'US',
          email: 'test@example.com',
          phone: '1234567890',
        },
        line_items: [
          {
            product_id: 63, // Use a known product ID
            quantity: 1,
          }
        ],
      };
      
      console.log('Testing minimal order creation...');
      const testOrderResult = await wooCommerceAPI.createOrder(testOrder);
      console.log('Minimal order creation: SUCCESS', testOrderResult.id);
      
      return NextResponse.json({
        success: true,
        message: 'WooCommerce API permissions are working correctly',
        testOrderId: testOrderResult.id
      });
      
    } catch (createError: any) {
      console.error('Order creation permission failed:', createError.response?.status, createError.response?.data);
      
      return NextResponse.json({
        success: false,
        message: 'WooCommerce API write permissions failed',
        error: createError.response?.data || createError.message,
        status: createError.response?.status,
        details: {
          url: createError.config?.url,
          method: createError.config?.method,
          auth: createError.config?.auth ? 'Present' : 'Missing'
        }
      }, { status: 200 }); // Return 200 so we can see the error details
    }
    
  } catch (error: any) {
    console.error('API test failed:', error);
    return NextResponse.json({
      success: false,
      message: 'WooCommerce API connection failed',
      error: error.message
    }, { status: 500 });
  }
}