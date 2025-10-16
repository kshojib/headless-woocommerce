import { GraphQLClient } from 'graphql-request';
import https from 'https';

const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || '';

// Create HTTPS agent that ignores self-signed certificates (for local development only)
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

export const graphQLClient = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
  fetch: (url, options) => {
    return fetch(url, {
      ...options,
      // @ts-ignore
      agent: httpsAgent,
    });
  },
});

// Add auth token to requests
export const getAuthenticatedClient = (token: string) => {
  return new GraphQLClient(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    fetch: (url, options) => {
      return fetch(url, {
        ...options,
        // @ts-ignore
        agent: httpsAgent,
      });
    },
  });
};

// GraphQL Queries
export const GET_PRODUCTS = `
  query GetProducts($first: Int = 10, $after: String) {
    products(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        name
        slug
        description
        shortDescription
        onSale
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
          stockStatus
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          stockStatus
        }
        ... on ExternalProduct {
          price
          regularPrice
          salePrice
          externalUrl
          buttonText
        }
        image {
          sourceUrl
          altText
        }
        productCategories {
          nodes {
            id
            databaseId
            name
            slug
          }
        }
        averageRating
        reviewCount
      }
    }
  }
`;

export const GET_PRODUCT_BY_SLUG = `
  query GetProductBySlug($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      slug
      description
      shortDescription
      onSale
      ... on SimpleProduct {
        price
        regularPrice
        salePrice
        stockStatus
        weight
        length
      }
      ... on VariableProduct {
        price
        regularPrice
        salePrice
        stockStatus
        attributes {
          nodes {
            id
            name
            options
            variation
          }
        }
        variations {
          nodes {
            id
            databaseId
            name
            price
            regularPrice
            salePrice
            stockStatus
            attributes {
              nodes {
                id
                name
                value
              }
            }
          }
        }
      }
      ... on ExternalProduct {
        price
        regularPrice
        salePrice
        externalUrl
        buttonText
      }
      image {
        sourceUrl
        altText
      }
      galleryImages {
        nodes {
          sourceUrl
          altText
        }
      }
      productCategories {
        nodes {
          id
          databaseId
          name
          slug
        }
      }
      averageRating
      reviewCount
    }
  }
`;

export const GET_CATEGORIES = `
  query GetCategories($first: Int = 50) {
    productCategories(first: $first) {
      nodes {
        id
        databaseId
        name
        slug
        description
        count
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`;

export const GET_PRODUCTS_BY_CATEGORY = `
  query GetProductsByCategory($categorySlug: String!, $first: Int = 10, $after: String) {
    products(first: $first, after: $after, where: { category: $categorySlug }) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        databaseId
        name
        slug
        description
        shortDescription
        onSale
        ... on SimpleProduct {
          price
          regularPrice
          salePrice
          stockStatus
        }
        ... on VariableProduct {
          price
          regularPrice
          salePrice
          stockStatus
        }
        ... on ExternalProduct {
          price
          regularPrice
          salePrice
          externalUrl
          buttonText
        }
        image {
          sourceUrl
          altText
        }
        productCategories {
          nodes {
            id
            databaseId
            name
            slug
          }
        }
        averageRating
        reviewCount
      }
    }
  }
`;

export const GET_CART = `
  query GetCart {
    cart {
      contents {
        nodes {
          key
          quantity
          subtotal
          total
          product {
            node {
              id
              databaseId
              name
              slug
              ... on SimpleProduct {
                price
              }
              image {
                sourceUrl
                altText
              }
            }
          }
        }
      }
      subtotal
      total
      totalTax
      shippingTotal
    }
  }
`;

export const ADD_TO_CART = `
  mutation AddToCart($productId: Int!, $quantity: Int = 1) {
    addToCart(input: { productId: $productId, quantity: $quantity }) {
      cart {
        contents {
          nodes {
            key
            quantity
            subtotal
            total
            product {
              node {
                id
                databaseId
                name
                slug
                ... on SimpleProduct {
                  price
                }
                image {
                  sourceUrl
                  altText
                }
              }
            }
          }
        }
        subtotal
        total
        totalTax
      }
    }
  }
`;

export const UPDATE_CART_ITEM = `
  mutation UpdateCartItem($key: ID!, $quantity: Int!) {
    updateItemQuantities(input: { items: [{ key: $key, quantity: $quantity }] }) {
      cart {
        contents {
          nodes {
            key
            quantity
            subtotal
            total
            product {
              node {
                id
                databaseId
                name
                slug
                ... on SimpleProduct {
                  price
                }
                image {
                  sourceUrl
                  altText
                }
              }
            }
          }
        }
        subtotal
        total
        totalTax
      }
    }
  }
`;

export const REMOVE_FROM_CART = `
  mutation RemoveFromCart($keys: [ID!]!) {
    removeItemsFromCart(input: { keys: $keys }) {
      cart {
        contents {
          nodes {
            key
            quantity
            subtotal
            total
            product {
              node {
                id
                databaseId
                name
                slug
                ... on SimpleProduct {
                  price
                }
                image {
                  sourceUrl
                  altText
                }
              }
            }
          }
        }
        subtotal
        total
        totalTax
      }
    }
  }
`;

export const LOGIN_MUTATION = `
  mutation Login($username: String!, $password: String!) {
    login(input: { username: $username, password: $password }) {
      authToken
      refreshToken
      user {
        id
        databaseId
        email
        firstName
        lastName
        username
      }
    }
  }
`;

export const REGISTER_CUSTOMER = `
  mutation RegisterCustomer($email: String!, $username: String!, $password: String!, $firstName: String, $lastName: String) {
    registerCustomer(
      input: {
        email: $email
        username: $username
        password: $password
        firstName: $firstName
        lastName: $lastName
      }
    ) {
      authToken
      refreshToken
      customer {
        id
        databaseId
        email
        firstName
        lastName
        username
      }
    }
  }
`;

export const GET_CUSTOMER = `
  query GetCustomer {
    customer {
      id
      databaseId
      email
      firstName
      lastName
      username
      billing {
        firstName
        lastName
        company
        address1
        address2
        city
        state
        postcode
        country
        email
        phone
      }
      shipping {
        firstName
        lastName
        company
        address1
        address2
        city
        state
        postcode
        country
      }
    }
  }
`;

export const GET_CUSTOMER_ORDERS = `
  query GetCustomerOrders($first: Int = 10) {
    customer {
      orders(first: $first) {
        nodes {
          id
          databaseId
          orderNumber
          date
          status
          total
          subtotal
          totalTax
          shippingTotal
          paymentMethodTitle
          lineItems {
            nodes {
              productId
              quantity
              total
              subtotal
            }
          }
        }
      }
    }
  }
`;

export const GET_ORDER_DETAILS = `
  query GetOrderDetails($id: ID!) {
    order(id: $id, idType: DATABASE_ID) {
      id
      databaseId
      orderNumber
      date
      status
      total
      subtotal
      totalTax
      shippingTotal
      paymentMethodTitle
      billing {
        firstName
        lastName
        company
        address1
        address2
        city
        state
        postcode
        country
        email
        phone
      }
      shipping {
        firstName
        lastName
        company
        address1
        address2
        city
        state
        postcode
        country
      }
      lineItems {
        nodes {
          productId
          quantity
          total
          subtotal
          product {
            node {
              id
              name
              slug
              image {
                sourceUrl
                altText
              }
            }
          }
        }
      }
    }
  }
`;
