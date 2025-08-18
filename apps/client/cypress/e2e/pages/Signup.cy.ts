import 'cypress-axe';

describe('Signup', () => {
  before(() => {
    cy.logout();
  });

  beforeEach(() => {
    cy.visit('/signup');
    cy.getByTestId('pages.signup')
    .should('be.visible');
  });

  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation on privacy policy', () => {
    cy.getByTestId('pages.signup.privacyPolicy.button')
    .should('exist')
    .click();
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation on language switcher', () => {
    cy.getByTestId('components.languageSwitcher.select')
    .should('exist')
    .click();
    cy.injectAxe();
    cy.checkA11y();
  });

  // email in use already -- test1@nasa.edu OR test2@nasa.edu
  // signup with new email -> pages.verifyEmail should exist -- test email can be timestamp@nasa.edu
  // passwords are different -> error
  // community code: empty, exists (membercode), or doesn't exist (nocode) -> sign up either way
});
