import dotenv from "dotenv";
dotenv.config();

// Test registration endpoint
const testRegistration = async () => {
  const testData = {
    name: "Test User",
    email: `test${Date.now()}@example.com`,
    password: "Test123456",
    phone: "0771234567",
    age: 25,
    gender: "male"
  };

  try {
    console.log("🧪 Testing registration endpoint...");
    console.log("📝 Test data:", testData);
    
    const response = await fetch(`http://localhost:${process.env.PORT || 4000}/api/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testData),
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log("✅ Registration successful!");
      console.log("📋 Response:", JSON.stringify(data, null, 2));
    } else {
      console.log("❌ Registration failed!");
      console.log("Status:", response.status);
      console.log("Error:", data);
    }
  } catch (error) {
    console.error("❌ Error testing registration:", error.message);
    console.error("Make sure the backend server is running on port", process.env.PORT || 4000);
  }
};

testRegistration();

