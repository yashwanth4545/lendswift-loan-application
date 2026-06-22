/* eslint-disable @typescript-eslint/no-namespace */

export interface LoanFixture {
  loanType: string;
  loanAmount: number;
  loanTenure: number;
  loanPurpose: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  fatherName: string;
  motherName: string;
  email: string;
  mobile: string;
  pan: string;
  aadhaar: string;
  currentAddressLine1: string;
  currentAddressLine2?: string;
  pinCode: string;
  residenceType: string;
  rentAmount?: number;
  yearsAtAddress: number;
  employmentType: string;
  companyName?: string;
  designation?: string;
  monthlySalary?: number;
  yearsOfExperience?: number;
  businessName?: string;
  businessType?: string;
  annualTurnover?: number;
  yearsInBusiness?: number;
  monthlyIncome?: number;
  gstNumber?: string;
  officeAddressLine1?: string;
  officePinCode?: string;
  coApplicantName?: string;
  coApplicantRelationship?: string;
  coApplicantPan?: string;
  coApplicantIncome?: number;
}

declare global {
  namespace Cypress {
    interface Chainable {
      visitApp(): Chainable<void>;
      dismissResumeModal(action?: 'resume' | 'fresh'): Chainable<void>;
      clickNext(): Chainable<void>;
      clickSubmit(): Chainable<void>;
      verifyPanField(fieldId?: string): Chainable<void>;
      verifyAadhaarField(): Chainable<void>;
      fillStep1(data: LoanFixture): Chainable<void>;
      fillStep2(data: LoanFixture): Chainable<void>;
      fillStep3(data: LoanFixture): Chainable<void>;
      fillStep4(data: LoanFixture): Chainable<void>;
      fillStep5(data: LoanFixture): Chainable<void>;
      fillStep6(data: LoanFixture): Chainable<void>;
      uploadAllRequiredDocuments(): Chainable<void>;
      drawAndSaveSignature(): Chainable<void>;
      fillConsentsAndSubmit(): Chainable<void>;
      completePersonalLoanFlow(fixturePath?: string): Chainable<void>;
    }
  }
}

const LOAN_LABELS: Record<string, string> = {
  personal: 'Personal Loan',
  home: 'Home Loan',
  business: 'Business Loan',
};

Cypress.Commands.add('visitApp', () => {
  cy.visit('/', { timeout: 30000 });
  cy.contains('h2', 'Loan Details', { timeout: 15000 }).should('be.visible');
});

Cypress.Commands.add('dismissResumeModal', (action = 'fresh') => {
  cy.get('body').then(($body) => {
    if ($body.text().includes('Resume Application?')) {
      if (action === 'resume') {
        cy.contains('button', 'Resume Application').click();
      } else {
        cy.contains('button', 'Start Fresh').click();
      }
    }
  });
});

Cypress.Commands.add('clickNext', () => {
  cy.get('[aria-label="Go to next step"]').click();
});

Cypress.Commands.add('clickSubmit', () => {
  cy.get('[aria-label="Submit application"]').should('not.be.disabled').click();
});

Cypress.Commands.add('verifyPanField', (fieldId = 'pan') => {
  cy.get(`#${fieldId}`).blur();
  cy.wait(1800);
  cy.contains('Verified', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('verifyAadhaarField', () => {
  cy.get('#aadhaar').blur();
  cy.wait(1800);
  cy.contains('Verified', { timeout: 10000 }).should('be.visible');
});

Cypress.Commands.add('fillStep1', (data: LoanFixture) => {
  cy.contains('label', LOAN_LABELS[data.loanType]).click();
  cy.get('#loanAmount').clear().type(String(data.loanAmount));
  cy.get('#loan-tenure').select(String(data.loanTenure));
  cy.get('#loan-purpose').select(data.loanPurpose);
});

Cypress.Commands.add('fillStep2', (data: LoanFixture) => {
  cy.contains('h2', 'Personal Info').should('be.visible');
  cy.get('#fullName').clear().type(data.fullName);
  cy.get('#dateOfBirth').clear().type(data.dateOfBirth);
  cy.contains('label', data.gender === 'male' ? 'Male' : data.gender === 'female' ? 'Female' : 'Other').click();
  cy.get('#marital-status').select(data.maritalStatus);
  cy.get('#fatherName').clear().type(data.fatherName);
  cy.get('#motherName').clear().type(data.motherName);
  cy.get('#email').clear().type(data.email);
  cy.get('#mobile').clear().type(data.mobile);
});

Cypress.Commands.add('fillStep3', (data: LoanFixture) => {
  cy.contains('h2', 'KYC').should('be.visible');
  cy.get('#pan').clear().type(data.pan);
  cy.verifyPanField('pan');
  cy.get('#aadhaar').clear().type(data.aadhaar);
  cy.verifyAadhaarField();
  cy.get('#aadhaarConsent').click({ force: true });
});

Cypress.Commands.add('fillStep4', (data: LoanFixture) => {
  cy.contains('h2', 'Address').should('be.visible');
  cy.get('#currentAddressLine1').clear().type(data.currentAddressLine1);
  if (data.currentAddressLine2) {
    cy.get('#currentAddressLine2').clear().type(data.currentAddressLine2);
  }
  cy.get('#pinCode').clear().type(data.pinCode);
  cy.wait(500);
  cy.get('#city').should('not.have.value', '');
  cy.get('#residence-type').select(data.residenceType);
  if (data.residenceType === 'rented' && data.rentAmount) {
    cy.get('#rentAmount').clear().type(String(data.rentAmount));
  }
  cy.get('#yearsAtAddress').clear().type(String(data.yearsAtAddress));
});

Cypress.Commands.add('fillStep5', (data: LoanFixture) => {
  cy.contains('h2', 'Employment').should('be.visible');
  const empLabel =
    data.employmentType === 'salaried'
      ? 'Salaried'
      : data.employmentType === 'self_employed'
        ? 'Self-Employed'
        : 'Business Owner';
  cy.contains('label', empLabel).click();

  if (data.employmentType === 'salaried') {
    cy.get('#companyName').clear().type(data.companyName!);
    cy.get('#designation').clear().type(data.designation!);
    cy.get('#monthlySalary').clear().type(String(data.monthlySalary!));
    cy.get('#yearsOfExperience').clear().type(String(data.yearsOfExperience!));
  } else if (
    data.employmentType === 'business_owner' ||
    data.employmentType === 'self_employed'
  ) {
    cy.get('#businessName').clear().type(data.businessName!);
    cy.get('#business-type').select(data.businessType!);
    cy.get('#annualTurnover').clear().type(String(data.annualTurnover!));
    cy.get('#yearsInBusiness').clear().type(String(data.yearsInBusiness!));
    cy.get('#monthlyIncome').clear().type(String(data.monthlyIncome!));
    cy.get('#yearsExpBiz').clear().type(
      String(data.yearsOfExperience ?? data.yearsInBusiness ?? 5),
    );
    if (data.employmentType === 'business_owner' && data.gstNumber) {
      cy.get('#gstNumber').clear().type(data.gstNumber);
    }
    cy.get('#officeAddressLine1').clear().type(data.officeAddressLine1!);
    cy.get('#officePinCode').clear().type(data.officePinCode!);
    cy.get('#officeCity').clear().type('Mumbai');
    cy.get('#state').select('Maharashtra');
  }
});

Cypress.Commands.add('fillStep6', (data: LoanFixture) => {
  cy.contains('h2', 'Co-Applicant').should('be.visible');
  cy.get('#coApplicantName').clear().type(data.coApplicantName!);
  cy.get('#relationship').select(data.coApplicantRelationship!);
  cy.get('#coApplicantPan').clear().type(data.coApplicantPan!);
  cy.verifyPanField('coApplicantPan');
  cy.get('#coApplicantIncome').clear().type(String(data.coApplicantIncome!));
  cy.get('#coApplicantConsent').click({ force: true });
});

Cypress.Commands.add('uploadAllRequiredDocuments', () => {
  cy.contains('h2', 'Documents', { timeout: 15000 }).should('be.visible');
  cy.contains('Document Checklist').should('be.visible');
  cy.get('[aria-label^="Upload"]', { timeout: 20000 }).should('have.length.at.least', 1);

  const uploadNext = (): void => {
    cy.get('body').then(($body) => {
      const $zones = $body.find('[aria-label^="Upload"]');
      if ($zones.length === 0) return;
      const label = $zones.first().attr('aria-label') ?? '';
      const isPdf =
        /Salary|Bank|ITR|Property|Business Registration|GST|Slips/i.test(label);
      const fixture = isPdf ? 'cypress/fixtures/sample.pdf' : 'cypress/fixtures/sample.png';
      cy.get('[aria-label^="Upload"]')
        .first()
        .find('input[type="file"]')
        .selectFile(fixture, { force: true });
      cy.wait(800);
      uploadNext();
    });
  };

  uploadNext();
});

Cypress.Commands.add('drawAndSaveSignature', () => {
  cy.window().then((win) => {
    const signTest = (win as Window & { __lendswiftSignTest?: () => Promise<void> })
      .__lendswiftSignTest;
    if (signTest) {
      return cy.wrap(null).then(() => signTest());
    }

    cy.get('canvas')
      .first()
      .trigger('mousedown', 40, 40, { force: true })
      .trigger('mousemove', 120, 70, { force: true })
      .trigger('mousemove', 200, 90, { force: true })
      .trigger('mouseup', { force: true });
    cy.contains('button', 'Save Encrypted Signature').click();
  });
  cy.contains('AES-256-GCM encrypted', { timeout: 15000 }).should('be.visible');
});

Cypress.Commands.add('fillConsentsAndSubmit', () => {
  cy.contains('h2', 'Review').should('be.visible');
  cy.get('#consentAccuracy').click({ force: true });
  cy.get('#consentCreditCheck').click({ force: true });
  cy.get('#consentTerms').click({ force: true });
  cy.get('#consentCommunications').click({ force: true });
  cy.clickSubmit();
  cy.contains('Application Submitted!', { timeout: 10000 }).should('be.visible');
  cy.contains('Application Reference').should('be.visible');
});

Cypress.Commands.add('completePersonalLoanFlow', (fixturePath = 'valid-personal-loan.json') => {
  cy.fixture<LoanFixture>(fixturePath).then((data) => {
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
    cy.get('h2').then(($heading) => {
      if ($heading.text().includes('Co-Applicant')) {
        cy.fillStep6(data);
        cy.clickNext();
      }
    });
    cy.uploadAllRequiredDocuments();
    cy.drawAndSaveSignature();
    cy.clickNext();
    cy.fillConsentsAndSubmit();
  });
});

export {};
