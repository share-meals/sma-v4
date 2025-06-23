import 'cypress-axe';
import './commands'

before(() => {
  // disable Cypress's default behavior of logging all XMLHttpRequests and fetches.
  cy.intercept({ resourceType: /xhr|fetch/ }, { log: false });
});

beforeEach(() => {
  cy.injectAxe();
  cy.configureAxe({
    rules: [
      {
        id: 'landmark-no-duplicate-main',
        selector: '.ion-page:not(.ion-page-hidden)'
      },
      {
        id: 'landmark-main-is-top-level',
        selector: '.ion-page:not(.ion-page-hidden)'
      },
      {
        id: 'landmark-unique',
        selector: '.ion-page:not(.ion-page-hidden)'
      }
    ]
  });
});

Cypress.on('uncaught:exception', (err) => {
  if (err.message.includes("Cannot read properties of null (reading 'classList')")) {
    // ignore the gestureController bug
    return false;
  }
});

