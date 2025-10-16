// Test script for Cash on Delivery functionality
// This script tests the COD API endpoint

const testCODOrder = async () => {
  try {
    const testOrderData = {
      items: [
        {
          product: {
            id: "1",
            databaseId: 1,
            name: "Test Product",
            price: "29.99"
          },
          quantity: 2,
          variation: null
        }
      ],
      billingInfo: {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        phone: "1234567890",
        address1: "123 Test Street",
        address2: "",
        city: "Test City",
        state: "CA",
        postcode: "12345",
        country: "US"
      },
      paymentMethod: "cod"
    };

    console.log("Testing COD API endpoint...");
    console.log("Test data:", JSON.stringify(testOrderData, null, 2));

    const response = await fetch("http://localhost:3001/api/checkout/cod", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(testOrderData)
    });

    const result = await response.json();
    
    console.log("Response status:", response.status);
    console.log("Response data:", JSON.stringify(result, null, 2));

    if (response.ok) {
      console.log("✅ COD API test successful!");
      console.log(`Order ID: ${result.orderId}`);
      console.log(`Order Status: ${result.status}`);
    } else {
      console.log("❌ COD API test failed");
      console.log("Error:", result.error);
    }

  } catch (error) {
    console.error("❌ Test failed with error:", error.message);
  }
};

// Run the test
testCODOrder();