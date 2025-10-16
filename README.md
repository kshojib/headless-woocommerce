# Headless WooCommerce Store with Next.js

A modern, SEO-optimized headless WooCommerce storefront built with Next.js 14, TypeScript, Tailwind CSS, and Stripe payments.

## Features

- ✅ **Next.js 14 App Router** with Server-Side Rendering (SSR) and Incremental Static Regeneration (ISR)
- ✅ **WPGraphQL Integration** for efficient data fetching from WooCommerce
- ✅ **WooCommerce REST API** fallback support
- ✅ **Stripe Payment Integration** with order syncing to WooCommerce
- ✅ **JWT Authentication** for user login/register
- ✅ **Zustand State Management** for cart and auth
- ✅ **Tailwind CSS** for modern, responsive styling
- ✅ **React Query** for optimized data fetching and caching
- ✅ **SEO Optimized** with metadata, OpenGraph, JSON-LD schema, and sitemap
- ✅ **TypeScript** for type safety

## Prerequisites

- Node.js 18+ installed
- WordPress/WooCommerce running at `https://coral-moose-520172.hostingersite.com/`
- WPGraphQL plugin installed on WordPress
- WooCommerce GraphQL (WPGraphQL WooCommerce) plugin installed
- Stripe account for payments

## Installation

1. **Install dependencies:**

   ```powershell
   npm install
   ```

2. **Configure environment variables:**

   Update `.env.local` with your actual credentials:

   - WooCommerce API keys (Consumer Key & Secret)
   - Stripe API keys
   - JWT secret key
   - Your site URL

3. **Run the development server:**

   ```powershell
   npm run dev
   ```

4. **Open the app:**
   Navigate to `http://localhost:3000`

## WordPress Setup Required

### Install Required Plugins

1. **WPGraphQL** - GraphQL API for WordPress

   ```
   https://www.wpgraphql.com/
   ```

2. **WooGraphQL (WPGraphQL WooCommerce)** - WooCommerce extension for WPGraphQL

   ```
   https://github.com/wp-graphql/wp-graphql-woocommerce
   ```

3. **JWT Authentication for WP-API** - For user authentication
   ```
   https://wordpress.org/plugins/jwt-authentication-for-wp-rest-api/
   ```

### WooCommerce REST API Setup

1. Go to **WooCommerce → Settings → Advanced → REST API**
2. Click "Add Key"
3. Set permissions to "Read/Write"
4. Copy the Consumer Key and Consumer Secret to `.env.local`

### JWT Authentication Setup

Add to your `wp-config.php`:

```php
define('JWT_AUTH_SECRET_KEY', 'your-secret-key-here');
define('JWT_AUTH_CORS_ENABLE', true);
```

Add to `.htaccess`:

```apache
RewriteCond %{HTTP:Authorization} ^(.*)
RewriteRule ^(.*) - [E=HTTP_AUTHORIZATION:%1]
SetEnvIf Authorization "(.*)" HTTP_AUTHORIZATION=$1
```

## Project Structure

```
headlesswc/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx         # Root layout with providers
│   │   ├── page.tsx           # Home page
│   │   ├── product/[slug]/    # Dynamic product pages (SSR/ISR)
│   │   ├── checkout/          # Checkout page
│   │   ├── login/             # Login page
│   │   ├── register/          # Register page
│   │   ├── api/               # API routes
│   │   │   ├── checkout/      # Stripe checkout session
│   │   │   └── webhook/       # Stripe webhook handler
│   │   ├── sitemap.ts         # Dynamic sitemap generation
│   │   └── robots.ts          # Robots.txt configuration
│   ├── components/            # React components
│   │   ├── Header.tsx         # Site header with cart
│   │   ├── Footer.tsx         # Site footer
│   │   ├── ProductCard.tsx    # Product card component
│   │   ├── CartDrawer.tsx     # Shopping cart drawer
│   │   ├── AddToCartButton.tsx
│   │   ├── Providers.tsx      # React Query provider
│   │   └── SEO/               # SEO components
│   ├── lib/                   # Library code
│   │   ├── graphql-client.ts  # GraphQL client & queries
│   │   ├── woocommerce-api.ts # REST API client
│   │   ├── stripe.ts          # Stripe integration
│   │   ├── auth.ts            # JWT authentication
│   │   └── utils.ts           # Utility functions
│   ├── store/                 # Zustand stores
│   │   ├── cart-store.ts      # Shopping cart state
│   │   └── auth-store.ts      # Authentication state
│   ├── types/                 # TypeScript types
│   │   └── index.ts           # Type definitions
│   └── styles/                # Styles
│       └── globals.css        # Global styles
├── package.json               # Dependencies
├── next.config.js             # Next.js configuration
├── tailwind.config.js         # Tailwind CSS configuration
├── tsconfig.json              # TypeScript configuration
└── .env.local                 # Environment variables
```

## Key Features Explained

### 1. GraphQL Integration

Uses WPGraphQL to fetch products, categories, and manage cart/checkout efficiently.

### 2. Stripe Payments

- Creates checkout sessions via `/api/checkout`
- Handles webhook events at `/api/webhook/stripe`
- Automatically creates orders in WooCommerce after successful payment

### 3. Authentication

- JWT-based authentication with WooCommerce
- Login, register, and account management
- Persistent session with cookies

### 4. Cart Management

- Zustand for state management
- Persisted to localStorage
- Add, update, remove items

### 5. SEO Optimization

- Dynamic metadata for all pages
- OpenGraph tags for social sharing
- JSON-LD schema for products
- Automatic sitemap generation
- Optimized for search engines

## Building for Production

```powershell
npm run build
npm start
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub
2. Import the repository in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production

Make sure to set these in your deployment platform:

- `NEXT_PUBLIC_WORDPRESS_URL`
- `NEXT_PUBLIC_GRAPHQL_ENDPOINT`
- `WOOCOMMERCE_CONSUMER_KEY`
- `WOOCOMMERCE_CONSUMER_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_SITE_URL`

## Stripe Webhook Setup

After deploying, configure Stripe webhooks:

1. Go to Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/webhook/stripe`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy the webhook secret to `STRIPE_WEBHOOK_SECRET`

## Troubleshooting

### CORS Issues

If you encounter CORS errors, add this to your WordPress `functions.php`:

```php
add_action('init', function() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
});
```

### SSL Certificate Issues (Local Development)

For self-signed certificates in local development, you may need to disable SSL verification (not recommended for production):

```javascript
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
```

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
