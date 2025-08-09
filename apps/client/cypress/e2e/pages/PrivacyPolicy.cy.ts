import 'cypress-axe';

describe('Privacy Policy', () => {
  beforeEach(() => {
    cy.visit('/privacy-policy');
  });

  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });
});
