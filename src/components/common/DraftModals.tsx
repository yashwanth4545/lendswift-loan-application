import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResumeDraftModalProps {
  open: boolean;
  loanType: string;
  savedAt: string;
  onResume: () => void;
  onStartFresh: () => void;
}

const LOAN_LABELS: Record<string, string> = {
  personal: 'Personal Loan',
  home: 'Home Loan',
  business: 'Business Loan',
};

export function ResumeDraftModal({
  open,
  loanType,
  savedAt,
  onResume,
  onStartFresh,
}: ResumeDraftModalProps) {
  const label = LOAN_LABELS[loanType] ?? loanType;
  const formattedTime = new Date(savedAt).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  return (
    <Dialog.Root open={open}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl border bg-white p-6 shadow-xl',
            'data-[state=open]:animate-in data-[state=open]:zoom-in-95',
          )}
          aria-describedby="resume-draft-desc"
        >
          <Dialog.Title className="text-lg font-semibold text-lendswift-primary">
            Resume Application?
          </Dialog.Title>
          <Dialog.Description id="resume-draft-desc" className="mt-2 text-sm text-muted-foreground">
            You have a saved <strong>{label}</strong> application from{' '}
            <strong>{formattedTime}</strong>. Would you like to continue where you left off?
          </Dialog.Description>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onStartFresh}
              className="min-h-[44px] rounded-xl border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Start Fresh
            </button>
            <button
              type="button"
              onClick={onResume}
              className="min-h-[44px] rounded-xl bg-lendswift-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-lendswift-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Resume Application
            </button>
          </div>

          <Dialog.Close asChild>
            <button
              type="button"
              className="absolute right-4 top-4 rounded-lg p-1 text-muted-foreground hover:bg-secondary sr-only"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface SaveToastProps {
  message: string | null;
}

export function SaveToast({ message }: SaveToastProps) {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-lendswift-primary px-4 py-2 text-sm font-medium text-white shadow-lg animate-in fade-in slide-in-from-bottom-2"
    >
      {message}
    </div>
  );
}

interface SubmitSuccessModalProps {
  open: boolean;
  referenceId: string;
  loanType: string;
  onClose: () => void;
}

export function SubmitSuccessModal({
  open,
  referenceId,
  loanType,
  onClose,
}: SubmitSuccessModalProps) {
  const label = LOAN_LABELS[loanType] ?? loanType;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referenceId);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-2xl border bg-white p-6 shadow-xl',
            'data-[state=open]:animate-in data-[state=open]:zoom-in-95',
          )}
          aria-describedby="submit-success-desc"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-lendswift-accent/15 text-lendswift-accent">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <Dialog.Title className="text-center text-lg font-semibold text-lendswift-primary">
            Application Submitted!
          </Dialog.Title>
          <Dialog.Description id="submit-success-desc" className="mt-2 text-center text-sm text-muted-foreground">
            Your <strong>{label}</strong> application has been received. Save your reference number for
            tracking.
          </Dialog.Description>

          <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-4 text-center">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Application Reference
            </p>
            <p className="mt-1 break-all font-mono text-sm font-semibold text-foreground">{referenceId}</p>
            <button
              type="button"
              onClick={handleCopy}
              className="mt-2 text-xs font-medium text-lendswift-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              Copy reference number
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-muted-foreground">
            Our team will review your application within 2–3 business days. You will receive updates via
            SMS and email.
          </p>

          <button
            type="button"
            onClick={onClose}
            className="mt-6 min-h-[44px] w-full rounded-xl bg-lendswift-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-lendswift-primary-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Done
          </button>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
