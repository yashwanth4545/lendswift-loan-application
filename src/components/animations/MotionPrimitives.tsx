import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect } from 'react';
import { cn } from '@/lib/utils';
import { STEP_THEMES } from '@/constants';

interface AmbientBackgroundProps {
  currentStep: number;
  direction: 'forward' | 'backward';
}

/** Step-themed ambient orbs — compositor-only, zero layout thrash */
export function AmbientBackground({ currentStep, direction }: AmbientBackgroundProps) {
  const theme = STEP_THEMES[currentStep - 1] ?? STEP_THEMES[0];
  const hue = parseInt(theme.hue, 10);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden -z-10" aria-hidden="true">
      <motion.div
        key={`orb-a-${currentStep}`}
        className="absolute -top-32 -right-32 h-96 w-96 rounded-full blur-3xl gpu-layer"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 0.35,
          scale: 1,
          background: `hsl(${hue} 70% 85%)`,
        }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      />
      <motion.div
        key={`orb-b-${currentStep}`}
        className="absolute -bottom-24 -left-24 h-80 w-80 rounded-full blur-3xl gpu-layer"
        initial={{ opacity: 0, x: direction === 'forward' ? -40 : 40 }}
        animate={{
          opacity: 0.25,
          x: 0,
          background: `hsl(${(hue + 40) % 360} 60% 88%)`,
        }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
  );
}

interface JourneyPathProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: Set<number>;
}

/** SVG journey path — progress flows like money through a pipeline */
export function JourneyPath({ currentStep, totalSteps, completedSteps }: JourneyPathProps) {
  const progress = useSpring(currentStep / totalSteps, { stiffness: 80, damping: 20 });
  const dashOffset = useTransform(progress, (p) => 1000 - p * 1000);
  const barWidth = useTransform(progress, (p) => `${p * 100}%`);

  useEffect(() => {
    progress.set(currentStep / totalSteps);
  }, [currentStep, totalSteps, progress]);

  const stepWidth = 100 / (totalSteps - 1);

  return (
    <div
      className="w-full px-2"
      role="progressbar"
      aria-valuenow={currentStep}
      aria-valuemin={1}
      aria-valuemax={totalSteps}
      aria-label={`Step ${currentStep} of ${totalSteps}`}
    >
      <div className="relative h-16">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
          <path d="M 2 20 Q 25 8, 50 20 T 98 20" fill="none" stroke="hsl(var(--border))" strokeWidth="0.8" strokeLinecap="round" />
          <motion.path
            d="M 2 20 Q 25 8, 50 20 T 98 20"
            fill="none"
            stroke="url(#journeyGradient)"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeDasharray="1000"
            style={{ strokeDashoffset: dashOffset }}
          />
          <defs>
            <linearGradient id="journeyGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1F4E79" />
              <stop offset="100%" stopColor="#27AE60" />
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute inset-x-0 top-6 flex justify-between">
          {STEP_THEMES.map((step) => {
            const isActive = step.id === currentStep;
            const isComplete = completedSteps.has(step.id) || step.id < currentStep;

            return (
              <motion.div
                key={step.id}
                className="flex flex-col items-center"
                style={{ width: `${stepWidth}%` }}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <motion.div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-semibold',
                    isComplete && 'border-lendswift-accent bg-lendswift-accent text-white',
                    isActive && !isComplete && 'border-lendswift-primary bg-white text-lendswift-primary shadow-md',
                    !isActive && !isComplete && 'border-border bg-white text-muted-foreground',
                  )}
                  aria-hidden="true"
                  animate={
                    isActive
                      ? { boxShadow: '0 0 0 4px hsl(207 60% 30% / 0.15)' }
                      : { boxShadow: '0 0 0 0px transparent' }
                  }
                >
                  {isComplete ? <AnimatedCheckmark className="h-4 w-4" /> : step.id}
                </motion.div>
                <span
                  className={cn(
                    'mt-1 hidden max-w-[4rem] text-center text-[10px] font-medium leading-tight sm:block',
                    isActive ? 'text-lendswift-primary' : 'text-muted-foreground',
                  )}
                  aria-current={isActive ? 'step' : undefined}
                  aria-label={`${step.label}${isComplete ? ', completed' : isActive ? ', current' : ''}`}
                >
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
      <div className="mt-1 h-1 overflow-hidden rounded-full bg-secondary">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-lendswift-primary to-lendswift-accent"
          style={{ width: barWidth }}
        />
      </div>
    </div>
  );
}

interface AnimatedCheckmarkProps {
  className?: string;
}

export function AnimatedCheckmark({ className }: AnimatedCheckmarkProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <motion.path
        d="M5 13l4 4L19 7"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      />
    </svg>
  );
}

interface CountUpProps {
  value: number;
  prefix?: string;
  className?: string;
}

/** EMI counter — numbers roll up on reveal */
export function CountUp({ value, prefix = '₹', className }: CountUpProps) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (v) =>
    `${prefix}${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(Math.round(v))}`,
  );

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span className={className}>{display}</motion.span>;
}

interface StepRippleProps {
  trigger: number;
}

export function StepRipple({ trigger }: StepRippleProps) {
  if (trigger === 0) return null;

  return (
    <motion.div
      key={trigger}
      className="pointer-events-none absolute inset-0 rounded-xl border-2 border-lendswift-accent"
      initial={{ scale: 1, opacity: 0.6 }}
      animate={{ scale: 1.02, opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      aria-hidden="true"
    />
  );
}

interface VerifyBadgeProps {
  verified: boolean;
  label?: string;
}

export function VerifyBadge({ verified, label = 'Verified' }: VerifyBadgeProps) {
  if (!verified) return null;

  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
      className="inline-flex items-center gap-1 rounded-full bg-lendswift-accent/10 px-2.5 py-0.5 text-xs font-medium text-lendswift-accent"
      role="status"
    >
      <AnimatedCheckmark className="h-3.5 w-3.5" />
      {label}
    </motion.span>
  );
}

interface SuccessParticlesProps {
  active: boolean;
}

/** CSS particle burst on submission — no canvas library */
export function SuccessParticles({ active }: SuccessParticlesProps) {
  if (!active) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{ background: i % 2 === 0 ? '#1F4E79' : '#27AE60' }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos((i / 12) * Math.PI * 2) * 120,
            y: Math.sin((i / 12) * Math.PI * 2) * 120,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: i * 0.02 }}
        />
      ))}
    </div>
  );
}
