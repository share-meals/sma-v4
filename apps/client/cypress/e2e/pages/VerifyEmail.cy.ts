import 'cypress-axe';

describe('Verify Email', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/verify-email');
  });

  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });

  it('shows a notice if the user tries to verify but has not verified their email', () => {
    cy.visit('/verify-email?mockEmailVerified=false');
    cy.getByTestId('pages.verifyEmail.verifyEmail.button').click();
    cy.getByTestId('components.notice.pages.verifyEmail.stillUnverified')
      .should('exist');
  });

  it('shows a notice if the user tries to resend a verification email', () => {
    cy.intercept(
      { method: 'POST', url: 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:sendOobCode*' },
      (req) => req.continue()
    ).as('sendOob');

    cy.getByTestId('pages.verifyEmail.resendVerificationEmail.button').click();
    cy.getByTestId('components.notice.pages.verifyEmail.verifyEmailResent')
    .should('exist');

    cy.wait('@sendOob').its('request.body').should((body) => {
      expect(body.requestType).to.equal('VERIFY_EMAIL');
    });
  });
});
