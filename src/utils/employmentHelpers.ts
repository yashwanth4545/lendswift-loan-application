import type { LoanFormData } from '@/types/form';

/** Monthly income used for EMI affordability (Step 8) */
export function getApplicantMonthlyIncome(data: Partial<LoanFormData>): number {
  if (data.employmentType === 'salaried') {
    return typeof data.monthlySalary === 'number' ? data.monthlySalary : 0;
  }
  if (data.employmentType === 'self_employed' || data.employmentType === 'business_owner') {
    return typeof data.monthlyIncome === 'number' ? data.monthlyIncome : 0;
  }
  return 0;
}

export function clearEmploymentFields(
  type: LoanFormData['employmentType'],
): Partial<LoanFormData> {
  if (type === 'salaried') {
    return {
      businessName: '',
      businessType: '',
      annualTurnover: '',
      yearsInBusiness: '',
      monthlyIncome: '',
      gstNumber: '',
      officeAddressLine1: '',
      officeAddressLine2: '',
      officePinCode: '',
      officeCity: '',
      officeState: '',
    };
  }
  return {
    companyName: '',
    designation: '',
    monthlySalary: '',
  };
}
