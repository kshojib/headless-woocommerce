import axios, { AxiosInstance } from 'axios';
import https from 'https';

const WOOCOMMERCE_URL = process.env.WOOCOMMERCE_URL || '';
const CONSUMER_KEY = process.env.WOOCOMMERCE_CONSUMER_KEY || '';
const CONSUMER_SECRET = process.env.WOOCOMMERCE_CONSUMER_SECRET || '';

class WooCommerceAPI {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${WOOCOMMERCE_URL}/wp-json/wc/v3`,
      auth: {
        username: CONSUMER_KEY,
        password: CONSUMER_SECRET,
      },
      headers: {
        'Content-Type': 'application/json',
      },
      // Ignore self-signed certificates for local development
      httpsAgent: new https.Agent({
        rejectUnauthorized: false,
      }),
    });
  }

  // Products
  async getProducts(params?: {
    per_page?: number;
    page?: number;
    category?: string;
    search?: string;
    orderby?: string;
    order?: 'asc' | 'desc';
  }) {
    try {
      const response = await this.client.get('/products', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
    }
  }

  async getRecentProducts(limit: number = 8) {
    try {
      const response = await this.client.get('/products', {
        params: {
          per_page: limit,
          orderby: 'date',
          order: 'desc',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching recent products:', error);
      throw error;
    }
  }

  async getProductBySlug(slug: string) {
    try {
      const response = await this.client.get('/products', {
        params: { slug },
      });
      return response.data[0] || null;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  async getProductById(id: number) {
    try {
      const response = await this.client.get(`/products/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
      throw error;
    }
  }

  // Categories
  async getCategories(params?: {
    per_page?: number;
    page?: number;
  }) {
    try {
      const response = await this.client.get('/products/categories', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  async getCategoryBySlug(slug: string) {
    try {
      const response = await this.client.get('/products/categories', {
        params: { slug },
      });
      return response.data[0] || null;
    } catch (error) {
      console.error('Error fetching category:', error);
      throw error;
    }
  }

  // Orders
  async createOrder(orderData: any) {
    try {
      const response = await this.client.post('/orders', orderData);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async getOrder(orderId: number) {
    try {
      const response = await this.client.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  }

  async updateOrder(orderId: number, data: any) {
    try {
      const response = await this.client.put(`/orders/${orderId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  }

  async getCustomerOrders(customerId: number, params?: {
    per_page?: number;
    page?: number;
  }) {
    try {
      const response = await this.client.get('/orders', {
        params: { customer: customerId, ...params },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching customer orders:', error);
      throw error;
    }
  }

  // Customers
  async getCustomer(customerId: number) {
    try {
      const response = await this.client.get(`/customers/${customerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      throw error;
    }
  }

  async updateCustomer(customerId: number, data: any) {
    try {
      const response = await this.client.put(`/customers/${customerId}`, data);
      return response.data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  }

  // Coupons
  async applyCoupon(code: string) {
    try {
      const response = await this.client.get('/coupons', {
        params: { code },
      });
      return response.data[0] || null;
    } catch (error) {
      console.error('Error applying coupon:', error);
      throw error;
    }
  }
}

export const wooCommerceAPI = new WooCommerceAPI();
