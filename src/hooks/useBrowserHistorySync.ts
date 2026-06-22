import { useEffect, useRef } from 'react';
import { useWizard } from '@/components/wizard/WizardContext';

/** Sync browser back/forward with wizard step navigation. */
export function useBrowserHistorySync() {
  const { currentStep, goToStep, activeSteps } = useWizard();
  const skipPush = useRef(false);

  useEffect(() => {
    if (skipPush.current) {
      skipPush.current = false;
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('step', String(currentStep));
    window.history.pushState({ step: currentStep }, '', url);
  }, [currentStep]);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const step = (event.state as { step?: number } | null)?.step;
      if (typeof step === 'number' && activeSteps.includes(step) && step !== currentStep) {
        skipPush.current = true;
        goToStep(step);
      }
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, [currentStep, activeSteps, goToStep]);
}
