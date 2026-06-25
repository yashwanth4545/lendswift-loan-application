describe('Stress Tests', () => {
  it('handles rapid step navigation without state corruption', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.visitApp();
      cy.dismissResumeModal();
      cy.fillStep1(data);
      for (let i = 0; i < 5; i += 1) {
        cy.get('[aria-label="Go to next step"]').click({ force: true });
      }
      cy.get('body').should('not.contain', 'undefined');
    });
  });

  it('prevents double submit from processing twice', () => {
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
      cy.uploadAllRequiredDocuments();
      cy.drawAndSaveSignature();
      cy.clickNext();
      cy.get('#consentAccuracy').click({ force: true });
      cy.get('#consentCreditCheck').click({ force: true });
      cy.get('#consentTerms').click({ force: true });
      cy.get('#consentCommunications').click({ force: true });
      cy.get('[aria-label="Submit application"]').dblclick();
      cy.contains('Application Submitted!').should('be.visible');
      cy.get('[role="dialog"]').should('have.length', 1);
    });
  });

  it('updates conditional steps when loan type changes after going back', () => {
    cy.fixture('valid-home-loan.json').then((home) => {
      cy.visitApp();
      cy.dismissResumeModal();
      cy.fillStep1(home);
      cy.clickNext();
      cy.get('[aria-label="Go to previous step"]').click();
      cy.contains('label', 'Personal Loan').click();
      cy.get('#loanAmount').clear().type('300000');
      cy.get('#loan-tenure').select('36');
      cy.get('#loan-purpose').select('medical');
      cy.fillStep1({ ...home, loanType: 'personal', loanAmount: 300000, loanTenure: 36, loanPurpose: 'medical' });
      cy.clickNext();
      cy.contains('Personal Info').should('be.visible');
    });
  });

  it('accepts special characters in name fields', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.visitApp();
      cy.dismissResumeModal();
      cy.fillStep1(data);
      cy.clickNext();
      cy.get('#fullName').clear().type("O'Brien-Smith Jr.");
      cy.get('#dateOfBirth').type(data.dateOfBirth);
      cy.contains('label', 'Male').click();
      cy.get('#marital-status').select(data.maritalStatus);
      cy.get('#fatherName').clear().type('Father Name');
      cy.get('#motherName').clear().type('Mother Name');
      cy.get('#email').clear().type(data.email);
      cy.get('#mobile').clear().type(data.mobile);
      cy.get('#fullName').should('have.value', "O'Brien-Smith Jr.");
    });
  });

  it('handles max-length values in text fields', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.visitApp();
      cy.dismissResumeModal();
      cy.fillStep1(data);
      cy.clickNext();
      const longName = 'A'.repeat(100);
      cy.get('#fullName').clear().type(longName);
      cy.get('#fullName').invoke('val').then((val) => {
        expect(String(val).length).to.be.at.most(100);
      });
    });
  });
});
