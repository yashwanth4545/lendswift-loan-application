import type { LoanType } from '@/constants';
import { TOTAL_STEPS } from '@/constants';

/** Personal > ₹5L, Home always, Business > ₹20L (strictly exceeds) */
export function needsCoApplicant(
  loanType: LoanType | '',
  loanAmount: number | '',
): boolean {
  if (loanType === 'home') return true;
  if (typeof loanAmount !== 'number') return false;
  if (loanType === 'personal') return loanAmount > 5_00_000;
  if (loanType === 'business') return loanAmount > 20_00_000;
  return false;
}

export function getActiveSteps(
  loanType: LoanType | '',
  loanAmount: number | '',
): number[] {
  const steps = Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1);
  if (!needsCoApplicant(loanType, loanAmount)) {
    return steps.filter((s) => s !== 6);
  }
  return steps;
}

export function getLogicalStepIndex(step: number, activeSteps: number[]): number {
  return activeSteps.indexOf(step);
}
