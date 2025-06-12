// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.on('window:before:load', (win) => {
  // Patch document.body access for Ionic's scroll blocker
  const Ionic = win.Ionic;
  if (Ionic?.GestureController?.prototype?.enableScroll) {
    const originalEnableScroll = Ionic.GestureController.prototype.enableScroll;
    
    Ionic.GestureController.prototype.enableScroll = function (...args) {
      const el = win.document?.body;
      if (!el || !el.classList) {
        console.warn('[Cypress] enableScroll skipped due to missing body or classList');
        return;
      }

      try {
        return originalEnableScroll.apply(this, args);
      } catch (e) {
        console.warn('[Cypress] enableScroll error caught:', e.message);
      }
    };
  }
});
