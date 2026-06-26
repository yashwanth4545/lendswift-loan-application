describe('Accessibility (axe)', () => {
  beforeEach(() => {
    cy.visitApp();
    cy.dismissResumeModal();
  });

  it('Step 1 — no WCAG violations on loan details', () => {
    cy.checkPageA11y();
  });

  it('Step 2 — no WCAG violations on personal info', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.clickNext();
      cy.checkPageA11y();
    });
  });

  it('Step 7 — no WCAG violations on documents', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.clickNext();
      cy.fillStep2(data);
      cy.clickNext();
      cy.fillStep3(data);
      cy.clickNext();
      cy.fillStep4(data);
      cy.clickNext();
      cy.fillStep5(data);
      cy.clickNext();
      cy.contains('h2', 'Documents').should('be.visible');
      cy.checkPageA11y();
    });
  });

  it('skip link moves focus to main content', () => {
    cy.get('a[href="#main-content"]').focus().click();
    cy.focused().should('have.attr', 'id', 'main-content');
  });
});
