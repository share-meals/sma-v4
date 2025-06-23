import 'cypress-axe';

describe('Login', () => {
  before(() => {
    cy.logout();
  });

  beforeEach(() => {
    cy.visit('/login');
  });

  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation on reset password', () => {
    cy.getByTestId('pages.login.showResetPassword.button').click();
    cy.injectAxe();
    cy.checkA11y();
  });
});
