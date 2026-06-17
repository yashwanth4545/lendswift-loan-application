import { useCallback, useState } from 'react';
import pinCodeData from '@/utils/pinCodeData.json';

export interface PinCodeRecord {
  city: string;
  state: string;
  postOffice: string;
}

type PinCodeMap = Record<string, PinCodeRecord>;

const PIN_MAP = pinCodeData as PinCodeMap;

export function usePinCodeLookup() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lookup = useCallback(async (pin: string): Promise<PinCodeRecord | null> => {
    if (!/^\d{6}$/.test(pin)) {
      setError(null);
      return null;
    }

    setIsLoading(true);
    setError(null);

    await new Promise((resolve) => setTimeout(resolve, 400));

    const record = PIN_MAP[pin];
    setIsLoading(false);

    if (!record) {
      setError('PIN code not found. Please verify and try again.');
      return null;
    }

    return record;
  }, []);

  return { lookup, isLoading, error, clearError: () => setError(null) };
}

export function getPinCodeRecord(pin: string): PinCodeRecord | null {
  return PIN_MAP[pin] ?? null;
}
