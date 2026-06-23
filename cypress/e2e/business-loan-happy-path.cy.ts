describe('Business Loan — Happy Path', () => {
  it('completes business loan with GST, co-applicant, and business documents', () => {
    cy.fixture<import('../support/commands').LoanFixture>('valid-business-loan.json').then((data) => {
      cy.visitApp();
      cy.dismissResumeModal();
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
      cy.fillStep6(data);
      cy.clickNext();
      cy.uploadAllRequiredDocuments();
      cy.drawAndSaveSignature();
      cy.clickNext();
      cy.fillConsentsAndSubmit();
    });
  });
});
