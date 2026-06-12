import {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  type ReactNode,
} from 'react';
import { TOTAL_STEPS } from '@/constants';

type Direction = 'forward' | 'backward';

interface WizardContextValue {
  currentStep: number;
  direction: Direction;
  completedSteps: Set<number>;
  rippleTrigger: number;
  activeSteps: number[];
  goNext: () => void;
  goPrev: () => void;
  goToStep: (step: number) => void;
  markComplete: (step: number) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  progressPercent: number;
}

const WizardContext = createContext<WizardContextValue | null>(null);

export function useWizard() {
  const ctx = useContext(WizardContext);
  if (!ctx) throw new Error('useWizard must be used within WizardProvider');
  return ctx;
}

interface WizardProviderProps {
  children: ReactNode;
  activeSteps: number[];
  initialStep?: number;
  initialCompletedSteps?: number[];
}

export function WizardProvider({
  children,
  activeSteps,
  initialStep = 1,
  initialCompletedSteps = [],
}: WizardProviderProps) {
  const [currentStep, setCurrentStep] = useState(() =>
    activeSteps.includes(initialStep) ? initialStep : activeSteps[0] ?? 1,
  );
  const [direction, setDirection] = useState<Direction>('forward');
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    () => new Set(initialCompletedSteps),
  );
  const [rippleTrigger, setRippleTrigger] = useState(0);

  useEffect(() => {
    if (!activeSteps.includes(currentStep)) {
      const fallback =
        activeSteps.filter((s) => s < currentStep).pop() ??
        activeSteps.find((s) => s > currentStep) ??
        1;
      setCurrentStep(fallback);
    }
  }, [activeSteps, currentStep]);

  const goToStep = useCallback(
    (step: number) => {
      if (!activeSteps.includes(step)) return;
      setDirection(step > currentStep ? 'forward' : 'backward');
      setCurrentStep(step);
    },
    [currentStep, activeSteps],
  );

  const goNext = useCallback(() => {
    const idx = activeSteps.indexOf(currentStep);
    if (idx < activeSteps.length - 1) {
      setCompletedSteps((prev) => new Set(prev).add(currentStep));
      setRippleTrigger((t) => t + 1);
      setDirection('forward');
      setCurrentStep(activeSteps[idx + 1]);
    }
  }, [currentStep, activeSteps]);

  const goPrev = useCallback(() => {
    const idx = activeSteps.indexOf(currentStep);
    if (idx > 0) {
      setDirection('backward');
      setCurrentStep(activeSteps[idx - 1]);
    }
  }, [currentStep, activeSteps]);

  const markComplete = useCallback((step: number) => {
    setCompletedSteps((prev) => new Set(prev).add(step));
  }, []);

  const progressPercent = useMemo(() => {
    const idx = activeSteps.indexOf(currentStep);
    if (idx < 0) return 0;
    return Math.round(((idx + 1) / activeSteps.length) * 100);
  }, [currentStep, activeSteps]);

  const value: WizardContextValue = {
    currentStep,
    direction,
    completedSteps,
    rippleTrigger,
    activeSteps,
    goNext,
    goPrev,
    goToStep,
    markComplete,
    isFirstStep: activeSteps.indexOf(currentStep) === 0,
    isLastStep: activeSteps.indexOf(currentStep) === activeSteps.length - 1,
    progressPercent,
  };

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>;
}

export { TOTAL_STEPS };
