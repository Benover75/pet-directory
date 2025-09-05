import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Configuration
const BASE_URL = 'http://localhost:5000/api/v1';
const ERROR_THRESHOLD = 0.1; // 10% error threshold

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    // Ramp-up from 1 to 50 users over 1 minute
    { duration: '1m', target: 50 },
    // Stay at 50 users for 3 minutes
    { duration: '3m', target: 50 },
    // Ramp-down to 0 users over 1 minute
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    http_req_failed: [`rate<${ERROR_THRESHOLD}`], // Error rate should be below 10%
  },
};

// Test data
const testUser = {
  email: `testuser_${__VU}@example.com`,
  password: 'testpass123',
  name: `Test User ${__VU}`,
};

// Helper function to handle API requests
function makeRequest(method, endpoint, token = null, body = null) {
  const params = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const url = `${BASE_URL}${endpoint}`;
  let response;

  switch (method.toLowerCase()) {
    case 'get':
      response = http.get(url, params);
      break;
    case 'post':
      response = http.post(url, JSON.stringify(body), params);
      break;
    default:
      throw new Error(`Unsupported HTTP method: ${method}`);
  }

  const success = check(response, {
    [`${method} ${endpoint} status was 2xx or 3xx`]: (r) =>
      r.status >= 200 && r.status < 400,
  });

  if (!success) {
    errorRate.add(1);
    console.error(`Request failed: ${method} ${endpoint} - ${response.status}`);
  } else {
    errorRate.add(0);
  }

  return response;
}

// Test scenario
export default function () {
  // 1. Register a new user
  const registerResponse = makeRequest('POST', '/auth/register', null, {
    ...testUser,
    role: 'user',
  });

  // If registration failed, skip the rest of the test
  if (registerResponse.status !== 201) {
    return;
  }

  // 2. Login to get token
  const loginResponse = makeRequest('POST', '/auth/login', null, {
    email: testUser.email,
    password: testUser.password,
  });

  const authToken = loginResponse.json('token');
  if (!authToken) {
    return;
  }

  // 3. Fetch businesses
  const businesses = makeRequest('GET', '/businesses', authToken);
  let businessId = null;
  
  if (businesses && businesses.json() && businesses.json().length > 0) {
    businessId = businesses.json()[0].id;
  }

  // 4. If we have a business, fetch its services
  if (businessId) {
    makeRequest(
      'GET',
      `/businesses/${businessId}/services`,
      authToken
    );
  }

  // 5. Simulate user think time
  sleep(Math.random() * 2);
}
