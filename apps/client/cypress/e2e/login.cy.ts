import 'cypress-axe';

describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
    cy.injectAxe();
  });

  it('has no a11y violation on load', () => {
    cy.checkA11y();
  });

  it('has no a11y violation on reset password', () => {
    cy.get('ion-button[data-testid="button-showResetPassword"]').click();
    cy.checkA11y();
  });

  it('logs in', () => {
    cy.login({
      email: 'test1@nasa.edu',
      password: 'password'
    });
  })
});
