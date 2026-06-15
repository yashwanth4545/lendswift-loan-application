import { Controller } from 'react-hook-form';
import { useMemo, useRef, useEffect } from 'react';
import { STEP_THEMES, LOAN_LIMITS, type LoanType } from '@/constants';
import { useLoanForm } from '@/hooks/useLoanForm';
import { LoanTypeCards } from '@/components/common/RadioGroup';
import { CurrencyInput } from '@/components/common/CurrencyInput';
import { NativeSelect } from '@/components/common/Select';
import { Input } from '@/components/common/Input';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { LOAN_PURPOSES, TENURE_OPTIONS } from '@/types/form';
import { formatIndianNumber } from '@/lib/utils';
import { getMaxTenureForApplicant } from '@/utils/crossStepSync';

export default function Step1LoanType() {
  const theme = STEP_THEMES[0];
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useLoanForm();

  const loanType = watch('loanType') as LoanType | '';
  const dateOfBirth = watch('dateOfBirth');
  const loanTenure = watch('loanTenure');
  const limits = loanType ? LOAN_LIMITS[loanType] : null;
  const prevLoanType = useRef(loanType);

  useEffect(() => {
    if (prevLoanType.current && loanType && prevLoanType.current !== loanType) {
      setValue('loanPurpose', '');
      setValue('loanTenure', '');
    }
    prevLoanType.current = loanType;
  }, [loanType, setValue]);

  const maxTenureByAge = useMemo(() => {
    if (!loanType) return null;
    return getMaxTenureForApplicant({ dateOfBirth }, loanType);
  }, [loanType, dateOfBirth]);

  const tenureOptions = useMemo(() => {
    if (!loanType) return [];
    return TENURE_OPTIONS[loanType]
      .filter((m) => (maxTenureByAge ? m <= maxTenureByAge : true))
      .map((m) => ({
        value: String(m),
        label: `${m} months (${Math.floor(m / 12)}y ${m % 12}m)`,
      }));
  }, [loanType, maxTenureByAge]);

  useEffect(() => {
    if (
      typeof loanTenure === 'number' &&
      maxTenureByAge &&
      loanTenure > maxTenureByAge
    ) {
      setValue('loanTenure', '');
    }
  }, [loanTenure, maxTenureByAge, setValue]);

  const purposeOptions = loanType
    ? LOAN_PURPOSES[loanType].map((p) => ({ value: p.value, label: p.label }))
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{theme.label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Choose your loan type and enter basic details to get started.
        </p>
      </div>

      <div className="space-y-2">
        <span className="text-sm font-medium">
          Loan Type <span className="text-lendswift-error">*</span>
        </span>
        <Controller
          name="loanType"
          control={control}
          render={({ field }) => (
            <LoanTypeCards
              value={field.value}
              onChange={field.onChange}
              invalid={!!errors.loanType}
            />
          )}
        />
        <ErrorMessage message={errors.loanType?.message} />
      </div>

      {loanType && limits && (
        <>
          <Controller
            name="loanAmount"
            control={control}
            render={({ field }) => (
              <CurrencyInput
                label="Loan Amount"
                name="loanAmount"
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                invalid={!!errors.loanAmount}
                error={errors.loanAmount?.message}
                required
                min={limits.min}
                max={limits.max}
                helpText={`Enter amount between ₹${formatIndianNumber(limits.min)} and ₹${formatIndianNumber(limits.max)}`}
              />
            )}
          />
          <Controller
            name="loanTenure"
            control={control}
            render={({ field }) => (
              <NativeSelect
                label="Loan Tenure"
                required
                options={tenureOptions}
                invalid={!!errors.loanTenure}
                value={field.value === '' ? '' : String(field.value)}
                onChange={(e) =>
                  field.onChange(e.target.value ? Number(e.target.value) : '')
                }
                onBlur={field.onBlur}
              />
            )}
          />
          <ErrorMessage message={errors.loanTenure?.message} />
          {maxTenureByAge && dateOfBirth && (
            <p className="text-xs text-muted-foreground">
              Based on your date of birth, maximum tenure is {maxTenureByAge} months (age + tenure
              ≤ 65 years).
            </p>
          )}

          <Controller
            name="loanPurpose"
            control={control}
            render={({ field }) => (
              <NativeSelect
                label="Loan Purpose"
                required
                options={purposeOptions}
                invalid={!!errors.loanPurpose}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            )}
          />
          <ErrorMessage message={errors.loanPurpose?.message} />
        </>
      )}

      <Controller
        name="referralCode"
        control={control}
        render={({ field }) => (
          <Input>
            <Input.Label htmlFor="referralCode">Referral Code (Optional)</Input.Label>
            <Input.Field
              id="referralCode"
              placeholder="e.g. FRIEND2024"
              invalid={!!errors.referralCode}
              {...field}
            />
            <Input.HelpText>6–10 alphanumeric characters if provided</Input.HelpText>
          </Input>
        )}
      />
      <ErrorMessage message={errors.referralCode?.message} />
    </div>
  );
}
