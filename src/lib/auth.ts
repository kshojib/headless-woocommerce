import axios from 'axios';

const JWT_AUTH_ENDPOINT = process.env.NEXT_PUBLIC_JWT_AUTH_ENDPOINT || '';
const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || '';

// Helper function to clean HTML from error messages
const cleanErrorMessage = (message: string): string => {
  if (!message) return 'An error occurred';
  
  // Strip HTML tags
  const withoutHtml = message.replace(/<[^>]*>/g, '');
  
  // Clean up common WordPress error patterns
  let cleaned = withoutHtml
    .replace(/Error:\s*/, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Make specific error messages more user-friendly
  if (cleaned.includes('password you entered') && cleaned.includes('is incorrect')) {
    cleaned = 'Invalid username or password. Please try again.';
  } else if (cleaned.includes('Invalid username')) {
    cleaned = 'Invalid username or password. Please try again.';
  } else if (cleaned.includes('Lost your password')) {
    cleaned = cleaned.replace(/Lost your password\?.*/, '').trim();
    if (cleaned.includes('is incorrect')) {
      cleaned = 'Invalid username or password. Please try again.';
    }
  }
  
  return cleaned || 'An error occurred';
};

export interface JWTAuthResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
}

export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

export const jwtAuth = {
  async login(username: string, password: string): Promise<JWTAuthResponse> {
    try {
      const response = await axios.post(`${JWT_AUTH_ENDPOINT}/token`, {
        username,
        password,
      });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.data?.message || 
                          error.message || 
                          'Login failed';
      throw new Error(cleanErrorMessage(errorMessage));
    }
  },

  async register(userData: {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<RegisterResponse> {
    try {
      // Use our API route for registration
      const response = await axios.post('/api/auth/register', {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
      });
      
      return response.data.user;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Registration failed';
      throw new Error(cleanErrorMessage(errorMessage));
    }
  },

  async validate(token: string): Promise<boolean> {
    try {
      const response = await axios.post(
        `${JWT_AUTH_ENDPOINT}/token/validate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.code === 'jwt_auth_valid_token';
    } catch (error) {
      return false;
    }
  },

  async refresh(token: string): Promise<JWTAuthResponse> {
    try {
      const response = await axios.post(
        `${JWT_AUTH_ENDPOINT}/token/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.data?.message || 
                          error.message || 
                          'Token refresh failed';
      throw new Error(cleanErrorMessage(errorMessage));
    }
  },
};

export async function verifyToken(token: string): Promise<any> {
  try {
    const response = await axios.post(
      `${JWT_AUTH_ENDPOINT}/token/validate`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    throw new Error('Invalid token');
  }
}

export function generateOrderHash(orderId: string | number): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2);
  return Buffer.from(`${orderId}_${timestamp}_${randomStr}`).toString('base64url');
}
