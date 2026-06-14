import { forwardRef, useCallback, useState, type ChangeEvent } from 'react';
import { Input } from './Input';
import { maskPii } from '@/utils/validators';

type MaskType = 'pan' | 'aadhaar' | 'none';

interface MaskedInputProps {
  label: string;
  hideLabel?: boolean;
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  maskType?: MaskType;
  invalid?: boolean;
  error?: string;
  required?: boolean;
  helpText?: string;
  placeholder?: string;
  maxLength?: number;
  autoComplete?: string;
}

function formatPan(value: string): string {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10);
}

function formatAadhaar(value: string): string {
  return value.replace(/\D/g, '').slice(0, 12);
}

export const MaskedInput = forwardRef<HTMLInputElement, MaskedInputProps>(
  (
    {
      label,
      id,
      name,
      value,
      onChange,
      onBlur,
      maskType = 'none',
      invalid,
      error,
      required,
      helpText,
      placeholder,
      maxLength,
      autoComplete,
      hideLabel,
    },
    ref,
  ) => {
    const inputId = id ?? name ?? 'masked';
    const [focused, setFocused] = useState(false);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        let next = e.target.value;
        if (maskType === 'pan') next = formatPan(next);
        else if (maskType === 'aadhaar') next = formatAadhaar(next);
        onChange(next);
      },
      [maskType, onChange],
    );

    const displayValue = (() => {
      if (focused || maskType === 'none' || maskType === 'pan') return value;
      if (maskType === 'aadhaar' && value.length > 4) {
        return maskPii(value, 4);
      }
      return value;
    })();

    return (
      <Input>
        {!hideLabel && (
          <Input.Label htmlFor={inputId} required={required}>
            {label}
          </Input.Label>
        )}
        <Input.Field
          ref={ref}
          id={inputId}
          name={name}
          value={displayValue}
          onChange={handleChange}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            onBlur?.();
            setFocused(false);
          }}
          invalid={invalid}
          placeholder={placeholder}
          maxLength={maxLength ?? (maskType === 'pan' ? 10 : maskType === 'aadhaar' ? 12 : undefined)}
          autoComplete={autoComplete}
          spellCheck={false}
          aria-label={hideLabel && label ? label : undefined}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helpText
                ? `${inputId}-help`
                : undefined
          }
        />
        {helpText && !error && <Input.HelpText id={`${inputId}-help`}>{helpText}</Input.HelpText>}
      </Input>
    );
  },
);
MaskedInput.displayName = 'MaskedInput';
