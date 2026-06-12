import { lazy, Suspense } from 'react';
import { useWizard } from './WizardContext';
import { StepTransition } from '@/components/animations/StepTransition';
import {
  AmbientBackground,
  JourneyPath,
  StepRipple,
} from '@/components/animations/MotionPrimitives';
import { StepNavigation } from './StepNavigation';
import { TOTAL_STEPS } from '@/constants';
import { cn } from '@/lib/utils';
import { useStepFocus } from '@/hooks/useStepFocus';
import { SkipLink } from '@/components/common/SkipLink';
import { StepAnnouncer } from './StepAnnouncer';

const Step1LoanType = lazy(() => import('@/components/steps/Step1LoanType'));
const Step2PersonalInfo = lazy(() => import('@/components/steps/Step2PersonalInfo'));
const Step3KYC = lazy(() => import('@/components/steps/Step3KYC'));
const Step4Address = lazy(() => import('@/components/steps/Step4Address'));
const Step5Employment = lazy(() => import('@/components/steps/Step5Employment'));
const Step6CoApplicant = lazy(() => import('@/components/steps/Step6CoApplicant'));
const Step7Documents = lazy(() => import('@/components/steps/Step7Documents'));
const Step8Review = lazy(() => import('@/components/steps/Step8Review'));

const STEP_COMPONENTS: Record<number, React.ComponentType> = {
  1: Step1LoanType,
  2: Step2PersonalInfo,
  3: Step3KYC,
  4: Step4Address,
  5: Step5Employment,
  6: Step6CoApplicant,
  7: Step7Documents,
  8: Step8Review,
};

function StepSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6" aria-label="Loading step">
      <div className="h-6 w-1/3 rounded bg-secondary" />
      <div className="h-10 rounded bg-secondary" />
      <div className="h-10 rounded bg-secondary" />
      <div className="h-10 w-2/3 rounded bg-secondary" />
    </div>
  );
}

export function Wizard() {
  const { currentStep, direction, completedSteps, rippleTrigger, progressPercent } = useWizard();
  const StepComponent = STEP_COMPONENTS[currentStep];
  const stepPanelRef = useStepFocus(currentStep);

  return (
    <div className="relative min-h-dvh">
      <SkipLink />
      <StepAnnouncer step={currentStep} />
      <AmbientBackground currentStep={currentStep} direction={direction} />

      <header className="sticky top-0 z-40 border-b border-border/60 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-3xl px-4 py-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-lendswift-primary text-sm font-bold text-white">
                LS
              </div>
              <div>
                <h1 className="text-sm font-semibold text-lendswift-primary">LendSwift</h1>
                <p className="text-xs text-muted-foreground">Loan Application</p>
              </div>
            </div>
            <span className="text-sm font-medium text-lendswift-primary">{progressPercent}%</span>
          </div>
          <JourneyPath
            currentStep={currentStep}
            totalSteps={TOTAL_STEPS}
            completedSteps={completedSteps}
          />
        </div>
      </header>

      <main id="main-content" className="mx-auto max-w-3xl px-4 py-6 pb-32" tabIndex={-1}>
        <div className="relative">
          <StepRipple trigger={rippleTrigger} />
          <div
            ref={stepPanelRef}
            role="region"
            aria-label={`Step ${currentStep} form`}
            className={cn(
              'focus-spotlight rounded-2xl border border-border/60 bg-card/90 p-6 shadow-sm backdrop-blur-sm',
              'sm:p-8',
            )}
          >
            <StepTransition stepKey={currentStep} direction={direction}>
              <Suspense fallback={<StepSkeleton />}>
                {StepComponent ? <StepComponent /> : null}
              </Suspense>
            </StepTransition>
          </div>
        </div>
      </main>

      <StepNavigation />
    </div>
  );
}
