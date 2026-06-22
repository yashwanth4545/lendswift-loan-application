import type { LoanFormData } from '@/types/form';
import { LOAN_LIMITS, type LoanType } from '@/constants';
import { calculateEmi, checkEmiAffordability, getMaxTenureByAge } from '@/utils/emiCalculator';
import { getApplicantMonthlyIncome } from '@/utils/employmentHelpers';
import { needsCoApplicant } from '@/utils/stepVisibility';

/** PDF Section B3 — cross-step dependency reference */
export const CROSS_STEP_DEPENDENCIES = [
  { source: 'Step 1 loanType', target: 'Step 5', rule: 'Business loan requires Business Owner or Self-Employed' },
  { source: 'Step 1 loanType', target: 'Step 6', rule: 'Home loan always shows co-applicant step' },
  { source: 'Step 1 loanType', target: 'Step 7', rule: 'Document checklist varies by loan type' },
  { source: 'Step 1 loanAmount', target: 'Step 6', rule: 'Personal > ₹5L or Business > ₹20L triggers co-applicant' },
  { source: 'Step 1 loanAmount + tenure', target: 'Step 8', rule: 'EMI calculation inputs' },
  { source: 'Step 2 dateOfBirth', target: 'Step 1', rule: 'Age + tenure must not exceed 65 years' },
  { source: 'Step 2 maritalStatus', target: 'Step 6', rule: 'Married defaults co-applicant relationship to Spouse' },
  { source: 'Step 3 panVerified', target: 'Step 7', rule: 'Verified PAN makes PAN card upload optional' },
  { source: 'Step 4 residenceType', target: 'Step 4', rule: 'Rented requires rent amount for affordability' },
  { source: 'Step 5 employmentType', target: 'Step 5', rule: 'Employment type drives sub-form fields' },
  { source: 'Step 5 employmentType', target: 'Step 7', rule: 'Salaried → salary slips; others → ITR' },
  { source: 'Step 5 income', target: 'Step 8', rule: 'EMI must not exceed 50% of effective income' },
  { source: 'Step 6 coApplicantIncome', target: 'Step 8', rule: 'Combined household income for EMI ratio' },
] as const;

export function getAgeFromDob(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

/** Monthly rent reduces effective income for EMI affordability (Step 4 → Step 8) */
export function getEffectiveMonthlyIncome(data: Partial<LoanFormData>): number {
  const base = getApplicantMonthlyIncome(data);
  const coIncome = typeof data.coApplicantIncome === 'number' ? data.coApplicantIncome : 0;
  const rent =
    data.residenceType === 'rented' && typeof data.rentAmount === 'number' ? data.rentAmount : 0;
  return Math.max(0, base + coIncome - rent);
}

export function computeEmiAffordability(data: Partial<LoanFormData>) {
  const loanType = data.loanType as LoanType | '';
  const amount = typeof data.loanAmount === 'number' ? data.loanAmount : 0;
  const tenure = typeof data.loanTenure === 'number' ? data.loanTenure : 0;

  if (!loanType || !amount || !tenure) {
    return { emi: 0, ratio: 0, withinLimit: true, effectiveIncome: 0 };
  }

  const { emi } = calculateEmi(amount, tenure, loanType);
  const effectiveIncome = getEffectiveMonthlyIncome(data);
  const { ratio, withinLimit } = checkEmiAffordability(emi, effectiveIncome, 0);

  return { emi, ratio, withinLimit, effectiveIncome };
}

export function getMaxTenureForApplicant(data: Partial<LoanFormData>, loanType: LoanType): number {
  const typeMax = LOAN_LIMITS[loanType].tenureMax;
  const age = getAgeFromDob(data.dateOfBirth ?? '');
  if (age === null) return typeMax;
  return Math.min(typeMax, getMaxTenureByAge(age));
}

export function clearCoApplicantFields(): Partial<LoanFormData> {
  return {
    coApplicantName: '',
    coApplicantRelationship: '',
    coApplicantPan: '',
    coApplicantPanVerified: false,
    coApplicantIncome: '',
    coApplicantConsent: false,
  };
}

export function isEmploymentValidForLoanType(
  loanType: LoanFormData['loanType'],
  employmentType: LoanFormData['employmentType'],
): boolean {
  if (loanType === 'business' && employmentType === 'salaried') return false;
  return !!employmentType;
}

export function shouldClearCoApplicant(
  loanType: LoanFormData['loanType'],
  loanAmount: LoanFormData['loanAmount'],
): boolean {
  return !needsCoApplicant(loanType, loanAmount);
}
