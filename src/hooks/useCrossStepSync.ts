import { useEffect, useRef } from 'react';
import { useLoanForm } from '@/hooks/useLoanForm';
import { clearEmploymentFields } from '@/utils/employmentHelpers';
import { clearCoApplicantFields, shouldClearCoApplicant } from '@/utils/crossStepSync';
import type { LoanFormData } from '@/types/form';

function applyPartial(values: Partial<LoanFormData>, setValue: ReturnType<typeof useLoanForm>['setValue']) {
  (Object.entries(values) as [keyof LoanFormData, LoanFormData[keyof LoanFormData]][]).forEach(
    ([key, value]) => setValue(key, value, { shouldDirty: true }),
  );
}

/**
 * Keeps form state consistent when cross-step source fields change.
 */
export function useCrossStepSync() {
  const { watch, setValue } = useLoanForm();
  const loanType = watch('loanType');
  const loanAmount = watch('loanAmount');
  const employmentType = watch('employmentType');

  const prevEmploymentType = useRef(employmentType);

  useEffect(() => {
    if (shouldClearCoApplicant(loanType, loanAmount)) {
      applyPartial(clearCoApplicantFields(), setValue);
    }
  }, [loanType, loanAmount, setValue]);

  useEffect(() => {
    if (loanType === 'business' && employmentType === 'salaried') {
      setValue('employmentType', '', { shouldDirty: true });
    }
  }, [loanType, employmentType, setValue]);

  useEffect(() => {
    const prev = prevEmploymentType.current;
    if (prev && employmentType && prev !== employmentType) {
      applyPartial(clearEmploymentFields(employmentType), setValue);
    }
    prevEmploymentType.current = employmentType;
  }, [employmentType, setValue]);
}
