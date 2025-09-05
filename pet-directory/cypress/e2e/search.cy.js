describe('Search E2E Tests', () => {
    it('should search businesses', () => {
      cy.request('GET', '/api/v1/search?query=vet').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  
    it('should search services', () => {
      cy.request('GET', '/api/v1/search?query=grooming').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  
    it('should return empty array for no results', () => {
      cy.request('GET', '/api/v1/search?query=xyznotfound').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array').that.is.empty;
      });
    });
  });
  