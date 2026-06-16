import { Loader2 } from 'lucide-react';
import { MaskedInput } from './MaskedInput';
import { ErrorMessage } from './ErrorMessage';
import { VerifyBadge } from '@/components/animations/MotionPrimitives';

interface VerifiedFieldProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlurVerify: () => void;
  maskType: 'pan' | 'aadhaar';
  isVerifying: boolean;
  isVerified: boolean;
  error?: string;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
}

export function VerifiedField({
  label,
  id,
  value,
  onChange,
  onBlurVerify,
  maskType,
  isVerifying,
  isVerified,
  error,
  required,
  helpText,
  placeholder,
}: VerifiedFieldProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-lendswift-error">*</span>}
          {required && <span className="sr-only"> (required)</span>}
        </label>
        <div className="flex items-center gap-2">
          {isVerifying && (
            <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" role="status">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              Verifying…
            </span>
          )}
          <VerifyBadge verified={isVerified} />
        </div>
      </div>
      <MaskedInput
        id={id}
        label={label}
        value={value}
        onChange={(v) => {
          onChange(v);
        }}
        onBlur={onBlurVerify}
        maskType={maskType}
        hideLabel
        invalid={!!error}
        required={required}
        helpText={helpText}
        placeholder={placeholder}
        autoComplete="off"
      />
      <ErrorMessage id={`${id}-error`} message={error} />
    </div>
  );
}
