import { Controller } from 'react-hook-form';
import { useCallback, useEffect } from 'react';
import { STEP_THEMES } from '@/constants';
import { useLoanForm } from '@/hooks/useLoanForm';
import { useVerification } from '@/hooks/useVerification';
import { VerifiedField } from '@/components/common/VerifiedField';
import { NativeSelect } from '@/components/common/Select';
import { CurrencyInput } from '@/components/common/CurrencyInput';
import { Checkbox } from '@/components/common/Checkbox';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { CO_APPLICANT_RELATIONSHIPS } from '@/types/form';
import { validatePanEntityType } from '@/utils/validators';
import { needsCoApplicant } from '@/utils/stepVisibility';
import { formatIndianNumber, cn } from '@/lib/utils';

export default function Step6CoApplicant() {
  const theme = STEP_THEMES[5];
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useLoanForm();

  const loanType = watch('loanType');
  const loanAmount = watch('loanAmount');
  const maritalStatus = watch('maritalStatus');
  const coApplicantPan = watch('coApplicantPan');
  const coApplicantRelationship = watch('coApplicantRelationship');

  const required = needsCoApplicant(loanType, loanAmount);
  const panAllowed = loanType === 'business' ? ['P', 'C', 'F'] : ['P'];

  const panVerification = useVerification({
    type: 'PAN',
    validate: (v) => validatePanEntityType(v, panAllowed).valid,
    onVerified: (v) => setValue('coApplicantPanVerified', v, { shouldDirty: true }),
  });

  useEffect(() => {
    if (maritalStatus === 'married' && !coApplicantRelationship) {
      setValue('coApplicantRelationship', 'spouse');
    }
  }, [maritalStatus, coApplicantRelationship, setValue]);

  const handlePanBlur = useCallback(() => {
    if (coApplicantPan) panVerification.verify(coApplicantPan);
  }, [coApplicantPan, panVerification]);

  const handlePanChange = useCallback(
    (value: string) => {
      setValue('coApplicantPan', value, { shouldDirty: true });
      setValue('coApplicantPanVerified', false);
      panVerification.reset();
    },
    [setValue, panVerification],
  );

  if (!required) {
    return (
      <div className="space-y-4 py-8 text-center">
        <h2 className="text-xl font-semibold">{theme.label}</h2>
        <p className="text-sm text-muted-foreground">
          Co-applicant is not required for your loan amount. Skipping to documents…
        </p>
      </div>
    );
  }

  const reasonText = (() => {
    if (loanType === 'home') return 'Home loans require a co-applicant.';
    if (loanType === 'personal') return `Personal loans above ₹${formatIndianNumber(500000)} require a co-applicant.`;
    return `Business loans above ₹${formatIndianNumber(2000000)} require a co-applicant.`;
  })();

  const panError = errors.coApplicantPan?.message ?? panVerification.error ?? undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{theme.label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{reasonText}</p>
      </div>

      <Controller
        name="coApplicantName"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <label htmlFor="coApplicantName" className="block text-sm font-medium">
              Co-Applicant Name <span className="text-lendswift-error">*</span>
            </label>
            <input
              id="coApplicantName"
              aria-invalid={!!errors.coApplicantName || undefined}
              aria-describedby={errors.coApplicantName ? 'coApplicantName-error' : undefined}
              className={cn(
                'flex h-11 w-full rounded-lg border px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                errors.coApplicantName ? 'border-lendswift-error' : 'border-input',
              )}
              autoComplete="name"
              {...field}
            />
            <ErrorMessage id="coApplicantName-error" message={errors.coApplicantName?.message} />
          </div>
        )}
      />

      <Controller
        name="coApplicantRelationship"
        control={control}
        render={({ field }) => (
          <div>
            <NativeSelect
              label="Relationship"
              required
              options={CO_APPLICANT_RELATIONSHIPS}
              invalid={!!errors.coApplicantRelationship}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
            />
            <ErrorMessage message={errors.coApplicantRelationship?.message} />
          </div>
        )}
      />

      <Controller
        name="coApplicantPan"
        control={control}
        render={() => (
          <VerifiedField
            id="coApplicantPan"
            label="Co-Applicant PAN"
            value={coApplicantPan}
            onChange={handlePanChange}
            onBlurVerify={handlePanBlur}
            maskType="pan"
            isVerifying={panVerification.isVerifying}
            isVerified={panVerification.isVerified}
            error={panError}
            required
            placeholder="ABCPK1234L"
          />
        )}
      />

      <Controller
        name="coApplicantIncome"
        control={control}
        render={({ field }) => (
          <div>
            <CurrencyInput
              label="Co-Applicant Monthly Income"
              name="coApplicantIncome"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={!!errors.coApplicantIncome}
              required
              min={1}
              helpText="Combined income used for EMI affordability in final review"
            />
            <ErrorMessage message={errors.coApplicantIncome?.message} />
          </div>
        )}
      />

      <Controller
        name="coApplicantConsent"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <Checkbox
              id="coApplicantConsent"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              label="Co-applicant consent"
              description="I confirm the co-applicant has agreed to be listed on this loan application and authorizes credit verification."
            />
            <ErrorMessage message={errors.coApplicantConsent?.message} />
          </div>
        )}
      />
    </div>
  );
}
