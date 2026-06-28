/**
 * Paced end-to-end walkthrough for demo video recording.
 * Run: powershell -ExecutionPolicy Bypass -File .\record-demo.ps1
 */
describe('LendSwift Demo Recording', () => {
  it('walks through personal loan application (8-step wizard)', () => {
    cy.fixture<import('../support/commands').LoanFixture>('valid-personal-loan.json').then((data) => {
      cy.visitApp();
      cy.dismissResumeModal();

      cy.showDemoCaption('LendSwift — 8-step loan application rebuild');
      cy.demoPause(5000);

      cy.showDemoCaption('Accessibility: skip link (keyboard focus)');
      cy.contains('a', 'Skip to application form').focus();
      cy.contains('a', 'Skip to application form').should('be.focused');
      cy.demoPause(3500);

      // Step 1
      cy.showDemoCaption('Step 1 — Loan type, amount, tenure, purpose');
      cy.fillStep1(data);
      cy.demoPause(4000);
      cy.clickNext();

      // Step 2
      cy.showDemoCaption('Step 2 — Personal information with blur validation');
      cy.fillStep2(data);
      cy.demoPause(4000);
      cy.clickNext();

      // Step 3
      cy.showDemoCaption('Step 3 — KYC: PAN & Aadhaar verification simulation');
      cy.fillStep3(data);
      cy.demoPause(5000);
      cy.clickNext();

      // Step 4
      cy.showDemoCaption('Step 4 — Address with PIN auto-fill (560001 → Bengaluru)');
      cy.fillStep4(data);
      cy.demoPause(3000);
      cy.get('#sameAsPermanent').click({ force: true });
      cy.demoPause(2000);
      cy.get('#sameAsPermanent').click({ force: true });
      cy.demoPause(3000);
      cy.clickNext();

      // Step 5
      cy.showDemoCaption('Step 5 — Employment (EMI uses salary minus rent)');
      cy.fillStep5(data);
      cy.demoPause(4000);

      // Step 6 (skipped when personal loan ≤ ₹5L)
      cy.clickNext();
      cy.get('h2', { timeout: 10000 })
        .invoke('text')
        .then((heading) => {
          if (heading.includes('Co-Applicant')) {
            cy.showDemoCaption('Step 6 — Co-applicant details');
            cy.demoPause(4000);
            cy.clickNext();
          } else {
            cy.showDemoCaption('Step 6 skipped — co-applicant not required under ₹5L');
            cy.demoPause(3500);
          }

          // Step 7
          cy.showDemoCaption('Step 7 — Document upload & AES-256 encrypted e-signature');
          cy.uploadAllRequiredDocuments();
          cy.demoPause(2000);
          cy.drawAndSaveSignature();
          cy.demoPause(4000);
          cy.clickNext();

          // Step 8
          cy.showDemoCaption('Step 8 — Review, consents, and submit');
          cy.contains('h2', 'Review').should('be.visible');
          cy.demoPause(3000);
          cy.get('#consentAccuracy').click({ force: true });
          cy.get('#consentCreditCheck').click({ force: true });
          cy.get('#consentTerms').click({ force: true });
          cy.get('#consentCommunications').click({ force: true });
          cy.demoPause(3000);
          cy.clickSubmit();

          cy.showDemoCaption('Application submitted — reference number generated');
          cy.contains('Application Submitted!', { timeout: 10000 }).should('be.visible');
          cy.contains('Application Reference').should('be.visible');
          cy.demoPause(8000);

          cy.hideDemoCaption();
        });
    });
  });
});
