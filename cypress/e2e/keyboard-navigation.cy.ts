describe('Keyboard Navigation', () => {
  it('can focus step navigation controls', () => {
    cy.visitApp();
    cy.dismissResumeModal();
    cy.get('[aria-label="Go to next step"]').focus().should('be.focused');
    cy.get('[aria-label="Save draft"]').focus().should('be.focused');
    cy.get('[aria-label="Go to previous step"]').should('be.disabled');
  });

  it('can select loan type and fill amount using keyboard', () => {
    cy.visitApp();
    cy.dismissResumeModal();
    cy.contains('label', 'Personal Loan').click();
    cy.get('#loanAmount').focus().type('300000');
    cy.get('#loan-tenure').select('36');
    cy.get('#loan-purpose').select('medical');
    cy.get('#loanAmount').should('not.have.value', '');
  });
});
