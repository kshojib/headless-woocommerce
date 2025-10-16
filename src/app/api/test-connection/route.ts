import { NextResponse } from 'next/server';
import { graphQLClient } from '@/lib/graphql-client';

export async function GET() {
  try {
    // Test GraphQL connection
    const testQuery = `
      query TestConnection {
        generalSettings {
          title
          url
        }
      }
    `;

    const data = await graphQLClient.request(testQuery);

    return NextResponse.json({
      success: true,
      message: 'GraphQL connection successful',
      data,
      endpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
    });
  } catch (error: any) {
    console.error('GraphQL connection error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'GraphQL connection failed',
        error: error.message,
        endpoint: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT,
        details: error.response?.errors || error,
      },
      { status: 500 }
    );
  }
}
