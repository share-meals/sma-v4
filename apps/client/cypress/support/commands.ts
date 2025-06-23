Cypress.Commands.add('waitForAppLoaderIfPresent', () => {
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="appWrapper.indicator"]').length > 0) {
      // Indicator exists, wait for it to disappear
      cy.log('Indicator found - waiting for it to disappear');
      cy.get('[data-testid="appWrapper.indicator"]').should('not.exist');
    } else {
      // Indicator doesn't exist, continue
      cy.log('Indicator not found - continuing');
    }
  });
});

Cypress.Commands.add('getByTestId', (testId, options = {}) => {
  return cy.get(`[data-testid="${testId}"]`, options);
});

Cypress.Commands.add('getByTestIdIfExists', (testId) => {
  return cy.get('body').then(($body) => {
    const elements = $body.find(`[data-testid="${testId}"]`);
    return elements.length ? cy.wrap(elements) : cy.wrap(null);
  });
});

Cypress.Commands.add('login', ({email, password}) => {
      cy.visit('/');
    cy.waitForAppLoaderIfPresent();
    cy.get('body').then(($body) => {
      const $loginButton = $body.find('[data-testid="components.router.login.button"]');
      if($loginButton.length > 0) {
	cy.visit('/login');
	cy.waitForAppLoaderIfPresent();
	cy.getByTestId('login.input.email')
	.within(() => {
	  cy.get('input')
	  .should('exist')
	  .type(email, {force: true});
	});
	
	cy.getByTestId('login.input.password')
	.within(() => {
	  cy.get('input')
	  .should('exist')
	  .type(password, { force: true });
	});
	cy.getByTestId('login.button.submit')
	.should('be.visible')
	.click();

	cy.waitForAppLoaderIfPresent();
      }
    });
});

Cypress.Commands.add('logout', () => {
    cy.visit('/');
    cy.waitForAppLoaderIfPresent();
    cy.get('body').then(($body) => {      
      const $accountButton = $body.find('[data-testid="components.router.account.button"]');
      if($accountButton.length > 0) {
	cy.visit('/account');
	cy.waitForAppLoaderIfPresent();
	cy.getByTestId('pages.account.logout.button')
	.should('exist')
	.click();
	cy.waitForAppLoaderIfPresent();
	// TODO: should be redirected to /
      }
    });
});
