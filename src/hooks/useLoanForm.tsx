import { FormProvider, useForm, useFormContext, type FieldPath } from 'react-hook-form';
import { type ReactNode, useCallback } from 'react';
import { defaultFormValues, STEP_FIELD_GROUPS, type LoanFormData } from '@/types/form';
import { getStepSchema } from '@/schemas/schemaFactory';
import { useWizard } from '@/components/wizard/WizardContext';
import { needsCoApplicant } from '@/utils/stepVisibility';
import { clearDraft } from '@/hooks/useAutoSave';

export type ProceedResult =
  | { status: 'next' }
  | { status: 'submitted'; referenceId: string }
  | { status: 'invalid' };

export function LoanFormProvider({ children }: { children: ReactNode }) {
  const methods = useForm<LoanFormData>({
    defaultValues: defaultFormValues,
    mode: 'onBlur',
    reValidateMode: 'onBlur',
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

export function useLoanForm() {
  return useFormContext<LoanFormData>();
}

export function useStepValidation() {
  const { getValues, trigger, setError, clearErrors } = useLoanForm();
  const { currentStep, goNext, markComplete, activeSteps, isLastStep } = useWizard();

  const validateAndProceed = useCallback(async (): Promise<ProceedResult> => {
    const formData = getValues();

    if (currentStep === 6 && !needsCoApplicant(formData.loanType, formData.loanAmount)) {
      goNext();
      return { status: 'next' };
    }

    const fields = STEP_FIELD_GROUPS[currentStep];

    if (!fields) {
      if (isLastStep) {
        return { status: 'invalid' };
      }
      goNext();
      return { status: 'next' };
    }

    await trigger(fields);

    const schema = getStepSchema(currentStep, formData);
    const stepValues =
      currentStep === 7 || currentStep === 8
        ? { ...formData, ...fields.reduce(
            (acc, key) => {
              acc[key] = formData[key];
              return acc;
            },
            {} as Record<string, unknown>,
          ) }
        : fields.reduce(
            (acc, key) => {
              acc[key] = formData[key];
              return acc;
            },
            {} as Record<string, unknown>,
          );

    const result = schema.safeParse(stepValues);

    if (!result.success) {
      result.error.issues.forEach((issue) => {
        const path = issue.path[0];
        if (path === 'documents' && issue.path[1]) {
          setError(`documents.${String(issue.path[1])}` as FieldPath<LoanFormData>, {
            type: 'manual',
            message: issue.message,
          });
        } else if (path) {
          setError(path as keyof LoanFormData, { type: 'manual', message: issue.message });
        }
      });
      return { status: 'invalid' };
    }

    fields.forEach((f) => clearErrors(f));

    if (isLastStep) {
      markComplete(currentStep);
      const referenceId = crypto.randomUUID();
      if (formData.loanType) {
        clearDraft(formData.loanType);
      }
      return { status: 'submitted', referenceId };
    }

    markComplete(currentStep);
    goNext();
    return { status: 'next' };
  }, [
    currentStep,
    getValues,
    trigger,
    setError,
    clearErrors,
    goNext,
    markComplete,
    activeSteps,
    isLastStep,
  ]);

  return { validateAndProceed };
}
