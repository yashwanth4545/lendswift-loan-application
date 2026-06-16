import { useCallback, useRef, useState } from 'react';
import { simulateVerification } from '@/utils/validators';

type VerificationType = 'PAN' | 'Aadhaar';

interface UseVerificationOptions {
  type: VerificationType;
  validate: (value: string) => boolean;
  getErrorMessage?: (value: string) => string;
  onVerified?: (verified: boolean) => void;
}

export function useVerification({ type, validate, getErrorMessage, onVerified }: UseVerificationOptions) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(0);

  const reset = useCallback(() => {
    abortRef.current += 1;
    setIsVerifying(false);
    setIsVerified(false);
    setError(null);
    onVerified?.(false);
  }, [onVerified]);

  const verify = useCallback(
    async (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        reset();
        return false;
      }

      if (!validate(trimmed)) {
        setIsVerified(false);
        setIsVerifying(false);
        setError(
          getErrorMessage?.(trimmed) ??
            (type === 'PAN'
              ? 'PAN must be 10 characters in format AAAAA9999A'
              : 'Aadhaar must be 12 digits starting with 2–9'),
        );
        onVerified?.(false);
        return false;
      }

      const runId = ++abortRef.current;
      setIsVerifying(true);
      setError(null);
      setIsVerified(false);

      const result = await simulateVerification(type, trimmed, () => validate(trimmed));

      if (runId !== abortRef.current) return false;

      setIsVerifying(false);

      if (result.success) {
        setIsVerified(true);
        setError(null);
        onVerified?.(true);
        return true;
      }

      setError(result.error ?? `Could not verify ${type}`);
      onVerified?.(false);
      return false;
    },
    [type, validate, getErrorMessage, onVerified, reset],
  );

  return { isVerifying, isVerified, error, verify, reset };
}
