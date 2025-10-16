// Product Types
export interface Product {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  shortDescription?: string;
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  onSale: boolean;
  stockStatus?: string;
  image?: {
    sourceUrl: string;
    altText?: string;
  };
  galleryImages?: {
    nodes: Array<{
      sourceUrl: string;
      altText?: string;
    }>;
  };
  productCategories?: {
    nodes: Category[];
  };
  averageRating?: number;
  reviewCount?: number;
  weight?: string;
  length?: string;
  variations?: {
    nodes: ProductVariation[];
  };
  attributes?: {
    nodes: ProductAttribute[];
  };
  // External/Affiliate product fields
  externalUrl?: string;
  buttonText?: string;
}

export interface ProductAttribute {
  id: string;
  name: string;
  options: string[];
  variation: boolean;
}

export interface ProductVariation {
  id: string;
  databaseId: number;
  name: string;
  price?: string;
  regularPrice?: string;
  salePrice?: string;
  stockStatus: string;
  attributes?: {
    nodes: VariationAttribute[];
  };
}

export interface VariationAttribute {
  id: string;
  name: string;
  value: string;
}

// Category Types
export interface Category {
  id: string;
  databaseId: number;
  name: string;
  slug: string;
  description?: string;
  image?: {
    sourceUrl: string;
    altText?: string;
  };
  count?: number;
}

// Cart Types
export interface CartItem {
  key: string;
  product: Product;
  quantity: number;
  variation?: ProductVariation;
  subtotal: string;
  total: string;
}

export interface Cart {
  contents: {
    nodes: CartItem[];
  };
  subtotal: string;
  total: string;
  totalTax: string;
  shippingTotal?: string;
  appliedCoupons?: Coupon[];
}

export interface Coupon {
  code: string;
  discount: string;
  discountTax: string;
}

// Customer Types
export interface Customer {
  id: string;
  databaseId: number;
  email: string;
  firstName?: string;
  lastName?: string;
  username: string;
  billing?: Address;
  shipping?: Address;
}

export interface Address {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  postcode?: string;
  country?: string;
  email?: string;
  phone?: string;
}

// Order Types
export interface Order {
  id: string;
  databaseId: number;
  orderNumber: string;
  date: string;
  status: string;
  total: string;
  subtotal: string;
  totalTax: string;
  shippingTotal: string;
  paymentMethodTitle: string;
  lineItems: {
    nodes: OrderLineItem[];
  };
  billing?: Address;
  shipping?: Address;
  customer?: Customer;
}

export interface OrderLineItem {
  productId: number;
  variationId?: number;
  quantity: number;
  total: string;
  subtotal: string;
  product?: Product;
}

// Auth Types
export interface AuthTokens {
  authToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  login: {
    authToken: string;
    refreshToken: string;
    user: Customer;
  };
}

export interface RegisterResponse {
  registerCustomer: {
    authToken: string;
    refreshToken: string;
    customer: Customer;
  };
}

// Checkout Types
export interface CheckoutInput {
  billing: Address;
  shipping?: Address;
  paymentMethod: string;
  shipToDifferentAddress?: boolean;
  customerNote?: string;
}

// Stripe Types
export interface StripeCheckoutSession {
  id: string;
  url: string;
}

// API Response Types
export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{
    message: string;
    extensions?: any;
  }>;
}

// REST API Types
export interface WooCommerceProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  description: string;
  short_description: string;
  images: Array<{
    id: number;
    src: string;
    alt: string;
  }>;
  categories: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  stock_status: string;
  average_rating: string;
  rating_count: number;
}

export interface WooCommerceOrder {
  id: number;
  order_key: string;
  status: string;
  total: string;
  line_items: Array<{
    id: number;
    product_id: number;
    quantity: number;
    total: string;
  }>;
  billing: Address;
  shipping: Address;
}

// SEO Types
export interface SEOData {
  title: string;
  description: string;
  canonical?: string;
  openGraph: {
    title: string;
    description: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
    type: string;
    url?: string;
  };
  jsonLd?: any;
}
