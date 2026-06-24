describe('Auto-Save & Resume', () => {
  it('saves draft and restores data via resume modal', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.visitApp();
      cy.dismissResumeModal();
      cy.fillStep1(data);
      cy.clickNext();
      cy.fillStep2(data);
      cy.clickNext();
      cy.fillStep3(data);
      cy.clickNext();
      cy.fillStep4(data);

      cy.get('[aria-label="Save draft"]').click();
      cy.contains('Draft saved at', { timeout: 5000 }).should('be.visible');

      cy.reload();
      cy.contains('Resume Application?', { timeout: 10000 }).should('be.visible');
      cy.contains('button', 'Resume Application').click();

      cy.contains('h2', 'Address').should('be.visible');
      cy.get('#pinCode').should('have.value', data.pinCode);
      cy.get('#currentAddressLine1').should('have.value', data.currentAddressLine1);
    });
  });

  it('start fresh clears saved draft', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.visitApp();
      cy.dismissResumeModal();
      cy.fillStep1(data);
      cy.get('[aria-label="Save draft"]').click();
      cy.contains('Draft saved at', { timeout: 5000 }).should('be.visible');

      cy.reload();
      cy.contains('Resume Application?').should('be.visible');
      cy.contains('button', 'Start Fresh').click();
      cy.contains('label', 'Personal Loan').click();
      cy.get('#loanAmount').should('have.value', '');
    });
  });
});
