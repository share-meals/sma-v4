import 'cypress-axe';

describe('App Wrapper', () => {
  beforeEach(() => {
    cy.visit('/app-Wrapper?debug=true');
    cy.injectAxe();
  });

  it('has no a11y violation on load', () => {
    cy.checkA11y();
  });
});
