import 'cypress-axe';

describe('Post', () => {
  beforeEach(() => {
    cy.visit('/post');
    cy.waitForAppLoaderIfPresent();
    cy.injectAxe();
  });

  it('has no a11y violation on load', () => {
    cy.checkA11y();
  });
});
