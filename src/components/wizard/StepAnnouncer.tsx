import { useEffect, useState } from 'react';
import { STEP_THEMES, TOTAL_STEPS } from '@/constants';

/** Screen-reader announcement when the wizard step changes (WCAG 4.1.3). */
export function StepAnnouncer({ step }: { step: number }) {
  const [message, setMessage] = useState('');

  useEffect(() => {
    const theme = STEP_THEMES[step - 1];
    if (theme) {
      setMessage(`Step ${step} of ${TOTAL_STEPS}: ${theme.label}`);
    }
  }, [step]);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
}
