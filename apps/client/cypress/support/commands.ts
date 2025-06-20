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
    console.log($body[0]);
    const elements = $body.find(`[data-testid="${testId}"]`);
    return elements.length ? cy.wrap(elements) : cy.wrap(null);
  });
});

Cypress.Commands.add('login', ({email, password}) => {

  /*
  cy.session([email, password], () => {
    cy.visit('/login');
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
    cy.url().should('include', '/map');
  });
  */
});

Cypress.Commands.add('loginx', ({email, password}) => {
  cy.waitForAppLoaderIfPresent();
  cy.getByTestIdIfExists('footer.button.login')
  .then(($element) => {
    console.log($element);
    if($element === null){
      return;
    }
    if($element.is(':visible')){
      $element.click();

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
    }else{
      // do nothing
    }
  });
});

Cypress.Commands.add('logout', () => {
  /*
  cy.waitForAppLoaderIfPresent();
  cy.getByTestIdIfExists('footer.button.account')
  .then(($element) => {
    if($element === null){
      return;
    }
    if($element.is(':visible')){
      $element.click();
      cy.getByTestId('account.button.logout').click();
    }
  });
  */
});
