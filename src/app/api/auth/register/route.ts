import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, firstName, lastName } = body;

    // Validate required fields
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email, and password are required' },
        { status: 400 }
      );
    }

    // Register user via WordPress REST API
    try {
      const response = await axios.post(
        `${WORDPRESS_URL}/wp-json/wp/v2/users`,
        {
          username,
          email,
          password,
          first_name: firstName || '',
          last_name: lastName || '',
          roles: ['customer'],
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return NextResponse.json({
        success: true,
        user: {
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          firstName: response.data.first_name,
          lastName: response.data.last_name,
        },
      });
    } catch (wpError: any) {
      console.error('WordPress registration error:', wpError.response?.data);
      
      if (wpError.response?.status === 403) {
        return NextResponse.json(
          { error: 'User registration is disabled. Please contact the administrator.' },
          { status: 403 }
        );
      }
      
      if (wpError.response?.data?.code === 'existing_user_login') {
        return NextResponse.json(
          { error: 'Username already exists. Please choose a different username.' },
          { status: 400 }
        );
      }
      
      if (wpError.response?.data?.code === 'existing_user_email') {
        return NextResponse.json(
          { error: 'Email already registered. Please use a different email.' },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: wpError.response?.data?.message || 'Registration failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}