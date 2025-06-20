describe('PageNotFound', () => {
  beforeEach(() => {
    cy.visit('/page-not-found');
  });

  it('has no a11y violation on load', () => {
    cy.checkA11y();
  });
});
