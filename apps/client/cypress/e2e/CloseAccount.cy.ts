import 'cypress-axe';

describe('Close Account', () => {
  beforeEach(() => {
    cy.visit('/close-account');
    cy.injectAxe();
  });

  it('has no a11y violation on load', () => {
    cy.checkA11y();
  });
});
