import { useEffect, useMemo, useState, useCallback } from 'react';
import { useFormContext } from 'react-hook-form';
import { WizardProvider, useWizard } from '@/components/wizard/WizardContext';
import { Wizard } from '@/components/wizard/Wizard';
import { ResumeDraftModal, SaveToast } from '@/components/common/DraftModals';
import { useAutoSave, findAnyDraft, loadDraft, clearDraft } from '@/hooks/useAutoSave';
import { getActiveSteps } from '@/utils/stepVisibility';
import type { LoanFormData } from '@/types/form';

import { useCrossStepSync } from '@/hooks/useCrossStepSync';
import { useBrowserHistorySync } from '@/hooks/useBrowserHistorySync';

function CrossStepSyncManager() {
  useCrossStepSync();
  return null;
}

function BrowserHistoryManager() {
  useBrowserHistorySync();
  return null;
}

function AutoSaveManager({ onToast }: { onToast: (msg: string) => void }) {
  const { currentStep, completedSteps } = useWizard();
  const { watch } = useFormContext<LoanFormData>();
  const formData = watch();

  const { saveNow } = useAutoSave({
    formData,
    currentStep,
    completedSteps,
    enabled: !!formData.loanType,
    onSaved: (time) => {
      const formatted = time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
      onToast(`Draft saved at ${formatted}`);
    },
  });

  useEffect(() => {
    (window as unknown as { __saveDraft?: () => Promise<void> }).__saveDraft = saveNow;
    return () => {
      delete (window as unknown as { __saveDraft?: () => Promise<void> }).__saveDraft;
    };
  }, [saveNow]);

  return null;
}

interface WizardBoot {
  key: string;
  step: number;
  completed: number[];
}

export function WizardOrchestrator() {
  const { watch, reset } = useFormContext<LoanFormData>();
  const loanType = watch('loanType');
  const loanAmount = watch('loanAmount');

  const activeSteps = useMemo(
    () => getActiveSteps(loanType, loanAmount),
    [loanType, loanAmount],
  );

  const [wizardBoot, setWizardBoot] = useState<WizardBoot>({
    key: 'initial',
    step: 1,
    completed: [],
  });

  const [resumeModal, setResumeModal] = useState({
    open: false,
    loanType: '',
    savedAt: '',
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [checkedDraft, setCheckedDraft] = useState(false);

  useEffect(() => {
    if (checkedDraft) return;
    const found = findAnyDraft();
    if (found) {
      setResumeModal({ open: true, loanType: found.loanType, savedAt: found.meta.timestamp });
    }
    setCheckedDraft(true);
  }, [checkedDraft]);

  const handleResume = useCallback(async () => {
    const draft = await loadDraft(resumeModal.loanType);
    if (!draft) {
      setResumeModal((s) => ({ ...s, open: false }));
      return;
    }
    reset(draft.formData);
    setWizardBoot({
      key: `resume-${draft.timestamp}`,
      step: draft.step,
      completed: draft.completedSteps,
    });
    setResumeModal((s) => ({ ...s, open: false }));
  }, [resumeModal.loanType, reset]);

  const handleStartFresh = useCallback(() => {
    clearDraft(resumeModal.loanType);
    setResumeModal((s) => ({ ...s, open: false }));
  }, [resumeModal.loanType]);

  const handleToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 2000);
  }, []);

  return (
    <>
      <WizardProvider
        key={wizardBoot.key}
        activeSteps={activeSteps}
        initialStep={wizardBoot.step}
        initialCompletedSteps={wizardBoot.completed}
      >
        <AutoSaveManager onToast={handleToast} />
        <CrossStepSyncManager />
        <BrowserHistoryManager />
        <Wizard />
      </WizardProvider>

      <ResumeDraftModal
        open={resumeModal.open}
        loanType={resumeModal.loanType}
        savedAt={resumeModal.savedAt}
        onResume={handleResume}
        onStartFresh={handleStartFresh}
      />
      <SaveToast message={toastMsg} />
    </>
  );
}
