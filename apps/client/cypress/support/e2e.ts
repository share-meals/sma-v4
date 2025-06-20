import './commands'

before(() => {
    // disable Cypress's default behavior of logging all XMLHttpRequests and fetches.
    cy.intercept({ resourceType: /xhr|fetch/ }, { log: false })
});

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes("Cannot read properties of null (reading 'classList')")) {
    // ignore the gestureController bug
    return false;
  }
});

