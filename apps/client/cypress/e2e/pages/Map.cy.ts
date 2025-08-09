import 'cypress-axe';

describe('Map', () => {
  beforeEach(() => {
    cy.login();
    cy.visit('/map');
    cy.getByTestId('pages.map')
    .should('be.visible');
  });

  afterEach(() => {
    //cy.logout();
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

  it('shows an alert message if geolocation permissions are not available', () => {
    cy.visit('/map?mockGeolocationPermission=denied');
    cy.getByTestId('components.notice.errors.geolocation.denied')
    .should('exist');
  });
  
  it("doesn't show a Locate Me control if geolocation permissions are denied", () => {
    cy.visit('/map?mockGeolocationPermission=denied');
    cy.getByTestId('components.locateMeControl.button')
    .should('not.exist');
  });

  it("shows a Locate Me control if geolocation permissions are allowed", () => {
    cy.getByTestId('components.locateMeControl.button')
    .should('exist');
  });

});
