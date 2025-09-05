describe('Sanity Test: Register and Login', () => {
  it('should register a new user and receive a token', () => {
    cy.registerAndLogin('user').then(({ token, user }) => {
      // Confirm token exists
      expect(token).to.exist;

      // Confirm user object has an email
      expect(user).to.have.property('email');

      // Log the results to Cypress console for sanity check
      cy.log(`Registered user: ${user.email}`);
      cy.log(`Token: ${token.substring(0, 20)}...`);
    });
  });
});
