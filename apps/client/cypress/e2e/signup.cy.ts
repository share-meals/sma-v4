import 'cypress-axe';

describe('Signup', () => {
  beforeEach(() => {
    cy.visit('/signup');
    cy.injectAxe();
  });

  it('has no a11y violation on load', () => {
    cy.checkA11y();
  });

  it('has no a11y violation on privacy policy', () => {
    cy.get('ion-button[data-testid="button-showPrivacyPolicy"]').click();
    cy.checkA11y();
  });

  /*
  it('should open and close the privacy policy', () => {
    cy.get('ion-button[data-testid="button-showPrivacyPolicy"]').click();
    cy.get('ion-modal[data-testid="modal-privacyPolicy"]').should('be.visible');
    cy.get('ion-modal[data-testid="modal-privacyPolicy"] ion-button[data-testid="button-close"]').click();
    cy.get('ion-modal[data-testid="modal-privacyPolicy"]').should('not.be.visible');
  });
  */
});
