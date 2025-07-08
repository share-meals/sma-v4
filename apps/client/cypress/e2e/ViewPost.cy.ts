import 'cypress-axe';

describe('View Post', () => {
  before(() => {
    cy.login();
    cy.addPost();
  });
  
  beforeEach(() => {
    cy.visit('/map');
    cy.getByTestId('pages.map.showAllPosts.button')
    .should('exist')
    .click();
    cy.get('.postInfoBanner')
    .first()
    .click();
  });
  
  after(() => {
    cy.closeAllPosts();
  });
  
  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when showing more actions', () => {
    cy.getByTestId('pages.viewPost.openMoreActions.button')
    .should('be.visible')
    .click();
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when trying to close a post', () => {
    cy.getByTestId('pages.viewPost.openMoreActions.button')
    .should('be.visible')
    .click();
    cy.getByTestId('pages.viewPost.moreActionsSheet.close.button')
    .should('be.visible')
    .click();
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when showing the map', () => {
    cy.getByTestId('components.collapsibleMap.showMap.link')
    .should('be.visible')
    .click();
    cy.getByTestId('components.collapsibleMap.map')
    .should('be.visible')
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation submitting an empty chat', () => {
    cy.getByTestId('components.chat.submit.button')
    .should('be.visible')
    .click();
    cy.injectAxe();
    cy.checkA11y();
  });


  it('has no a11y violation when it has chat messages', () => {
    cy.getByTestId('components.chat.text.input')
    .should('be.visible')
    .type('hello world');
    cy.getByTestId('components.chat.submit.button')
    .should('be.visible')
    .click();
    cy.injectAxe();
    cy.checkA11y();
  });


});
