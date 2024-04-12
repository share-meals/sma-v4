describe('Signup', () => {
  it('should open and close the privacy policy', () => {
    cy.visit('/signup');
    cy.get('ion-button[data-testid="button-showPrivacyPolicy"]').click();
    cy.get('ion-modal[data-testid="modal-privacyPolicy"]').should('be.visible');
    cy.get('ion-modal[data-testid="modal-privacyPolicy"] ion-button[data-testid="button-close"]').click();
    cy.get('ion-modal[data-testid="modal-privacyPolicy"]').should('not.be.visible');
  });
});
