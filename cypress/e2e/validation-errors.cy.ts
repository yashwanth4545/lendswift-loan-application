describe('Validation Errors', () => {
  beforeEach(() => {
    cy.visitApp();
    cy.dismissResumeModal();
  });

  it('Step 1 — shows error when loan type not selected', () => {
    cy.clickNext();
    cy.contains('Please select a loan type').should('be.visible');
  });

  it('Step 2 — shows errors for empty personal info', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.clickNext();
      cy.clickNext();
      cy.get('[role="alert"]').should('have.length.at.least', 1);
    });
  });

  it('Step 3 — requires PAN and Aadhaar verification', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.clickNext();
      cy.fillStep2(data);
      cy.clickNext();
      cy.clickNext();
      cy.get('[role="alert"]').should('exist');
    });
  });

  it('Step 4 — shows errors for empty address', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.clickNext();
      cy.fillStep2(data);
      cy.clickNext();
      cy.fillStep3(data);
      cy.clickNext();
      cy.clickNext();
      cy.get('[role="alert"]').should('exist');
    });
  });

  it('Step 5 — shows errors when employment not filled', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.clickNext();
      cy.fillStep2(data);
      cy.clickNext();
      cy.fillStep3(data);
      cy.clickNext();
      cy.fillStep4(data);
      cy.clickNext();
      cy.clickNext();
      cy.get('[role="alert"]').should('exist');
    });
  });

  it('Step 7 — requires documents and e-signature', () => {
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
      cy.clickNext();
      cy.get('[role="alert"]').should('exist');
    });
  });

  it('Step 8 — submit disabled until all consents checked', () => {
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
      cy.uploadAllRequiredDocuments();
      cy.drawAndSaveSignature();
      cy.clickNext();
      cy.get('[aria-label="Submit application"]').should('be.disabled');
    });
  });

  it('clears Step 1 loan type error after selection', () => {
    cy.clickNext();
    cy.contains('Please select a loan type').should('be.visible');
    cy.contains('label', 'Personal Loan').click();
    cy.get('#loanAmount').type('300000');
    cy.get('#loan-tenure').select('36');
    cy.get('#loan-purpose').select('medical');
    cy.clickNext();
    cy.contains('Personal Info').should('be.visible');
  });
});
