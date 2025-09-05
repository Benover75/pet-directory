describe('Services E2E Tests', () => {
  let authToken;
  let businessId;
  let serviceId;

  before(() => {
    cy.registerAndLogin('business_owner').then(({ token }) => {
      authToken = token;

      return cy.request({
        method: 'POST',
        url: '/api/v1/businesses',
        headers: { Authorization: `Bearer ${authToken}` },
        body: {
          name: 'Test Business',
          description: 'Pet services provider',
          category: 'Grooming',
          address: '123 Pet Street',
          city: 'Dogville',
          state: 'CA',
          zip: '90210',
          phone: '111-222-3333',
          website: 'https://test.com',
        },
      });
    }).then((businessResponse) => {
      businessId = businessResponse.body.id;
    });
  });

  it('should create a service', () => {
    cy.request({
      method: 'POST',
      url: '/api/v1/services',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        name: 'Pet Grooming',
        description: 'Professional grooming',
        price: 50,
        duration: 60,
        businessId,
      },
    }).then((response) => {
      expect(response.status).to.eq(201);
      serviceId = response.body.id;
    });
  });

  it('should fetch services by business ID', () => {
    cy.request('GET', `/api/v1/businesses/${businessId}/services`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body[0].id).to.eq(serviceId);
    });
  });

  it('should update a service', () => {
    cy.request({
      method: 'PATCH',
      url: `/api/v1/services/${serviceId}`,
      headers: { Authorization: `Bearer ${authToken}` },
      body: { name: 'Premium Grooming', price: 65 },
    }).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.name).to.eq('Premium Grooming');
    });
  });

  it('should delete a service', () => {
    cy.request({
      method: 'DELETE',
      url: `/api/v1/services/${serviceId}`,
      headers: { Authorization: `Bearer ${authToken}` },
    }).then((response) => {
      expect(response.status).to.eq(204);
    });
  });
});
