import 'cypress-axe';

describe('Close Account', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/close-account');
    
  });
  
  afterEach(() => {
    cy.logout();
  })
  
  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });
});
