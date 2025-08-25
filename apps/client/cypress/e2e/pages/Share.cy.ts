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

  it('defaults to common buildings in WherePicker', () => {
    // TODO: should get form value
    // and check of method === 'commonList'
    cy.getByTestId('components.wherePicker.method.button')
    .should('eq', 'abc')
  });

  after(() => {
    cy.closeAllPosts();
  });

  it.only('can share with only selecting a building', () => {
    // TODO: try to find a better way of selecting
    cy.getByTestId('components.wherePicker.commonList.select.button')
    .should('exist')
    .click();
    cy.get('.alert-wrapper .alert-radio-group button:first-child')
    .click();
    cy.get('.alert-wrapper .alert-button-group button:last-child')
    .click();
    cy.getByTestId('pages.share.submit.button')
    .click();
    console.log(cy.getByTestId('components.footer.map.button'))
  })
});
