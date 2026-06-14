import { forwardRef, useCallback, useEffect, useState, type ChangeEvent } from 'react';
import { Input } from './Input';
import { cn, formatIndianNumber } from '@/lib/utils';

interface CurrencyInputProps {
  label: string;
  id?: string;
  name?: string;
  value: number | '';
  onChange: (value: number | '') => void;
  onBlur?: () => void;
  invalid?: boolean;
  error?: string;
  required?: boolean;
  helpText?: string;
  min?: number;
  max?: number;
  placeholder?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  (
    {
      label,
      id,
      name,
      value,
      onChange,
      onBlur,
      invalid,
      error,
      required,
      helpText,
      min,
      max,
      placeholder = '0',
    },
    ref,
  ) => {
    const inputId = id ?? name ?? 'currency';
    const [display, setDisplay] = useState(() =>
      value === '' ? '' : formatIndianNumber(Number(value)),
    );
    const [focused, setFocused] = useState(false);

    useEffect(() => {
      if (!focused) {
        setDisplay(value === '' ? '' : formatIndianNumber(Number(value)));
      }
    }, [value, focused]);

    const handleChange = useCallback(
      (e: ChangeEvent<HTMLInputElement>) => {
        const raw = e.target.value.replace(/[^\d]/g, '');
        if (raw === '') {
          setDisplay('');
          onChange('');
          return;
        }
        const num = parseInt(raw, 10);
        setDisplay(formatIndianNumber(num));
        onChange(num);
      },
      [onChange],
    );

    const handleFocus = () => setFocused(true);

    const handleBlur = () => {
      setFocused(false);
      onBlur?.();
      if (value !== '') {
        setDisplay(formatIndianNumber(Number(value)));
      }
    };

    return (
      <Input>
        <Input.Label htmlFor={inputId} required={required}>
          {label}
        </Input.Label>
        <div className="relative">
          <span
            className={cn(
              'pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground',
              focused && 'text-lendswift-primary',
            )}
            aria-hidden="true"
          >
            ₹
          </span>
          <Input.Field
            ref={ref}
            id={inputId}
            name={name}
            inputMode="numeric"
            autoComplete="off"
            value={display}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            invalid={invalid}
            placeholder={placeholder}
            className="pl-8"
            aria-describedby={error ? `${inputId}-error` : helpText ? `${inputId}-help` : undefined}
          />
        </div>
        {helpText && !error && <Input.HelpText id={`${inputId}-help`}>{helpText}</Input.HelpText>}
        {min !== undefined && max !== undefined && !error && (
          <Input.HelpText>
            Range: ₹{formatIndianNumber(min)} – ₹{formatIndianNumber(max)}
          </Input.HelpText>
        )}
      </Input>
    );
  },
);
CurrencyInput.displayName = 'CurrencyInput';

export function parseCurrencyInput(value: string): number | '' {
  const raw = value.replace(/[^\d]/g, '');
  return raw === '' ? '' : parseInt(raw, 10);
}
