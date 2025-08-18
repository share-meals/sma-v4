import 'cypress-axe';

describe('Login', () => {
  before(() => {
    cy.logout();
  });

  beforeEach(() => {
    cy.visit('/login');
    cy.getByTestId('pages.login');
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

  // invalid email
  it('shows invalid email error', () => {
    cy.getByTestId('login.input.email').type('test');
    cy.getByTestId('login.input.password').type('testtest');
    cy.getByTestId('login.button.submit').click();
    cy.getByTestId('login.input.email').get('.error-text').should('exist');
  })

  // invalid password
  it('shows invalid password error', () => {
    cy.getByTestId('login.input.email').type('test1@nasa.edu');
    cy.getByTestId('login.input.password').type('test');
    cy.getByTestId('login.button.submit').click();
    cy.getByTestId('login.input.password').get('.error-text').should('exist');
  })

  it.only('correctly opens the reset password modal', () => {
    cy.getByTestId('pages.login.showResetPassword.button').click();
    cy.getByTestId('pages.login.resetPasswordModal').should('have.class', 'show-modal');
  });

  it('submits a reset password request', () => {
    cy.intercept(
      { method: 'POST', url: `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${Cypress.env('VITE_FIREBASE_API_KEY')}` },
      (req) => req.continue()
    ).as('sendOob');

    cy.getByTestId('pages.login.showResetPassword.button').click();
    cy.getByTestId('pages.resetPassword.email.input').type('test1@nasa.edu');
    cy.getByTestId('pages.resetPassword.reset.button').click();
    cy.getByTestId('components.notice.pages.resetPassword.successNotice').should('exist');

    cy.wait('@sendOob').its('request.body').should((body) => {
      expect(body.requestType).to.equal('PASSWORD_RESET');
    });
  });

  it('shows invalid email error', () => {  // might be component test
    cy.getByTestId('pages.login.showResetPassword.button').click();
    cy.getByTestId('pages.resetPassword.email.input').type('test');
    cy.getByTestId('pages.resetPassword.reset.button').click();
    cy.getByTestId('pages.resetPassword.email.input').get('.error-text').should('exist');
  });

  it.only('correctly closes the reset password modal', () => { 
    cy.getByTestId('pages.login.showResetPassword.button').click();
    cy.getByTestId('pages.login.resetPasswordModal.close').click();
    cy.getByTestId('pages.login.resetPasswordModal').should('not.have.class', 'show-modal');
  });

  // after correctly sending password reset, the modal closes. 
  it.only('closes the modal after correctly sending a reset password request with no a11y violation', () => {
    // send request
    cy.getByTestId('pages.login.showResetPassword.button').click();
    cy.getByTestId('pages.resetPassword.email.input').type('test1@nasa.edu');
    cy.getByTestId('pages.resetPassword.reset.button').click();
    cy.getByTestId('components.notice.pages.resetPassword.successNotice').should('exist');

    // close the modal
    cy.getByTestId('pages.login.resetPasswordModal.close').click();
    cy.getByTestId('pages.login.resetPasswordModal').should('not.have.class', 'show-modal');

    cy.injectAxe();
    cy.checkA11y();
  });
});
