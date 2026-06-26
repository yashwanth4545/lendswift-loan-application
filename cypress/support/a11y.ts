/// <reference types="cypress" />
/// <reference types="cypress-axe" />

declare global {
  namespace Cypress {
    interface Chainable {
      checkPageA11y(context?: string | Node): Chainable<void>;
    }
  }
}

Cypress.Commands.add('checkPageA11y', (context) => {
  cy.injectAxe();
  cy.checkA11y(context ?? undefined, {
    runOnly: {
      type: 'tag',
      values: ['wcag2a', 'wcag2aa', 'best-practice'],
    },
  });
});

export {};
