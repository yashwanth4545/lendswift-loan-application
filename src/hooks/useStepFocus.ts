import { useEffect, useRef, type RefObject } from 'react';

/** Move focus to the first focusable field when the wizard step changes (WCAG). */
export function useStepFocus(step: number): RefObject<HTMLDivElement> {
  const mainRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = mainRef.current;
    if (!root) return;

    const timer = window.setTimeout(() => {
      const heading = root.querySelector<HTMLElement>('h2');
      if (heading) {
        if (!heading.hasAttribute('tabindex')) {
          heading.setAttribute('tabindex', '-1');
        }
        heading.focus({ preventScroll: false });
        return;
      }

      const focusable = root.querySelector<HTMLElement>(
        'input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      focusable?.focus({ preventScroll: false });
    }, 280);

    return () => window.clearTimeout(timer);
  }, [step]);

  return mainRef;
}
