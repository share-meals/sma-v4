import 'cypress-axe';

describe('Signup', () => {
  beforeEach(() => {
    cy.logout();
    cy.visit('/signup');
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

});
