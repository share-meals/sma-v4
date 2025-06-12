import 'cypress-axe';

describe('Privacy Policy', () => {
  beforeEach(() => {
    cy.visit('/privacy-policy');
    cy.injectAxe();
  });

  it('has no a11y violation on load', () => {
    cy.checkA11y();
  });
});
