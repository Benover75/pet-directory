describe('Business E2E Tests', () => {
  let authToken;
  let businessId;

  before(() => {
    cy.registerAndLogin('business_owner').then(({ token }) => {
      authToken = token;
    });
  });

  it('should fetch all businesses', () => {
    cy.request('GET', '/api/v1/businesses').then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.be.an('array');
    });
  });

  it('should create a business', () => {
    const newBusiness = {
      name: 'Test Business',
      description: 'A great place for pets',
      category: 'Veterinarian',
      address: '123 Pet Lane',
      city: 'Dogville',
      state: 'CA',
      zip: '90210',
      phone: '123-456-7890',
      website: 'https://example.com',
    };

    cy.request({
      method: 'POST',
      url: '/api/v1/businesses',
      headers: { Authorization: `Bearer ${authToken}` },
      body: newBusiness,
    }).then((response) => {
      expect(response.status).to.eq(201);
      businessId = response.body.id;
    });
  });

  it('should fetch a business by ID', () => {
    cy.request('GET', `/api/v1/businesses/${businessId}`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.id).to.eq(businessId);
    });
  });
});
