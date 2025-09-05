const { defineConfig } = require('cypress');
const { execSync } = require('child_process');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5000',
    supportFile: 'cypress/support/e2e.js',
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: true,
    screenshotOnRunFailure: true,
    
    // Enhanced timeouts for data processing operations
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    
    // Environment variables
    env: {
      apiUrl: 'http://localhost:5000/api',
      testDbName: 'pet_directory_test'
    },
    
    setupNodeEvents(on, config) {
      // Database management tasks leveraging your existing Sequelize setup
      on('task', {
        // Reset test database using your existing migration system
        resetTestDb: async () => {
          try {
            console.log('🔄 Resetting test database...');
            
            // Use your existing test preparation script
            execSync('npm run test:prepare', { 
              stdio: 'inherit',
              env: { ...process.env, NODE_ENV: 'test' }
            });
            
            console.log('✅ Test database reset complete');
            return null;
          } catch (error) {
            console.error('❌ Database reset failed:', error.message);
            throw error;
          }
        },

        // Seed specific test data
        seedTestData: async (dataType = 'all') => {
          try {
            console.log(`🌱 Seeding test data: ${dataType}`);
            
            const seedCommand = dataType === 'all' 
              ? 'cross-env NODE_ENV=test sequelize-cli --config config/config.js db:seed:all'
              : `cross-env NODE_ENV=test sequelize-cli --config config/config.js db:seed --seed ${dataType}`;
            
            execSync(seedCommand, { 
              stdio: 'inherit',
              cwd: process.cwd()
            });
            
            console.log('✅ Test data seeded successfully');
            return null;
          } catch (error) {
            console.error('❌ Seeding failed:', error.message);
            throw error;
          }
        },

        // Clean up test data
        cleanTestData: async () => {
          try {
            console.log('🧹 Cleaning test data...');
            
            execSync('cross-env NODE_ENV=test sequelize-cli --config config/config.js db:migrate:undo:all', {
              stdio: 'inherit'
            });
            
            console.log('✅ Test data cleaned');
            return null;
          } catch (error) {
            console.error('❌ Cleanup failed:', error.message);
            throw error;
          }
        },

        // Start test server
        startTestServer: async () => {
          try {
            console.log('🚀 Starting test server...');
            
            // Start your server in test mode (non-blocking)
            const serverProcess = execSync('npm run start:test &', {
              stdio: 'inherit',
              detached: true
            });
            
            // Wait for server to be ready
            await new Promise(resolve => setTimeout(resolve, 3000));
            
            console.log('✅ Test server started');
            return serverProcess.pid;
          } catch (error) {
            console.error('❌ Server start failed:', error.message);
            throw error;
          }
        },

        // Run contract tests within Cypress
        runContractTests: async () => {
          try {
            console.log('📋 Running contract tests...');
            
            execSync('npm run test:contract', {
              stdio: 'inherit'
            });
            
            console.log('✅ Contract tests passed');
            return true;
          } catch (error) {
            console.error('❌ Contract tests failed:', error.message);
            return false;
          }
        },

        // Database query for test verification
        queryTestDb: async (query) => {
          try {
            const { Sequelize } = require('sequelize');
            const config = require('./config/config.js');
            
            const sequelize = new Sequelize(config.test);
            const [results] = await sequelize.query(query);
            
            await sequelize.close();
            return results;
          } catch (error) {
            console.error('❌ Database query failed:', error.message);
            throw error;
          }
        }
      });

      // File preprocessing for fixtures
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--no-sandbox');
        }
        return launchOptions;
      });

      // Handle test failures
      on('after:spec', (spec, results) => {
        if (results && results.video) {
          // Keep video only for failed tests in CI
          if (results.stats.failures === 0 && process.env.CI) {
            require('fs').unlinkSync(results.video);
          }
        }
      });

      return config;
    },
  },

  component: {
    devServer: {
      framework: 'react',  // Adjust if using different framework
      bundler: 'webpack',
    },
  },
});