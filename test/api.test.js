import fetch from 'node-fetch';

const BASE_URL = "http://localhost:3000";

async function testApi() {
  try {
    // Test /api/absensi endpoint
    let response = await fetch(`${BASE_URL}/api/absensi`);
    if (!response.ok) {
      console.error("/api/absensi failed:", await response.text());
    } else {
      const data = await response.json();
      console.log("/api/absensi success:", data.length, "records");
    }

    // Test /api/statistik endpoint
    response = await fetch(`${BASE_URL}/api/statistik`);
    if (!response.ok) {
      console.error("/api/statistik failed:", await response.text());
    } else {
      const data = await response.json();
      console.log("/api/statistik success:", Object.keys(data).length, "dates");
    }
  } catch (error) {
    console.error("API test error:", error);
  }
}

testApi();
