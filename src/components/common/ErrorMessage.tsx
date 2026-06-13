import { cn } from '@/lib/utils';

interface ErrorMessageProps {
  id?: string;
  message?: string;
  className?: string;
}

export function ErrorMessage({ id, message, className }: ErrorMessageProps) {
  if (!message) return null;

  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      className={cn('text-xs font-medium text-lendswift-error', className)}
    >
      {message}
    </p>
  );
}
