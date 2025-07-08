import 'cypress-axe';

describe('Post', () => {
  beforeEach(() => {
    cy.login();
    cy.getByTestId('components.footer.post.button')
    .should('exist')
    .click();
    cy.getByTestId('pages.post')
    .should('exist');
  });

  it('has no a11y violation on load', () => {
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when selecting communities', () => {
    cy.getByTestId('pages.post.communities.select')
    .should('exist')
    .click();
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when selecting tags', () => {
    cy.getByTestId('pages.post.tags.select')
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

  it('has no a11y violation when unlocking the map', () => {
    cy.getByTestId('components.wherePicker.lock.button')
    .should('exist')
    .click();
    cy.injectAxe();
    cy.checkA11y();
  });

  it('has no a11y violation when adding a photo', () => {
    cy.getByTestId('components.photoPicker.addPhoto.button')
    .should('exist')
    .click();
    cy.injectAxe();
    cy.checkA11y();

    cy.get('input[type="file"][accept^="image"]', { timeout: 10000 })
    .selectFile('cypress/fixtures/cat.jpg', { force: true });
    cy.checkA11y();
  });
});
