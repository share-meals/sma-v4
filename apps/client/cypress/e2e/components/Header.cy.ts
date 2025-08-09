describe('Header', () => {

  it("doesn't show an alert button when geolocation is unavailable and user is logged in", () => {
    cy.logout();
    cy.visit('/map?mockGeolocationPermission=denied');
    cy.getByTestId('components.head.alerts.button')
    .should('not.exist');
  });


  beforeEach(() => {
    cy.login();
  });
  
  it('shows an alert button when geolocation is unavailable and user is logged in', () => {
    cy.visit('/map?mockGeolocationPermission=denied');
    cy.getByTestId('components.head.alerts.button')
    .should('exist');
  });

 it('has no a11y violation when opening the Alerts modal', () => {
    cy.visit('/map?mockGeolocationPermission=denied');
    cy.getByTestId('components.head.alerts.button').click();
    cy.injectAxe();
    cy.checkA11y();
  });

  it('shows an error message in the Alerts modal when geolocation is denied', () => {
    cy.visit('/map?mockGeolocationPermission=denied');
    cy.getByTestId('components.head.alerts.button').click();
    cy.getByTestId('alertMessage.geolocation').should('exist');
  });
});
