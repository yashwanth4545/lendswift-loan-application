import './commands';
import './a11y';
import './demo';
import 'cypress-axe';

beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearAllCookies();
  cy.clearAllSessionStorage();
  cy.window().then((win) => {
    win.indexedDB.deleteDatabase('lendswift_secure_vault');
  });
});
