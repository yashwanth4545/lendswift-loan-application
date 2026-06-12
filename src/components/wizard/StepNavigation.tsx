import { ChevronLeft, ChevronRight, Save, Loader2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useWizard } from './WizardContext';
import { useLoanForm, useStepValidation } from '@/hooks/useLoanForm';
import { SubmitSuccessModal } from '@/components/common/DraftModals';
import { getRequiredDocuments } from '@/utils/documentRequirements';
import { computeEmiAffordability } from '@/utils/crossStepSync';
import { cn } from '@/lib/utils';

export function StepNavigation() {
  const { goPrev, isFirstStep, isLastStep } = useWizard();
  const { validateAndProceed } = useStepValidation();
  const { watch } = useLoanForm();
  const [isValidating, setIsValidating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<{ referenceId: string } | null>(null);

  const formData = watch();
  const allConsentsChecked =
    formData.consentAccuracy &&
    formData.consentCreditCheck &&
    formData.consentTerms &&
    formData.consentCommunications;

  const docsReady = useMemo(() => {
    const reqs = getRequiredDocuments(formData);
    return reqs.filter((r) => r.required).every((r) => formData.documents[r.key]);
  }, [formData]);

  const affordability = useMemo(() => computeEmiAffordability(formData), [formData]);

  const emiConsentOk =
    affordability.withinLimit || formData.consentEmiAffordability;

  const canSubmit =
    allConsentsChecked && docsReady && !!formData.eSignaturePreview && emiConsentOk;

  const handleSaveDraft = async () => {
    const saveFn = (window as unknown as { __saveDraft?: () => Promise<void> }).__saveDraft;
    if (!saveFn) return;
    setIsSaving(true);
    try {
      await saveFn();
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    setIsValidating(true);
    try {
      const result = await validateAndProceed();
      if (result.status === 'submitted') {
        setSubmitSuccess({ referenceId: result.referenceId });
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <>
      <nav
      className="fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-white/90 backdrop-blur-md"
      aria-label="Step navigation"
    >
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4">
        <button
          type="button"
          onClick={goPrev}
          disabled={isFirstStep || isValidating}
          className={cn(
            'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl border border-border px-4 py-2.5 text-sm font-medium transition-colors',
            'hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'disabled:pointer-events-none disabled:opacity-40',
          )}
          aria-label="Go to previous step"
        >
          <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          <span className="hidden sm:inline">Previous</span>
        </button>

        <button
          type="button"
          onClick={handleSaveDraft}
          disabled={isSaving || isValidating}
          className={cn(
            'inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors',
            'hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
          )}
          aria-label="Save draft"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Save className="h-4 w-4" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">Save Draft</span>
        </button>

        <button
          type="button"
          onClick={handleNext}
          disabled={isValidating || (isLastStep && !canSubmit)}
          className={cn(
            'inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1 rounded-xl bg-lendswift-primary px-5 py-2.5 text-sm font-semibold text-white transition-all',
            'hover:bg-lendswift-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
            'active:scale-[0.98] disabled:pointer-events-none disabled:opacity-70',
          )}
          aria-label={isLastStep ? 'Submit application' : 'Go to next step'}
        >
          {isValidating ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <>
              <span>{isLastStep ? 'Submit' : 'Next'}</span>
              {!isLastStep && <ChevronRight className="h-4 w-4" aria-hidden="true" />}
            </>
          )}
        </button>
      </div>
    </nav>

      <SubmitSuccessModal
        open={!!submitSuccess}
        referenceId={submitSuccess?.referenceId ?? ''}
        loanType={formData.loanType}
        onClose={() => setSubmitSuccess(null)}
      />
    </>
  );
}
