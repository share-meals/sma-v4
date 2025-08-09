import 'cypress-axe';

describe('Reset Password', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.logout();
    cy.visit('/reset-password');
    cy.getByTestId('pages.resetPassword')
    .should('exist');
  });

  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });
});
