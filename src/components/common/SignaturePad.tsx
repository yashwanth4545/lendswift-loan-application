import { useRef, useState, useCallback, useEffect } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Eraser, Lock, PenLine, Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  saveSignatureToVault,
  getOrCreateSignatureSessionId,
} from '@/utils/signatureVault';
import { VerifyBadge } from '@/components/animations/MotionPrimitives';

interface SignaturePadProps {
  sessionId: string;
  onSessionId: (id: string) => void;
  encryptedSignature: string;
  signaturePreview: string;
  signatureSavedAt: string;
  onSignatureSaved: (payload: {
    encryptedSignature: string;
    preview: string;
    savedAt: string;
  }) => void;
  onClear: () => void;
  error?: string;
}

export function SignaturePad({
  sessionId,
  onSessionId,
  encryptedSignature,
  signaturePreview,
  signatureSavedAt,
  onSignatureSaved,
  onClear,
  error,
}: SignaturePadProps) {
  const sigRef = useRef<SignatureCanvas>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 400, height: 180 });

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => setCanvasSize({ width: el.clientWidth, height: 180 });
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleClear = useCallback(() => {
    sigRef.current?.clear();
    setLocalError(null);
    onClear();
  }, [onClear]);

  const handleSave = useCallback(async () => {
    if (!sigRef.current || sigRef.current.isEmpty()) {
      setLocalError('Please draw your signature before saving');
      return;
    }

    setIsSaving(true);
    setLocalError(null);

    try {
      const dataUrl = sigRef.current.toDataURL('image/png');
      const sid = getOrCreateSignatureSessionId(sessionId);
      if (sid !== sessionId) onSessionId(sid);

      const record = await saveSignatureToVault(sid, dataUrl);

      onSignatureSaved({
        encryptedSignature: record.encryptedPayload,
        preview: dataUrl,
        savedAt: record.savedAt,
      });
    } catch {
      setLocalError('Failed to encrypt and save signature. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [sessionId, onSessionId, onSignatureSaved]);

  useEffect(() => {
    if (!('Cypress' in window)) return;

    const testStroke =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAMElEQVR42u3OMQEAAAgDoK3/tY8NWAkKp0e9AQAAAAAAAAAAAAAAAAAAAPBuBq8BAAE0k0H+AAAAAElFTkSuQmCC';

    const w = window as Window & { __lendswiftSignTest?: () => Promise<void> };
    w.__lendswiftSignTest = async () => {
      const pad = sigRef.current;
      if (!pad) return;
      pad.fromDataURL(testStroke);
      await handleSave();
    };

    return () => {
      delete w.__lendswiftSignTest;
    };
  }, [handleSave]);

  const isSaved = !!encryptedSignature && !!signaturePreview;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium">
            E-Signature <span className="text-lendswift-error">*</span>
          </h3>
          <p className="text-xs text-muted-foreground">
            Draw with mouse, touchpad, or finger — saved encrypted to secure vault
          </p>
        </div>
        {isSaved && <VerifyBadge verified label="Encrypted & Saved" />}
      </div>

      <div
        ref={containerRef}
        className={cn(
          'relative overflow-hidden rounded-xl border-2 bg-white',
          isSaved ? 'border-lendswift-accent/50' : 'border-border',
        )}
      >
        <SignatureCanvas
          ref={sigRef}
          penColor="#1F4E79"
          minWidth={1.5}
          maxWidth={2.5}
          velocityFilterWeight={0.7}
          canvasProps={{
            width: canvasSize.width,
            height: canvasSize.height,
            className: 'w-full touch-none cursor-crosshair',
            role: 'img',
            'aria-label': 'Signature drawing canvas — use pointer to sign',
          }}
        />

        {isSaved && (
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"
            aria-hidden="true"
          />
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-border px-4 py-2 text-sm font-medium hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Eraser className="h-4 w-4" aria-hidden="true" />
          Clear
        </button>
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl bg-lendswift-primary px-4 py-2 text-sm font-semibold text-white hover:bg-lendswift-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-70"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <PenLine className="h-4 w-4" aria-hidden="true" />
          )}
          {isSaving ? 'Encrypting…' : 'Save Encrypted Signature'}
        </button>
      </div>

      {isSaved && (
        <div className="flex items-start gap-2 rounded-lg border border-lendswift-accent/30 bg-lendswift-accent/5 p-3 text-xs text-muted-foreground">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-lendswift-accent" aria-hidden="true" />
          <div>
            <p className="font-medium text-lendswift-accent">
              <Check className="mr-1 inline h-3.5 w-3.5" aria-hidden="true" />
              AES-256-GCM encrypted & stored in secure vault (IndexedDB)
            </p>
            <p className="mt-0.5">
              Saved at {new Date(signatureSavedAt).toLocaleString('en-IN')} — will appear in review step
            </p>
          </div>
        </div>
      )}

      {signaturePreview && isSaved && (
        <div className="rounded-lg border border-border p-2">
          <p className="mb-1 text-xs text-muted-foreground">Preview:</p>
          <img
            src={signaturePreview}
            alt="Your captured e-signature"
            className="mx-auto max-h-16 object-contain"
          />
        </div>
      )}

      {(error || localError) && (
        <p className="text-xs text-lendswift-error" role="alert">
          {error || localError}
        </p>
      )}
    </div>
  );
}
