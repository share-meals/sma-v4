Cypress.Commands.add('addPost', ({
  email,
  password,
  title,
  details,
  communities,
  dietaryTags,
  servings,
  startDate,
  startTime,
  endDate,
  endTime,
  whereMethod,
  whereAddress,
  whereRoom
} = {
  title: 'this is the title',
  details: 'these are the details',
}) => {
  // TODO: implement rest of input options
  cy.login({email, password});
  cy.visit('/post');
  cy.getByTestId('pages.post.title.input')
  .should('exist')
  .type(title);

  cy.getByTestId('pages.post.details.input')
  .should('exist')
  .type(details);

  cy.getByTestId('components.wherePicker.loadingIndicator')
  .should('not.exist');
  
  cy.getByTestId('pages.post.submit.button')
  .should('exist')
  .click();
  
  cy.location('pathname')
  .should('eq', '/map');
});

Cypress.Commands.add('closeAllPosts', ({
  email,
  password
} = {
  email: 'test1@nasa.edu',
  password: 'password'
}) => {
  cy.login({email, password});
  cy.visit('/map');
  cy.getByTestId('pages.map').then($page => {
    const selector = '[data-testid="pages.map.showAllPosts.button"]';
    if ($page.find(selector).length) {
      cy.get(selector).click();
      cy.get('.postInfoBanner')
      .first()
      .click();
      cy.getByTestId('pages.viewPost.openMoreActions.button')
      .should('be.visible')
      .click();
      cy.getByTestId('pages.viewPost.moreActionsSheet.close.button')
      .should('be.visible')
      .click();
      cy.getByTestId('pages.viewPost.closePost.confirm.yes.button')
      .should('be.visible')
      .click();
      cy.closeAllPosts({email, password})
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

Cypress.Commands.add('login', ({
  email,
  password
} = {
  email: 'test1@nasa.edu',
  password: 'password'
}) => {
  cy.visit('/');
  cy.get('#footer').then(($footer) => {
    const $loginButton = $footer.find('[data-testid="components.footer.login.button"]');
    if($loginButton.length > 0) {
      cy.visit('/login');
      cy.getByTestId('pages.login')
      .should('be.visible');
      cy.getByTestId('login.input.email')
      .should('be.visible')
      .within(() => {
	cy.get('input')
	.should('exist')
	.type(email, {force: true});
      });
      
      cy.getByTestId('login.input.password')
      .should('be.visible')
      .within(() => {
	cy.get('input')
	.should('exist')
	.type(password, { force: true });
      });
      cy.getByTestId('login.button.submit')
      .should('be.visible')
      .click();
      cy.getByTestId('pages.map')
      .should('be.visible');
    }
  });
});

Cypress.Commands.add('logout', () => {
  cy.visit('/');
  cy.get('#footer').then(($footer) => {
    const $accountButton = $footer.find('[data-testid="components.footer.account.button"]');
    if($accountButton.length > 0) {
      cy.visit('/account');
      cy.getByTestId('pages.account')
      .should('be.visible');
      cy.getByTestId('pages.account.logout.button')
      .should('be.visible')
      .click();
      cy.getByTestId('pages.signup')
      .should('be.visible');
    }
  });
});
