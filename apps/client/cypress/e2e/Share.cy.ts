import 'cypress-axe';

describe('Share', () => {
  beforeEach(() => {
    cy.visit('/share');
  });

  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });
});
