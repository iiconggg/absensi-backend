import axios from 'axios';

const baseURL = 'http://localhost:3000';

async function testAbsensiApi() {
  try {
    // Test GET /api/absensi
    const absensiResponse = await axios.get(`${baseURL}/api/absensi`);
    console.log('GET /api/absensi response:', absensiResponse.data);

    // Test GET /api/statistik
    const statistikResponse = await axios.get(`${baseURL}/api/statistik`);
    console.log('GET /api/statistik response:', statistikResponse.data);

    console.log('API tests completed successfully.');
  } catch (error) {
    console.error('API test failed:', error.message);
  }
}

testAbsensiApi();
