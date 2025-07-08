import 'cypress-axe';

describe('Account', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/account');
    cy.getByTestId('pages.account')
    .should('be.visible');
  });

  afterEach(() => {
    cy.logout();
  });

  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when opening the language switcher', () => {
    cy.getByTestId('components.languageSwitcher.select')
    .should('exist')
    .click();
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when adding a new community', () => {
    cy.getByTestId('pages.account.showJoinCommunity.button')
    .should('exist')
    .click();
    cy.injectAxe();
    cy.checkA11y();
  });

});
