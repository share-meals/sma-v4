import 'cypress-axe';

describe('PageNotFound', () => {
  beforeEach(() => {
    cy.visit('/page-not-found');
  });

  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });
});
