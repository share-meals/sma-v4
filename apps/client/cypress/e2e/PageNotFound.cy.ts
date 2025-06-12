import 'cypress-axe';

describe('PageNotFound', () => {
  beforeEach(() => {
    cy.visit('/page-not-found');
    cy.injectAxe();
  });

  it('has no a11y violation on load', () => {
    cy.checkA11y();
  });
});
