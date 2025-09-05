// cypress/support/commands.js

// Import commands for file uploads, API testing, etc.
import 'cypress-file-upload';

// ===== AUTHENTICATION COMMANDS =====
Cypress.Commands.add('login', (email = 'test@example.com', password = 'password123') => {
  cy.request({
    method: 'POST',
    url: '/api/auth/login',
    body: { email, password }
  }).then((response) => {
    window.localStorage.setItem('authToken', response.body.token);
    cy.visit('/dashboard');
  });
});

Cypress.Commands.add('logout', () => {
  window.localStorage.removeItem('authToken');
  cy.visit('/login');
});

// ===== DATABASE COMMANDS =====
Cypress.Commands.add('resetDb', () => {
  cy.task('resetTestDb');
});

Cypress.Commands.add('seedData', (dataType = 'all') => {
  cy.task('seedTestData', dataType);
});

Cypress.Commands.add('queryDb', (query) => {
  return cy.task('queryTestDb', query);
});

// ===== API TESTING COMMANDS =====
Cypress.Commands.add('apiRequest', (method, endpoint, body = null, headers = {}) => {
  const token = window.localStorage.getItem('authToken');
  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...headers
  };

  return cy.request({
    method,
    url: `${Cypress.env('apiUrl')}${endpoint}`,
    body,
    headers: defaultHeaders,
    failOnStatusCode: false
  });
});

Cypress.Commands.add('apiGet', (endpoint, headers = {}) => {
  return cy.apiRequest('GET', endpoint, null, headers);
});

Cypress.Commands.add('apiPost', (endpoint, body, headers = {}) => {
  return cy.apiRequest('POST', endpoint, body, headers);
});

Cypress.Commands.add('apiPut', (endpoint, body, headers = {}) => {
  return cy.apiRequest('PUT', endpoint, body, headers);
});

Cypress.Commands.add('apiDelete', (endpoint, headers = {}) => {
  return cy.apiRequest('DELETE', endpoint, null, headers);
});

// ===== DATA VALIDATION COMMANDS =====
Cypress.Commands.add('validateJsonSchema', (data, schema) => {
  const Ajv = require('ajv');
  const ajv = new Ajv();
  const validate = ajv.compile(schema);
  const valid = validate(data);
  
  expect(valid, `Data validation failed: ${JSON.stringify(validate.errors)}`).to.be.true;
});

Cypress.Commands.add('validateApiResponse', (response, expectedStatus = 200, schema = null) => {
  expect(response.status).to.eq(expectedStatus);
  expect(response.body).to.not.be.empty;
  
  if (schema) {
    cy.validateJsonSchema(response.body, schema);
  }
});

// ===== FILE HANDLING COMMANDS =====
Cypress.Commands.add('uploadFile', (selector, fileName, mimeType = 'text/csv') => {
  cy.fixture(fileName).then(fileContent => {
    cy.get(selector).attachFile({
      fileContent,
      fileName,
      mimeType
    });
  });
});

Cypress.Commands.add('downloadAndVerify', (downloadSelector, expectedFileName) => {
  cy.get(downloadSelector).click();
  
  // Verify download
  const downloadsFolder = Cypress.config('downloadsFolder');
  cy.readFile(`${downloadsFolder}/${expectedFileName}`).should('exist');
});

// ===== DATA ANALYTICS SPECIFIC COMMANDS =====
Cypress.Commands.add('waitForProcessing', (statusSelector, timeout = 30000) => {
  cy.get(statusSelector, { timeout })
    .should('not.contain', 'Processing')
    .and('not.contain', 'Loading');
});

Cypress.Commands.add('validateChartData', (chartSelector) => {
  cy.get(chartSelector)
    .should('be.visible')
    .within(() => {
      cy.get('svg').should('exist');
      cy.get('[data-testid="chart-data"]').should('have.length.greaterThan', 0);
    });
});

Cypress.Commands.add('validateTableData', (tableSelector, minRows = 1) => {
  cy.get(tableSelector)
    .should('be.visible')
    .find('tbody tr')
    .should('have.length.greaterThan', minRows - 1);
});

// ===== PERFORMANCE TESTING COMMANDS =====
Cypress.Commands.add('measurePerformance', (actionCallback) => {
  const start = performance.now();
  
  actionCallback();
  
  cy.then(() => {
    const end = performance.now();
    const duration = end - start;
    cy.log(`Action completed in ${duration.toFixed(2)}ms`);
    
    // Assert reasonable performance (adjust threshold as needed)
    expect(duration).to.be.lessThan(5000); // 5 second max
  });
});

// ===== CONTRACT TESTING INTEGRATION =====
Cypress.Commands.add('validateApiContract', () => {
  return cy.task('runContractTests');
});

// ===== UTILITY COMMANDS =====
Cypress.Commands.add('waitForServer', (url = Cypress.config('baseUrl')) => {
  cy.request({
    url: `${url}/health`,
    timeout: 10000,
    retryOnStatusCodeFailure: true,
    retryOnNetworkFailure: true
  }).then((response) => {
    expect(response.status).to.eq(200);
  });
});

Cypress.Commands.add('setTestEnvironment', () => {
  cy.task('resetTestDb');
  cy.task('seedTestData');
  cy.waitForServer();
});

// ===== DEBUGGING COMMANDS =====
Cypress.Commands.add('debugLog', (message, data = null) => {
  if (Cypress.env('DEBUG')) {
    cy.log(`🐛 ${message}`);
    if (data) {
      console.log(data);
    }
  }
});

// Custom assertion for API responses
chai.Assertion.addMethod('validApiResponse', function(expectedStatus = 200) {
  const response = this._obj;
  
  this.assert(
    response.status === expectedStatus,
    `expected status #{exp} but got #{act}`,
    `expected status not to be #{act}`,
    expectedStatus,
    response.status
  );
  
  this.assert(
    response.body !== null && response.body !== undefined,
    'expected response body to exist',
    'expected response body not to exist'
  );
});

// Global error handling
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent Cypress from failing the test on uncaught exceptions
  // Customize this based on your error handling strategy
  if (err.message.includes('ResizeObserver loop limit exceeded')) {
    return false;
  }
  
  // Let other errors fail the test
  return true;
});