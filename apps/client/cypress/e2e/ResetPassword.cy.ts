import 'cypress-axe';

describe('Reset Password', () => {
  beforeEach(() => {
    cy.visit('/reset-password');
  });

  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });
});
