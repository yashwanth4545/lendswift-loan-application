declare global {
  namespace Cypress {
    interface Chainable {
      /** Pause for demo pacing (milliseconds). */
      demoPause(ms?: number): Chainable<void>;
      /** Show a bottom caption overlay in the recording. */
      showDemoCaption(text: string): Chainable<void>;
      /** Hide the demo caption overlay. */
      hideDemoCaption(): Chainable<void>;
    }
  }
}

Cypress.Commands.add('demoPause', (ms = 3000) => {
  cy.wait(ms);
});

Cypress.Commands.add('showDemoCaption', (text: string) => {
  cy.document().then((doc) => {
    let el = doc.getElementById('lendswift-demo-caption');
    if (!el) {
      el = doc.createElement('div');
      el.id = 'lendswift-demo-caption';
      el.setAttribute('aria-hidden', 'true');
      el.style.cssText = [
        'position:fixed',
        'bottom:28px',
        'left:50%',
        'transform:translateX(-50%)',
        'max-width:90%',
        'background:rgba(31,78,121,0.94)',
        'color:#fff',
        'padding:14px 28px',
        'border-radius:10px',
        'font:600 17px/1.45 "DM Sans",system-ui,sans-serif',
        'box-shadow:0 8px 32px rgba(0,0,0,0.25)',
        'z-index:99999',
        'pointer-events:none',
        'text-align:center',
      ].join(';');
      doc.body.appendChild(el);
    }
    el.textContent = text;
  });
});

Cypress.Commands.add('hideDemoCaption', () => {
  cy.document().then((doc) => {
    doc.getElementById('lendswift-demo-caption')?.remove();
  });
});

export {};
