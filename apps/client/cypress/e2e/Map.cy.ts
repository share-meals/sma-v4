import 'cypress-axe';

describe('Map', () => {
  beforeEach(() => {
    cy.login({
      email: 'test1@nasa.edu',
      password: 'password'
    });
    cy.visit('/map');
    cy.waitForAppLoaderIfPresent();
    cy.injectAxe();
  });

  afterEach(() => {
    cy.logout();
  });
  
  it('has no a11y violation on load', () => {
    cy.checkA11y();
  });
});
