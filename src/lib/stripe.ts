import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16',
  typescript: true,
});

export async function createCheckoutSession(items: any[], customerEmail?: string) {
  const line_items = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.product.name,
        images: item.product.image ? [item.product.image.sourceUrl] : [],
        metadata: {
          product_id: item.product.databaseId,
        },
      },
      unit_amount: Math.round(
        parseFloat(item.variation?.price || item.product.price || '0') * 100
      ),
    },
    quantity: item.quantity,
  }));

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items,
    mode: 'payment',
    success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}&payment_method=stripe`,
    cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/cancel`,
    customer_email: customerEmail,
    metadata: {
      items: JSON.stringify(
        items.map((item) => ({
          product_id: item.product.databaseId,
          quantity: item.quantity,
          variation_id: item.variation?.databaseId,
        }))
      ),
    },
  });

  return session;
}
