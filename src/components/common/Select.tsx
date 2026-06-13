import * as SelectPrimitive from '@radix-ui/react-select';
import { ChevronDown, Check } from 'lucide-react';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  label: string;
  id?: string;
  disabled?: boolean;
  invalid?: boolean;
  required?: boolean;
}

export const Select = forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      value,
      onValueChange,
      options,
      placeholder = 'Select an option',
      label,
      id,
      disabled,
      invalid,
      required,
    },
    ref,
  ) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        <label htmlFor={selectId} className="block text-sm font-medium text-foreground">
          {label}
          {required && (
            <>
              <span className="ml-0.5 text-lendswift-error" aria-hidden="true">*</span>
              <span className="sr-only"> (required)</span>
            </>
          )}
        </label>
        <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
          <SelectPrimitive.Trigger
            ref={ref}
            id={selectId}
            aria-invalid={invalid || undefined}
            className={cn(
              'flex h-11 w-full items-center justify-between rounded-lg border bg-white px-3 py-2 text-sm',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              invalid
                ? 'border-lendswift-error'
                : 'border-input hover:border-lendswift-primary/40',
              !value && 'text-muted-foreground',
            )}
          >
            <SelectPrimitive.Value placeholder={placeholder} />
            <SelectPrimitive.Icon>
              <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
            </SelectPrimitive.Icon>
          </SelectPrimitive.Trigger>
          <SelectPrimitive.Portal>
            <SelectPrimitive.Content
              className={cn(
                'z-50 max-h-60 overflow-hidden rounded-lg border bg-white shadow-lg',
                'data-[state=open]:animate-in data-[state=closed]:animate-out',
              )}
              position="popper"
              sideOffset={4}
            >
              <SelectPrimitive.Viewport className="p-1">
                {options.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className={cn(
                      'relative flex cursor-pointer select-none items-center rounded-md py-2 pl-8 pr-3 text-sm outline-none',
                      'focus:bg-lendswift-primary/10 data-[highlighted]:bg-lendswift-primary/10',
                    )}
                  >
                    <span className="absolute left-2 flex h-4 w-4 items-center justify-center">
                      <SelectPrimitive.ItemIndicator>
                        <Check className="h-4 w-4 text-lendswift-primary" />
                      </SelectPrimitive.ItemIndicator>
                    </span>
                    <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Portal>
        </SelectPrimitive.Root>
      </div>
    );
  },
);
Select.displayName = 'Select';

interface NativeSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: SelectOption[];
  invalid?: boolean;
}

export const NativeSelect = forwardRef<HTMLSelectElement, NativeSelectProps>(
  ({ label, options, invalid, className, required, id, ...props }, ref) => {
    const selectId = id ?? label.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className="space-y-1.5">
        <label htmlFor={selectId} className="block text-sm font-medium text-foreground">
          {label}
          {required && <span className="ml-0.5 text-lendswift-error">*</span>}
        </label>
        <select
          ref={ref}
          id={selectId}
          aria-invalid={invalid || undefined}
          className={cn(
            'flex h-11 w-full rounded-lg border bg-white px-3 py-2 text-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            invalid ? 'border-lendswift-error' : 'border-input',
            className,
          )}
          {...props}
        >
          <option value="">Select...</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    );
  },
);
NativeSelect.displayName = 'NativeSelect';
