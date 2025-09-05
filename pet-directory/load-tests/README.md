# Load Testing with k6

This directory contains load testing scripts for the Pet Directory API using [k6](https://k6.io/).

## Prerequisites

- Install [k6](https://k6.io/docs/getting-started/installation/)
- Node.js (for running the test server)

## Running Tests

### 1. Start the API Server

```bash
# In the project root
npm start
```

### 2. Run Load Tests

```bash
# Run the load test
k6 run api-load-test.js

# Run with more verbose output
k6 run --vus 10 --duration 30s api-load-test.js

# Run with HTML output
k6 run --out json=test_results.json api-load-test.js
```

## Test Scenarios

### Smoke Test
- Verifies that the API is up and responding
- Low load (1-5 VUs)
- Short duration (1-2 minutes)

### Load Test
- Simulates normal traffic
- Medium load (10-50 VUs)
- Medium duration (5-10 minutes)

### Stress Test
- Simulates peak traffic
- High load (50-100+ VUs)
- Short duration (1-5 minutes)

## Performance Thresholds

- 95% of requests should complete within 500ms
- Error rate should be below 10%
- All HTTP requests should return 2xx or 3xx status codes

## Analyzing Results

k6 provides several output formats for analyzing test results:

- Console output (default)
- JSON (for custom analysis)
- InfluxDB (for time-series data)
- Cloud (k6 Cloud)

Example command to generate an HTML report:

```bash
k6 run --out json=test_results.json api-load-test.js
# Then use a tool like k6-to-junit or jq to process the results
```

## Best Practices

1. Start with a small number of VUs and gradually increase
2. Run tests in a staging environment that mirrors production
3. Monitor server resources during tests
4. Set realistic think times between requests
5. Use test data that matches production data distribution
