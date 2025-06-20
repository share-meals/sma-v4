describe('Login', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  xit('has no a11y violation on load', () => {
    cy.checkA11y();
  });

  xit('has no a11y violation on reset password', () => {
    cy.getByTestId('pages.login.showResetPassword.button').click();
    cy.checkA11y();
  });

  it('logs in', () => {
    /*
    cy.request({
      method: 'POST',
      url: 'http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=fake-api-key',
      body: {
	email: 'test1@nasa.edu',
	password: 'password',
	returnSecureToken: true,
      },
      failOnStatusCode: false
    }).then(res => {
      console.log(res);
    });
    */

    cy.login({
      email: 'test1@nasa.edu',
      password: 'password'
    });

    cy.logout();
  })
});
