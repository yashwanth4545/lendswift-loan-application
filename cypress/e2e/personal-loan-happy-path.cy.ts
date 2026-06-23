describe('Personal Loan — Happy Path', () => {
  it('completes salaried personal loan with documents, signature, and submission', () => {
    cy.completePersonalLoanFlow('valid-personal-loan.json');
  });
});
