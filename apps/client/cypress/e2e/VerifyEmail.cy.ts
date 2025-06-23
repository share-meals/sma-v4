import 'cypress-axe';

describe('Verify Email', () => {
  beforeEach(() => {
    cy.visit('/verify-email');
  });

  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });
});
