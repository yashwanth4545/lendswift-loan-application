import { useEffect, useRef, useCallback, useState } from 'react';
import { AUTO_SAVE_INTERVAL_MS, AUTO_SAVE_KEY_PREFIX, DRAFT_TTL_HOURS } from '@/constants';
import { encryptData, decryptData } from '@/utils/encryption';
import type { LoanFormData } from '@/types/form';

export const DRAFT_VERSION = '1.0';

export interface DraftPayload {
  version: string;
  timestamp: string;
  step: number;
  loanType: string;
  formData: LoanFormData;
  completedSteps: number[];
}

export interface DraftMeta {
  version: string;
  timestamp: string;
  step: number;
  loanType: string;
}

function getDraftKey(loanType: string) {
  return `${AUTO_SAVE_KEY_PREFIX}${loanType || 'unknown'}`;
}

function getMetaKey(loanType: string) {
  return `${getDraftKey(loanType)}_meta`;
}

export function isDraftExpired(timestamp: string): boolean {
  const saved = new Date(timestamp).getTime();
  const ttlMs = DRAFT_TTL_HOURS * 60 * 60 * 1000;
  return Date.now() - saved > ttlMs;
}

export async function saveDraft(payload: DraftPayload): Promise<void> {
  const key = getDraftKey(payload.loanType);
  const meta: DraftMeta = {
    version: payload.version,
    timestamp: payload.timestamp,
    step: payload.step,
    loanType: payload.loanType,
  };

  const encrypted = await encryptData(JSON.stringify(payload));
  localStorage.setItem(key, encrypted);
  localStorage.setItem(getMetaKey(payload.loanType), JSON.stringify(meta));
}

export async function loadDraft(loanType: string): Promise<DraftPayload | null> {
  const key = getDraftKey(loanType);
  const encrypted = localStorage.getItem(key);
  const metaRaw = localStorage.getItem(getMetaKey(loanType));

  if (!encrypted || !metaRaw) return null;

  try {
    const meta = JSON.parse(metaRaw) as DraftMeta;
    if (isDraftExpired(meta.timestamp)) {
      clearDraft(loanType);
      return null;
    }

    const decrypted = await decryptData(encrypted);
    const payload = JSON.parse(decrypted) as DraftPayload;

    if (payload.version !== DRAFT_VERSION) {
      clearDraft(loanType);
      return null;
    }

    return payload;
  } catch {
    clearDraft(loanType);
    return null;
  }
}

export function findAnyDraft(): { loanType: string; meta: DraftMeta } | null {
  const types = ['personal', 'home', 'business'];
  for (const type of types) {
    const metaRaw = localStorage.getItem(getMetaKey(type));
    if (!metaRaw) continue;
    try {
      const meta = JSON.parse(metaRaw) as DraftMeta;
      if (!isDraftExpired(meta.timestamp)) {
        return { loanType: type, meta };
      }
      clearDraft(type);
    } catch {
      clearDraft(type);
    }
  }
  return null;
}

export function clearDraft(loanType: string): void {
  localStorage.removeItem(getDraftKey(loanType));
  localStorage.removeItem(getMetaKey(loanType));
}

interface UseAutoSaveOptions {
  formData: LoanFormData;
  currentStep: number;
  completedSteps: Set<number>;
  enabled?: boolean;
  onSaved?: (time: Date) => void;
}

export function useAutoSave({
  formData,
  currentStep,
  completedSteps,
  enabled = true,
  onSaved,
}: UseAutoSaveOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const persist = useCallback(async () => {
    if (!enabled || !formData.loanType) return;

    setIsSaving(true);
    try {
      const payload: DraftPayload = {
        version: DRAFT_VERSION,
        timestamp: new Date().toISOString(),
        step: currentStep,
        loanType: formData.loanType,
        formData,
        completedSteps: Array.from(completedSteps),
      };
      await saveDraft(payload);
      onSaved?.(new Date());
    } finally {
      setIsSaving(false);
    }
  }, [formData, currentStep, completedSteps, enabled, onSaved]);

  useEffect(() => {
    if (!enabled) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void persist();
    }, AUTO_SAVE_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [formData, currentStep, completedSteps, enabled, persist]);

  return { saveNow: persist, isSaving };
}
