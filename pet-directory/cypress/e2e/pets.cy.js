describe('Pets E2E Tests', () => {
    let authToken;
    let petId;
  
    before(() => {
      cy.registerAndLogin('user').then(({ token }) => {
        authToken = token;
      });
    });
  
    it('should create a pet', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/pets',
        headers: { Authorization: `Bearer ${authToken}` },
        body: { name: 'Buddy', type: 'Dog', breed: 'Golden Retriever', age: 3, weight: 30 },
      }).then((response) => {
        expect(response.status).to.eq(201);
        petId = response.body.id;
      });
    });
  
    it('should fetch pets', () => {
      cy.request({
        method: 'GET',
        url: '/api/v1/pets',
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.be.an('array');
      });
    });
  
    it('should update a pet', () => {
      cy.request({
        method: 'PATCH',
        url: `/api/v1/pets/${petId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: { name: 'Buddy Jr.', age: 4 },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.name).to.eq('Buddy Jr.');
      });
    });
  
    it('should delete a pet', () => {
      cy.request({
        method: 'DELETE',
        url: `/api/v1/pets/${petId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((response) => {
        expect(response.status).to.eq(204);
      });
    });
  });
  