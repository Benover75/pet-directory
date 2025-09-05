// Simple test setup
process.env.NODE_ENV = 'test';

// Basic console mock
const originalConsole = console;
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Restore original console
afterAll(() => {
  global.console = originalConsole;
});

// Set test timeout
jest.setTimeout(30000);
