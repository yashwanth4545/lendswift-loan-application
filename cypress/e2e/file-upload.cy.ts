describe('File Upload', () => {
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
      cy.clickNext();
    });
  });

  it('uploads a valid image and shows preview', () => {
    cy.get('[aria-label="Upload Aadhaar (Front)"]')
      .find('input[type="file"]')
      .selectFile('cypress/fixtures/sample.png', { force: true });
    cy.contains('sample.png').should('be.visible');
  });

  it('rejects oversized files', () => {
    cy.get('[aria-label="Upload Aadhaar (Front)"]')
      .find('input[type="file"]')
      .selectFile('cypress/fixtures/oversized.png', { force: true });
    cy.contains('exceeds', { timeout: 5000 }).should('be.visible');
  });

  it('allows removing an uploaded file', () => {
    cy.get('[aria-label="Upload Aadhaar (Front)"]')
      .find('input[type="file"]')
      .selectFile('cypress/fixtures/sample.png', { force: true });
    cy.contains('sample.png').should('be.visible');
    cy.get('[aria-label="Remove Aadhaar (Front)"]').click();
    cy.get('[aria-label="Upload Aadhaar (Front)"]').should('exist');
  });

  it('uploads PDF for bank statements', () => {
    cy.get('[aria-label="Upload Bank Statements (Last 6 months)"]')
      .find('input[type="file"]')
      .selectFile('cypress/fixtures/sample.pdf', { force: true });
    cy.contains('sample.pdf').should('be.visible');
  });
});
