describe('Cross-Step Validation', () => {
  beforeEach(() => {
    cy.visitApp();
    cy.dismissResumeModal();
  });

  it('filters tenure options based on date of birth (Step 2 → Step 1)', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.contains('label', 'Personal Loan').click();
      cy.get('#loanAmount').type(String(data.loanAmount));
      cy.get('#loan-tenure').select(String(data.loanTenure));
      cy.get('#loan-purpose').select(data.loanPurpose);
      cy.clickNext();
      cy.get('#dateOfBirth').clear().type('1963-01-01');
      cy.get('#fullName').type(data.fullName);
      cy.contains('label', 'Male').click();
      cy.get('#marital-status').select(data.maritalStatus);
      cy.get('#fatherName').type(data.fatherName);
      cy.get('#motherName').type(data.motherName);
      cy.get('#email').type(data.email);
      cy.get('#mobile').type(data.mobile);
      cy.get('[aria-label="Go to previous step"]').click();
      cy.contains('maximum tenure is', { timeout: 5000 }).should('be.visible');
      cy.get('#loan-tenure option').should('not.contain', '360');
    });
  });

  it('blocks business loan with salaried employment (Step 1 → Step 5)', () => {
    cy.fixture('valid-business-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.clickNext();
      cy.fillStep2(data);
      cy.clickNext();
      cy.fillStep3(data);
      cy.clickNext();
      cy.fillStep4(data);
      cy.clickNext();
      cy.contains('Business loans require').should('be.visible');
      cy.contains('label', 'Salaried').should('not.exist');
      cy.fillStep5(data);
      cy.clickNext();
      cy.contains('h2', 'Co-Applicant').should('be.visible');
    });
  });

  it('skips co-applicant step when personal loan is below ₹5L', () => {
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
      cy.contains('Documents').should('be.visible');
      cy.contains('Co-Applicant Name').should('not.exist');
    });
  });

  it('shows co-applicant step for home loan (Step 1 → Step 6)', () => {
    cy.fixture('valid-home-loan.json').then((data) => {
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
      cy.contains('Co-Applicant').should('be.visible');
    });
  });

  it('requires rent amount when residence is rented (Step 4)', () => {
    cy.fixture('valid-personal-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.clickNext();
      cy.fillStep2(data);
      cy.clickNext();
      cy.fillStep3(data);
      cy.clickNext();
      cy.get('#currentAddressLine1').type(data.currentAddressLine1);
      cy.get('#pinCode').type(data.pinCode);
      cy.wait(500);
      cy.get('#residence-type').select('rented');
      cy.get('#yearsAtAddress').type('2');
      cy.clickNext();
      cy.contains('rent', { matchCase: false }).should('be.visible');
    });
  });

  it('clears co-applicant when loan amount drops below threshold', () => {
    cy.fixture('valid-home-loan.json').then((data) => {
      cy.fillStep1(data);
      cy.clickNext();
      cy.get('[aria-label="Go to previous step"]').click();
      cy.contains('label', 'Personal Loan').click();
      cy.get('#loanAmount').clear().type('300000');
      cy.get('#loan-tenure').select('36');
      cy.get('#loan-purpose').select('medical');
      cy.clickNext();
      cy.fillStep2(data);
      cy.clickNext();
      cy.fillStep3({ ...data, pan: 'ABCPK1234L', aadhaar: '234567890126' });
      cy.clickNext();
      cy.fillStep4(data);
      cy.clickNext();
      cy.fillStep5(data);
      cy.clickNext();
      cy.contains('Documents').should('be.visible');
    });
  });
});
