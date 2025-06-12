import 'cypress-axe';

describe('App Loading Screen', () => {
  beforeEach(() => {
    cy.visit('/?testAppLoadingScreen=true');
    cy.injectAxe();
  });

  it('has no a11y violation on load', () => {
    cy.checkA11y();
  });
});
