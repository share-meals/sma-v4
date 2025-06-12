import 'cypress-axe';

describe('Reset Password', () => {
  beforeEach(() => {
    cy.visit('/reset-password');
    cy.injectAxe();
  });

  it('has no a11y violation on load', () => {
    cy.checkA11y();
  });
});
