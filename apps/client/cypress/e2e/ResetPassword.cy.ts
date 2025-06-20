describe('', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('has no a11y violation on load', () => {
    cy.checkA11y();
  });
});
