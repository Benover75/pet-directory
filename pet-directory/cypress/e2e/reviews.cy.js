describe('Reviews E2E Tests', () => {
    let authToken;
    let businessId;
    let reviewId;
  
    before(() => {
      cy.registerAndLogin('user').then(({ token }) => {
        authToken = token;
  
        return cy.request({
          method: 'POST',
          url: '/api/v1/businesses',
          headers: { Authorization: `Bearer ${authToken}` },
          body: {
            name: 'Review Business',
            description: 'Business for reviews',
            category: 'Pet Store',
            address: '456 Test Blvd',
            city: 'Catville',
            state: 'TX',
            zip: '73301',
            phone: '222-333-4444',
            website: 'https://review.com',
          },
        });
      }).then((businessResponse) => {
        businessId = businessResponse.body.id;
      });
    });
  
    it('should create a review', () => {
      cy.request({
        method: 'POST',
        url: '/api/v1/reviews',
        headers: { Authorization: `Bearer ${authToken}` },
        body: { rating: 5, comment: 'Amazing!', businessId },
      }).then((response) => {
        expect(response.status).to.eq(201);
        reviewId = response.body.id;
      });
    });
  
    it('should fetch reviews for a business', () => {
      cy.request('GET', `/api/v1/businesses/${businessId}/reviews`).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body[0].id).to.eq(reviewId);
      });
    });
  
    it('should update a review', () => {
      cy.request({
        method: 'PATCH',
        url: `/api/v1/reviews/${reviewId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: { rating: 4, comment: 'Good, but could improve.' },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.rating).to.eq(4);
      });
    });
  
    it('should delete a review', () => {
      cy.request({
        method: 'DELETE',
        url: `/api/v1/reviews/${reviewId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((response) => {
        expect(response.status).to.eq(204);
      });
    });
  });
  