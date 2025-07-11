import 'cypress-axe';

describe('Map', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/map');
    cy.getByTestId('pages.map')
    .should('be.visible');
  });

  afterEach(() => {
    cy.logout();
  });
  
  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when showing all posts', () => {
    cy.addPost();
    cy.visit('/map');
    cy.getByTestId('pages.map.showAllPosts.button')
    .should('exist')
    .click();
    cy.injectAxe();
    cy.checkA11y();
    cy.closeAllPosts();
  });
});
