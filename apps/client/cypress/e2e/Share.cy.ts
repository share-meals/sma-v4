import 'cypress-axe';

describe('Share', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/share');
    cy.getByTestId('pages.share')
    .should('exist');
  });

  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when selecting communities', () => {
    cy.getByTestId('pages.share.communities.select')
    .should('exist')
    .click();
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when changing the start datetime', () => {
    cy.getByTestId('components.whenPicker.starts.button')
    .should('exist')
    .click();
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when changing the end datetime', () => {
    cy.getByTestId('components.whenPicker.ends.button')
    .should('exist')
    .click();
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when changing the wherePicker method', () => {
    cy.getByTestId('components.wherePicker.method.button')
    .should('exist')
    .click();
    cy.injectAxe();
    cy.checkA11y();
  });

});
