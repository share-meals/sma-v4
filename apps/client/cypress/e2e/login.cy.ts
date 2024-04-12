describe('Login', () => {
  it('should display errors on an empty form submit', () => {
    cy.visit('/login');
    cy.get('ion-button[data-testid="button-submit"]').click();
    cy.get('ion-input[data-testid="input-email"] div.input-bottom div.error-text').should('exist');
    cy.get('ion-input[data-testid="input-password"] div.input-bottom div.error-text').should('exist');
  });

  it('should display errors on bad inputs', () => {
    cy.visit('/login');
    cy.get('ion-input[data-testid="input-email"]').type('bad@email');
    cy.get('ion-input[data-testid="input-password"]').type('1');
    cy.get('ion-button[data-testid="button-submit"]').click();
    cy.get('ion-input[data-testid="input-email"] div.input-bottom div.error-text').should('exist');
    cy.get('ion-input[data-testid="input-password"] div.input-bottom div.error-text').should('exist');
  });
});
