import type { LoanType } from '@/constants';
import { INTEREST_RATES } from '@/constants';

export interface EmiResult {
  emi: number;
  totalCost: number;
  processingFee: number;
  annualRate: number;
  tenureMonths: number;
  principal: number;
}

export function calculateEmi(
  principal: number,
  tenureMonths: number,
  loanType: LoanType,
): EmiResult {
  const annualRate = INTEREST_RATES[loanType];
  const r = annualRate / 12 / 100;
  const n = tenureMonths;

  let emi: number;
  if (r === 0) {
    emi = principal / n;
  } else {
    const factor = (1 + r) ** n;
    emi = (principal * r * factor) / (factor - 1);
  }

  const totalCost = emi * n - principal;
  const processingFee = Math.min(Math.max(principal * 0.01, 2000), 25000);

  return {
    emi: Math.round(emi),
    totalCost: Math.round(totalCost),
    processingFee: Math.round(processingFee),
    annualRate,
    tenureMonths: n,
    principal,
  };
}

export function checkEmiAffordability(
  emi: number,
  monthlyIncome: number,
  coApplicantIncome = 0,
): { ratio: number; withinLimit: boolean } {
  const totalIncome = monthlyIncome + coApplicantIncome;
  const ratio = totalIncome > 0 ? (emi / totalIncome) * 100 : 100;
  return { ratio, withinLimit: ratio <= 50 };
}

export function getMaxTenureByAge(age: number): number {
  const maxAgeAtMaturity = 65;
  return Math.max(0, (maxAgeAtMaturity - age) * 12);
}
