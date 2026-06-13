import { cn } from '@/lib/utils';
import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

interface FieldProps {
  children: ReactNode;
  className?: string;
}

function Field({ children, className }: FieldProps) {
  return (
    <div className={cn('group space-y-1.5', className)}>
      {children}
    </div>
  );
}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
}

function Label({ children, className, required, ...props }: LabelProps) {
  return (
    <label
      className={cn('block text-sm font-medium text-foreground', className)}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-0.5 text-lendswift-error" aria-hidden="true">
          *
        </span>
      )}
      {required && <span className="sr-only"> (required)</span>}
    </label>
  );
}

interface FieldInputProps extends InputHTMLAttributes<HTMLInputElement> {
  invalid?: boolean;
}

const FieldInput = forwardRef<HTMLInputElement, FieldInputProps>(
  ({ className, invalid, ...props }, ref) => (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        'flex h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        invalid
          ? 'border-lendswift-error focus-visible:ring-lendswift-error/30'
          : 'border-input hover:border-lendswift-primary/40',
        className,
      )}
      {...props}
    />
  ),
);
FieldInput.displayName = 'InputField';

interface HelpTextProps {
  children: ReactNode;
  className?: string;
  id?: string;
}

function HelpText({ children, className, id }: HelpTextProps) {
  return (
    <p id={id} className={cn('text-xs text-muted-foreground', className)}>
      {children}
    </p>
  );
}

export const Input = Object.assign(Field, {
  Label,
  Field: FieldInput,
  HelpText,
});
