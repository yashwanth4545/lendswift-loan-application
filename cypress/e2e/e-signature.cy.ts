describe('E-Signature', () => {
  beforeEach(() => {
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
      cy.clickNext();
      cy.fillStep5(data);
      cy.clickNext();
      cy.contains('h2', 'Documents').should('be.visible');
    });
  });

  it('shows error when saving empty signature', () => {
    cy.contains('button', 'Save Encrypted Signature').click();
    cy.contains('Please draw your signature before saving').should('be.visible');
  });

  it('saves encrypted signature after drawing', () => {
    cy.drawAndSaveSignature();
    cy.contains('AES-256-GCM encrypted').should('be.visible');
  });

  it('displays signature preview on review step', () => {
    cy.uploadAllRequiredDocuments();
    cy.drawAndSaveSignature();
    cy.clickNext();
    cy.contains('E-Signature Preview').should('be.visible');
    cy.get('img[alt="Your e-signature"]').should('be.visible');
  });
});
