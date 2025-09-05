// cypress/e2e/comprehensive-test-suite.cy.js

describe('Pet Directory - Comprehensive E2E Test Suite', () => {
  
    beforeEach(() => {
      // Reset and prepare test environment
      cy.setTestEnvironment();
    });
  
    describe('🔧 System Health & Contract Validation', () => {
      it('should validate API contract compliance', () => {
        cy.validateApiContract().then((contractValid) => {
          expect(contractValid).to.be.true;
        });
      });
  
      it('should have healthy system endpoints', () => {
        cy.apiGet('/health').then((response) => {
          cy.validateApiResponse(response, 200);
          expect(response.body).to.have.property('status', 'healthy');
        });
      });
  
      it('should validate database connectivity', () => {
        cy.queryDb('SELECT COUNT(*) as count FROM pets').then((result) => {
          expect(result).to.be.an('array');
          expect(result[0]).to.have.property('count');
        });
      });
    });
  
    describe('🔐 Authentication & Authorization', () => {
      it('should handle user authentication flow', () => {
        cy.visit('/login');
        
        // Test login
        cy.get('[data-cy=email-input]').type('test@example.com');
        cy.get('[data-cy=password-input]').type('password123');
        cy.get('[data-cy=login-button]').click();
        
        cy.url().should('include', '/dashboard');
        cy.get('[data-cy=user-profile]').should('be.visible');
      });
  
      it('should protect authenticated routes', () => {
        cy.visit('/dashboard');
        cy.url().should('include', '/login');
        
        cy.get('[data-cy=error-message]')
          .should('contain', 'Please log in to access this page');
      });
  
      it('should handle logout correctly', () => {
        cy.login();
        cy.get('[data-cy=logout-button]').click();
        
        cy.url().should('include', '/login');
        cy.window().then((window) => {
          expect(window.localStorage.getItem('authToken')).to.be.null;
        });
      });
    });
  
    describe('🐕 Pet Management - CRUD Operations', () => {
      beforeEach(() => {
        cy.login();
      });
  
      it('should create a new pet with complete data', () => {
        cy.visit('/pets/new');
        
        // Fill form with comprehensive pet data
        cy.get('[data-cy=pet-name]').type('Max');
        cy.get('[data-cy=pet-breed]').select('Golden Retriever');
        cy.get('[data-cy=pet-age]').type('3');
        cy.get('[data-cy=pet-weight]').type('65.5');
        cy.get('[data-cy=pet-description]').type('Friendly and energetic dog');
        
        // Upload pet image
        cy.uploadFile('[data-cy=pet-image]', 'test-pet-image.jpg', 'image/jpeg');
        
        cy.get('[data-cy=save-pet-button]').click();
        
        // Verify creation
        cy.get('[data-cy=success-message]')
          .should('contain', 'Pet created successfully');
        
        cy.url().should('match', /\/pets\/\d+$/);
        
        // Verify data persistence
        cy.get('[data-cy=pet-name-display]').should('contain', 'Max');
        cy.get('[data-cy=pet-breed-display]').should('contain', 'Golden Retriever');
      });
  
      it('should display pets list with filtering and pagination', () => {
        cy.visit('/pets');
        
        // Test filtering
        cy.get('[data-cy=breed-filter]').select('Labrador');
        cy.get('[data-cy=apply-filter]').click();
        
        cy.get('[data-cy=pets-list] [data-cy=pet-card]')
          .should('have.length.greaterThan', 0)
          .each(($card) => {
            cy.wrap($card).should('contain', 'Labrador');
          });
        
        // Test pagination
        cy.get('[data-cy=pagination-info]').should('be.visible');
        
        if (cy.get('[data-cy=next-page]').should('exist')) {
          cy.get('[data-cy=next-page]').click();
          cy.url().should('include', 'page=2');
        }
      });
  
      it('should update pet information', () => {
        // First create a pet to update
        cy.apiPost('/pets', {
          name: 'Buddy',
          breed: 'Beagle',
          age: 2,
          weight: 25.0
        }).then((response) => {
          const petId = response.body.id;
          
          cy.visit(`/pets/${petId}/edit`);
          
          cy.get('[data-cy=pet-name]').clear().type('Buddy Updated');
          cy.get('[data-cy=pet-age]').clear().type('3');
          
          cy.get('[data-cy=update-pet-button]').click();
          
          cy.get('[data-cy=success-message]')
            .should('contain', 'Pet updated successfully');
          
          // Verify update
          cy.visit(`/pets/${petId}`);
          cy.get('[data-cy=pet-name-display]').should('contain', 'Buddy Updated');
          cy.get('[data-cy=pet-age-display]').should('contain', '3');
        });
      });
  
      it('should delete pet with confirmation', () => {
        // Create pet to delete
        cy.apiPost('/pets', {
          name: 'TempPet',
          breed: 'Mixed',
          age: 1
        }).then((response) => {
          const petId = response.body.id;
          
          cy.visit(`/pets/${petId}`);
          
          cy.get('[data-cy=delete-pet-button]').click();
          
          // Confirm deletion
          cy.get('[data-cy=confirm-delete-modal]').should('be.visible');
          cy.get('[data-cy=confirm-delete-button]').click();
          
          cy.get('[data-cy=success-message]')
            .should('contain', 'Pet deleted successfully');
          
          // Verify deletion
          cy.visit(`/pets/${petId}`);
          cy.get('[data-cy=error-message]')
            .should('contain', 'Pet not found');
        });
      });
    });
  
    describe('📊 Data Analytics & Reporting', () => {
      beforeEach(() => {
        cy.login();
        cy.seedData('analytics'); // Seed analytics-specific test data
      });
  
      it('should display analytics dashboard with charts', () => {
        cy.visit('/analytics');
        
        cy.waitForProcessing('[data-cy=loading-indicator]');
        
        // Verify charts are rendered
        cy.validateChartData('[data-cy=breed-distribution-chart]');
        cy.validateChartData('[data-cy=age-distribution-chart]');
        cy.validateChartData('[data-cy=weight-trends-chart]');
        
        // Verify data tables
        cy.validateTableData('[data-cy=top-breeds-table]', 5);
      });
  
      it('should generate and download reports', () => {
        cy.visit('/reports');
        
        cy.get('[data-cy=date-range-start]').type('2024-01-01');
        cy.get('[data-cy=date-range-end]').type('2024-12-31');
        cy.get('[data-cy=report-type]').select('comprehensive');
        
        cy.measurePerformance(() => {
          cy.get('[data-cy=generate-report]').click();
          cy.waitForProcessing('[data-cy=report-status]');
        });
        
        cy.get('[data-cy=report-ready]').should('be.visible');
        
        // Test download functionality
        cy.downloadAndVerify('[data-cy=download-report]', 'pet-report.csv');
      });
  
      it('should handle large dataset processing', () => {
        cy.visit('/data-import');
        
        // Upload large test dataset
        cy.uploadFile('[data-cy=data-file-upload]', 'large-pet-dataset.csv');
        
        cy.get('[data-cy=import-button]').click();
        
        // Wait for processing (extended timeout for large data)
        cy.waitForProcessing('[data-cy=import-status]', 60000);
        
        cy.get('[data-cy=import-complete]').should('be.visible');
        cy.get('[data-cy=records-processed]')
          .invoke('text')
          .then((text) => {
            const recordCount = parseInt(text.replace(/\D/g, ''));
            expect(recordCount).to.be.greaterThan(1000);
          });
      });
    });
  
    describe('🔍 Search & Filtering', () => {
      beforeEach(() => {
        cy.login();
        cy.seedData('search'); // Seed search-specific test data
      });
  
      it('should perform advanced search with multiple criteria', () => {
        cy.visit('/search');
        
        cy.get('[data-cy=search-name]').type('Max');
        cy.get('[data-cy=search-breed]').select('Golden Retriever');
        cy.get('[data-cy=search-age-min]').type('2');
        cy.get('[data-cy=search-age-max]').type('5');
        
        cy.get('[data-cy=search-button]').click();
        
        cy.waitForProcessing('[data-cy=search-loading]');
        
        cy.get('[data-cy=search-results]').within(() => {
          cy.get('[data-cy=result-item]').should('have.length.greaterThan', 0);
          
          // Verify results match criteria
          cy.get('[data-cy=result-item]').each(($item) => {
            cy.wrap($item).within(() => {
              cy.get('[data-cy=pet-name]').should('contain.text', 'Max');
              cy.get('[data-cy=pet-breed]').should('contain.text', 'Golden Retriever');
            });
          });
        });
      });
  
      it('should handle real-time search suggestions', () => {
        cy.visit('/pets');
        
        cy.get('[data-cy=search-input]').type('Gol');
        
        // Wait for suggestions
        cy.get('[data-cy=search-suggestions]', { timeout: 3000 })
          .should('be.visible')
          .within(() => {
            cy.get('[data-cy=suggestion]')
              .should('contain.text', 'Golden Retriever')
              .first()
              .click();
          });
        
        cy.get('[data-cy=search-input]')
          .should('have.value', 'Golden Retriever');
      });
    });
  
    describe('📱 Responsive Design & Accessibility', () => {
      beforeEach(() => {
        cy.login();
      });
  
      it('should be responsive on mobile devices', () => {
        cy.viewport('iphone-x');
        
        cy.visit('/pets');
        
        // Verify mobile navigation
        cy.get('[data-cy=mobile-menu-toggle]').should('be.visible').click();
        cy.get('[data-cy=mobile-menu]').should('be.visible');
        
        // Test mobile-specific layouts
        cy.get('[data-cy=pets-list]')
          .should('have.class', 'mobile-layout');
        
        cy.get('[data-cy=pet-card]')
          .should('have.css', 'flex-direction', 'column');
      });
  
      it('should meet accessibility standards', () => {
        cy.visit('/pets');
        
        // Check for proper heading structure
        cy.get('h1').should('exist').and('be.visible');
        cy.get('[role="main"]').should('exist');
        
        // Verify form labels
        cy.visit('/pets/new');
        cy.get('input').each(($input) => {
          const id = $input.attr('id');
          if (id) {
            cy.get(`label[for="${id}"]`).should('exist');
          }
        });
        
        // Test keyboard navigation
        cy.get('[data-cy=pet-name]').focus();
        cy.focused().should('have.attr', 'data-cy', 'pet-name');
        
        cy.tab();
        cy.focused().should('have.attr', 'data-cy', 'pet-breed');
      });
    });
  
    describe('⚡ Performance & Load Testing', () => {
      it('should load pages within performance budgets', () => {
        cy.measurePerformance(() => {
          cy.visit('/pets');
          cy.get('[data-cy=pets-list]').should('be.visible');
        });
        
        // Measure API response times
        cy.measurePerformance(() => {
          cy.apiGet('/pets?limit=50').then((response) => {
            cy.validateApiResponse(response, 200);
          });
        });
      });
  
      it('should handle concurrent operations', () => {
        cy.login();
        
        // Simulate concurrent requests
        const promises = [];
        for (let i = 0; i < 5; i++) {
          promises.push(
            cy.apiPost('/pets', {
              name: `ConcurrentPet${i}`,
              breed: 'Test Breed',
              age: i + 1
            })
          );
        }
        
        // All requests should succeed
        cy.then(() => {
          return Promise.all(promises);
        }).then((responses) => {
          responses.forEach((response) => {
            expect(response.status).to.eq(201);
          });
        });
      });
    });
  
    describe('🔄 Error Handling & Edge Cases', () => {
      beforeEach(() => {
        cy.login();
      });
  
      it('should handle network failures gracefully', () => {
        // Intercept and fail API calls
        cy.intercept('GET', '/api/pets', { forceNetworkError: true }).as('networkFailure');
        
        cy.visit('/pets');
        
        cy.wait('@networkFailure');
        
        cy.get('[data-cy=error-message]')
          .should('be.visible')
          .and('contain', 'Network error');
        
        cy.get('[data-cy=retry-button]').should('be.visible');
      });
  
      it('should validate form inputs properly', () => {
        cy.visit('/pets/new');
        
        // Test required field validation
        cy.get('[data-cy=save-pet-button]').click();
        
        cy.get('[data-cy=pet-name]')
          .should('have.attr', 'aria-invalid', 'true');
        
        cy.get('[data-cy=error-message]')
          .should('contain', 'Name is required');
        
        // Test data type validation
        cy.get('[data-cy=pet-age]').type('not-a-number');
        cy.get('[data-cy=save-pet-button]').click();
        
        cy.get('[data-cy=age-error]')
          .should('contain', 'Age must be a valid number');
      });
  
      it('should handle server errors appropriately', () => {
        // Mock server error
        cy.intercept('POST', '/api/pets', {
          statusCode: 500,
          body: { error: 'Internal server error' }
        }).as('serverError');
        
        cy.visit('/pets/new');
        cy.get('[data-cy=pet-name]').type('Test Pet');
        cy.get('[data-cy=pet-breed]').select('Labrador');
        cy.get('[data-cy=save-pet-button]').click();
        
        cy.wait('@serverError');
        
        cy.get('[data-cy=error-message]')
          .should('contain', 'Unable to save pet. Please try again.');
          
        cy.get('[data-cy=retry-button]').should('be.visible');
      });
    });
  });