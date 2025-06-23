import 'cypress-axe';

describe('Post', () => {
  beforeEach(() => {
    cy.login({
      email: 'test1@nasa.edu',
      password: 'password'
    });
    cy.visit('/post');
    cy.waitForAppLoaderIfPresent();
  });

  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });
});
