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

  it('submits a reset password request', () => {
    cy.intercept(
      { method: 'POST', url: `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${Cypress.env('VITE_FIREBASE_API_KEY')}` },
      (req) => req.continue()
    ).as('sendOob');

    cy.getByTestId('pages.resetPassword.email.input').type('test1@nasa.edu');
    cy.getByTestId('pages.resetPassword.reset.button').click();
    cy.getByTestId('components.notice.pages.resetPassword.successNotice').should('exist');

    cy.wait('@sendOob').its('request.body').should((body) => {
      expect(body.requestType).to.equal('PASSWORD_RESET');
    });
  });

  it('shows invalid email error', () => {  // might be component test
    cy.getByTestId('pages.resetPassword.email.input').type('test');
    cy.getByTestId('pages.resetPassword.reset.button').click();
    cy.getByTestId('pages.resetPassword.email.input').get('.error-text').should('exist');
  });
});
