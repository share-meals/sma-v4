import 'cypress-axe';

describe('Account', () => {
  beforeEach(() => {
    cy.login({
      email: 'test1@nasa.edu',
      password: 'password'
    });
    cy.visit('/account');
    cy.waitForAppLoaderIfPresent();
    cy.injectAxe();
  });

  afterEach(() => {
    cy.logout();
  });
  
  it('has no a11y violation on load', () => {
    cy.checkA11y();
  });

  it('has no a11y violation when opening the join community modal', () => {
    cy.getByTestId('pages.account.showJoinCommunity.button')
    .should('exist')
    .click();
    cy.checkA11y();
  });

  it('has no a11y violation when opening the join community modal when there are no new communities to join', () => {
    cy.getByTestId('pages.account.showJoinCommunity.button')
    .should('be.visible')
    .click();
    cy.getByTestId('pages.account.joinCommunityByEmailAddress.button')
    .should('be.visible')
    .click();
    cy.checkA11y();
  });
});
