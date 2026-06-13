import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { forwardRef, type ComponentPropsWithoutRef } from 'react';
import { cn } from '@/lib/utils';

export interface RadioOption {
  value: string;
  label: string;
  description?: string;
}

interface RadioGroupProps extends ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  options: RadioOption[];
  label: string;
  layout?: 'horizontal' | 'vertical';
  invalid?: boolean;
}

export const RadioGroup = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, options, label, layout = 'vertical', invalid, ...props }, ref) => (
  <fieldset className={cn('space-y-3', className)}>
    <legend className="text-sm font-medium text-foreground">{label}</legend>
    <RadioGroupPrimitive.Root
      ref={ref}
      className={cn(
        layout === 'horizontal' ? 'flex flex-wrap gap-3' : 'grid gap-2',
      )}
      aria-invalid={invalid || undefined}
      {...props}
    >
      {options.map((option) => (
        <label
          key={option.value}
          className={cn(
            'flex min-h-[44px] cursor-pointer items-start gap-3 rounded-xl border-2 p-3 transition-all',
            'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-1',
            'has-[[data-state=checked]]:border-lendswift-primary has-[[data-state=checked]]:bg-lendswift-primary/5',
            invalid ? 'border-lendswift-error/50' : 'border-border hover:border-lendswift-primary/30',
          )}
        >
          <RadioGroupPrimitive.Item
            value={option.value}
            className={cn(
              'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-input',
              'data-[state=checked]:border-lendswift-primary',
            )}
          >
            <RadioGroupPrimitive.Indicator className="flex h-2 w-2 items-center justify-center rounded-full bg-lendswift-primary" />
          </RadioGroupPrimitive.Item>
          <span className="flex flex-col">
            <span className="text-sm font-medium">{option.label}</span>
            {option.description && (
              <span className="text-xs text-muted-foreground">{option.description}</span>
            )}
          </span>
        </label>
      ))}
    </RadioGroupPrimitive.Root>
  </fieldset>
));
RadioGroup.displayName = 'RadioGroup';

interface LoanTypeCardsProps {
  value: string;
  onChange: (value: string) => void;
  invalid?: boolean;
}

const LOAN_TYPE_CARDS = [
  { value: 'personal', label: 'Personal Loan', desc: 'Up to ₹10 Lakh', icon: '👤' },
  { value: 'home', label: 'Home Loan', desc: 'Up to ₹1 Crore', icon: '🏠' },
  { value: 'business', label: 'Business Loan', desc: 'Up to ₹50 Lakh', icon: '💼' },
];

export function LoanTypeCards({ value, onChange, invalid }: LoanTypeCardsProps) {
  return (
    <RadioGroupPrimitive.Root
      value={value}
      onValueChange={onChange}
      className="grid gap-3 sm:grid-cols-3"
      aria-label="Loan type"
      aria-invalid={invalid || undefined}
    >
      {LOAN_TYPE_CARDS.map((card) => (
        <label
          key={card.value}
          className={cn(
            'flex min-h-[88px] cursor-pointer flex-col rounded-xl border-2 p-4 transition-all',
            'has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring',
            value === card.value
              ? 'border-lendswift-primary bg-lendswift-primary/5 shadow-sm'
              : 'border-border hover:border-lendswift-primary/40',
            invalid && !value && 'border-lendswift-error/40',
          )}
        >
          <RadioGroupPrimitive.Item value={card.value} className="sr-only">
            <RadioGroupPrimitive.Indicator />
          </RadioGroupPrimitive.Item>
          <span className="text-xl" aria-hidden="true">{card.icon}</span>
          <span className="mt-1 font-semibold text-lendswift-primary">{card.label}</span>
          <span className="text-xs text-muted-foreground">{card.desc}</span>
        </label>
      ))}
    </RadioGroupPrimitive.Root>
  );
}
