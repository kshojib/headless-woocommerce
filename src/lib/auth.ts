import axios from 'axios';

const JWT_AUTH_ENDPOINT = process.env.NEXT_PUBLIC_JWT_AUTH_ENDPOINT || '';

export interface JWTAuthResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
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
      throw new Error(error.response?.data?.message || 'Login failed');
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
      throw new Error(error.response?.data?.message || 'Token refresh failed');
    }
  },
};
