describe('User Profile E2E Tests', () => {
    let authToken;
    let userId;
  
    before(() => {
      cy.registerAndLogin('user').then(({ token, user }) => {
        authToken = token;
        userId = user.id;
      });
    });
  
    it('should fetch profile', () => {
      cy.request({
        method: 'GET',
        url: `/api/v1/users/${userId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.id).to.eq(userId);
      });
    });
  
    it('should update profile', () => {
      cy.request({
        method: 'PATCH',
        url: `/api/v1/users/${userId}`,
        headers: { Authorization: `Bearer ${authToken}` },
        body: { name: 'Updated User' },
      }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.name).to.eq('Updated User');
      });
    });
  
    it('should delete account', () => {
      cy.request({
        method: 'DELETE',
        url: `/api/v1/users/${userId}`,
        headers: { Authorization: `Bearer ${authToken}` },
      }).then((response) => {
        expect(response.status).to.eq(204);
      });
    });
  });
  