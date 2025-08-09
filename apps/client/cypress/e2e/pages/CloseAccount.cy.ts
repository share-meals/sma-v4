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

  it.only('shows an error notice if an incorrect password is entered', () => {
    cy.getByTestId('pages.closeAccount.password.input')
    .type('incorrectpassword');
    cy.getByTestId('pages.closeAccount.submit.button')
    .click();
    cy.getByTestId('components.notice.pages.closeAccount.badPassword')
    .should('exist');
  });
});
