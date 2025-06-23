import 'cypress-axe';

describe('Account', () => {
  beforeEach(() => {
    cy.login({
      email: 'test1@nasa.edu',
      password: 'password'
    });
    cy.visit('/account');
    cy.waitForAppLoaderIfPresent();
  });

  afterEach(() => {
    cy.logout();
  });

  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });
});
