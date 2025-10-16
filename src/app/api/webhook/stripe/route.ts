import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { wooCommerceAPI } from '@/lib/woocommerce-api';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      
      // Create order in WooCommerce
      try {
        const metadata = session.metadata;
        if (metadata && metadata.items) {
          const items = JSON.parse(metadata.items);
          
          const orderData = {
            payment_method: 'stripe',
            payment_method_title: 'Credit Card (Stripe)',
            set_paid: true,
            transaction_id: session.payment_intent as string,
            customer_note: `Stripe Payment ID: ${session.payment_intent}`,
            line_items: items.map((item: any) => ({
              product_id: item.product_id,
              quantity: item.quantity,
              variation_id: item.variation_id || undefined,
            })),
            billing: {
              email: session.customer_details?.email || '',
              first_name: session.customer_details?.name?.split(' ')[0] || '',
              last_name: session.customer_details?.name?.split(' ').slice(1).join(' ') || '',
            },
          };

          const order = await wooCommerceAPI.createOrder(orderData);
          console.log('WooCommerce order created:', order.id);
        }
      } catch (error) {
        console.error('Error creating WooCommerce order:', error);
      }
      break;
    }

    case 'payment_intent.payment_failed': {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment failed:', paymentIntent.id);
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}
