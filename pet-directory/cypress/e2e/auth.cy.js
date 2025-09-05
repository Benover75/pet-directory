describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should allow a user to register and login', () => {
    cy.registerAndLogin('user').then(({ token, user }) => {
      expect(token).to.exist;
      expect(user).to.have.property('email');
    });
  });
});
