import 'cypress-axe';

describe('Pantry Link', () => {
  before(() => {
    cy.login();
  });

  it('has no a11y violation when showing an unknown Pantry Link', () => {
    cy.visit('/pantry-link/unknown');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when showing an offline Pantry Link', () => {
    cy.visit('/pantry-link/offline');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when showing an online Pantry Link', () => {
    cy.visit('/pantry-link/online');
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when taking a survey', () => {
    cy.visit('/pantry-link/online');
    cy.getByTestId('pages.pantryLink.getMorePoints.button')
    .should('exist')
    .click();
    cy.injectAxe();
    cy.checkA11y();
  });

});
