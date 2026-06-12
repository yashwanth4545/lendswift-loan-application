import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

interface StepTransitionProps {
  stepKey: number;
  direction: 'forward' | 'backward';
  children: ReactNode;
}

const variants = {
  enter: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? 24 : -24,
    opacity: 0,
    filter: 'blur(4px)',
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: 'blur(0px)',
  },
  exit: (direction: 'forward' | 'backward') => ({
    x: direction === 'forward' ? -24 : 24,
    opacity: 0,
    filter: 'blur(4px)',
  }),
};

/** Direction-aware blur parallax — LazyMotion for minimal bundle */
export function StepTransition({ stepKey, direction, children }: StepTransitionProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait" custom={direction}>
        <m.div
          ref={containerRef}
          key={stepKey}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 380, damping: 32 },
            opacity: { duration: 0.15 },
            filter: { duration: 0.2 },
          }}
          className="gpu-layer w-full"
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}

interface CardFlipProps {
  flipped: boolean;
  front: ReactNode;
  back: ReactNode;
}

/** 3D card flip for pre-approval EMI summary */
export function CardFlip({ flipped, front, back }: CardFlipProps) {
  return (
    <div className="w-full" style={{ perspective: '1000px' }}>
      <m.div
        className="relative w-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        <div style={{ backfaceVisibility: 'hidden' }}>{front}</div>
        <div
          className="absolute inset-0"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          {back}
        </div>
      </m.div>
    </div>
  );
}
