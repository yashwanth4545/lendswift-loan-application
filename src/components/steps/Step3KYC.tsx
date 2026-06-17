import { Controller } from 'react-hook-form';
import { useCallback, useRef } from 'react';
import { STEP_THEMES } from '@/constants';
import { useLoanForm } from '@/hooks/useLoanForm';
import { useVerification } from '@/hooks/useVerification';
import { VerifiedField } from '@/components/common/VerifiedField';
import { Checkbox } from '@/components/common/Checkbox';
import { Input } from '@/components/common/Input';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import {
  validatePanEntityType,
  validateAadhaarForSimulation,
  validateAadhaarFormat,
} from '@/utils/validators';

export default function Step3KYC() {
  const theme = STEP_THEMES[2];
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useLoanForm();

  const loanType = watch('loanType');
  const loanAmount = watch('loanAmount');
  const pan = watch('pan');
  const aadhaar = watch('aadhaar');
  const aadhaarRef = useRef(aadhaar);
  aadhaarRef.current = aadhaar;

  const showPassport =
    loanType === 'home' && typeof loanAmount === 'number' && loanAmount > 50_00_000;

  const panAllowed = loanType === 'business' ? ['P', 'C', 'F'] : ['P'];

  const panVerification = useVerification({
    type: 'PAN',
    validate: (v) => validatePanEntityType(v, panAllowed).valid,
    getErrorMessage: (v) => validatePanEntityType(v, panAllowed).message ?? 'Invalid PAN',
    onVerified: (v) => setValue('panVerified', v, { shouldDirty: true }),
  });

  const aadhaarVerification = useVerification({
    type: 'Aadhaar',
    validate: (v) => validateAadhaarForSimulation(v).valid,
    getErrorMessage: (v) => validateAadhaarForSimulation(v).message ?? 'Invalid Aadhaar',
    onVerified: (v) => setValue('aadhaarVerified', v, { shouldDirty: true }),
  });

  const handlePanBlur = useCallback(() => {
    const value = pan.trim();
    if (value) void panVerification.verify(value);
  }, [pan, panVerification]);

  const handleAadhaarBlur = useCallback(() => {
    const value = aadhaarRef.current.replace(/\s/g, '');
    if (value) void aadhaarVerification.verify(value);
  }, [aadhaarVerification]);

  const handlePanChange = useCallback(
    (value: string, fieldOnChange: (v: string) => void) => {
      fieldOnChange(value);
      setValue('pan', value, { shouldDirty: true, shouldValidate: false });
      setValue('panVerified', false);
      panVerification.reset();
    },
    [setValue, panVerification],
  );

  const handleAadhaarChange = useCallback(
    (value: string, fieldOnChange: (v: string) => void) => {
      const digits = value.replace(/\D/g, '').slice(0, 12);
      aadhaarRef.current = digits;
      fieldOnChange(digits);
      setValue('aadhaar', digits, { shouldDirty: true, shouldValidate: false });
      setValue('aadhaarVerified', false);
      aadhaarVerification.reset();

      if (digits.length === 12) {
        void aadhaarVerification.verify(digits);
      }
    },
    [setValue, aadhaarVerification],
  );

  const panError = errors.pan?.message ?? panVerification.error ?? undefined;
  const aadhaarError = errors.aadhaar?.message ?? aadhaarVerification.error ?? undefined;

  const aadhaarFormatHint = (() => {
    const check = validateAadhaarFormat(aadhaar);
    if (aadhaar.length === 12 && check.valid) {
      return '12 digits entered — verifying with UIDAI (simulated)…';
    }
    return '12 digits, cannot start with 0 or 1. Demo: 234567890126';
  })();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{theme.label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Verify your identity documents. Both PAN and Aadhaar must be verified to continue.
        </p>
      </div>

      <div className="rounded-xl border border-lendswift-primary/20 bg-lendswift-primary/5 p-4 text-sm text-muted-foreground">
        <strong className="text-lendswift-primary">Regulatory notice:</strong> Aadhaar verification
        requires your explicit consent per RBI Digital Lending Guidelines. Your data is encrypted
        and used only for KYC purposes.
      </div>

      <Controller
        name="pan"
        control={control}
        render={({ field }) => (
          <VerifiedField
            id="pan"
            label="PAN Number"
            value={field.value}
            onChange={(v) => handlePanChange(v, field.onChange)}
            onBlurVerify={handlePanBlur}
            maskType="pan"
            isVerifying={panVerification.isVerifying}
            isVerified={panVerification.isVerified}
            error={panError}
            required
            placeholder="ABCPK1234L"
            helpText={`Format: AAAAA9999A (${loanType === 'business' ? 'P, C, or F entity' : 'P for Individual'})`}
          />
        )}
      />

      <Controller
        name="aadhaar"
        control={control}
        render={({ field }) => (
          <VerifiedField
            id="aadhaar"
            label="Aadhaar Number"
            value={field.value}
            onChange={(v) => handleAadhaarChange(v, field.onChange)}
            onBlurVerify={handleAadhaarBlur}
            maskType="aadhaar"
            isVerifying={aadhaarVerification.isVerifying}
            isVerified={aadhaarVerification.isVerified}
            error={aadhaarError}
            required
            placeholder="234567890126"
            helpText={aadhaarFormatHint}
          />
        )}
      />

      <Controller
        name="aadhaarConsent"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <Checkbox
              id="aadhaarConsent"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              label="I consent to Aadhaar-based KYC verification"
              description="I authorize LendSwift to verify my Aadhaar with UIDAI (simulated for this demo). I understand this is required to process my loan application."
            />
            <ErrorMessage message={errors.aadhaarConsent?.message} />
          </div>
        )}
      />

      <Controller
        name="voterId"
        control={control}
        render={({ field }) => (
          <Input>
            <Input.Label htmlFor="voterId">Voter ID (Optional)</Input.Label>
            <Input.Field
              id="voterId"
              placeholder="ABC1234567"
              invalid={!!errors.voterId}
              {...field}
              onChange={(e) => field.onChange(e.target.value.toUpperCase())}
            />
            <Input.HelpText>3 letters + 7 digits if provided</Input.HelpText>
          </Input>
        )}
      />
      <ErrorMessage message={errors.voterId?.message} />

      {showPassport && (
        <>
          <Controller
            name="passport"
            control={control}
            render={({ field }) => (
              <Input>
                <Input.Label htmlFor="passport" required>
                  Passport Number
                </Input.Label>
                <Input.Field
                  id="passport"
                  placeholder="A1234567"
                  invalid={!!errors.passport}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
                <Input.HelpText>
                  Required for home loans above ₹50 lakh — 1 letter + 7 digits
                </Input.HelpText>
              </Input>
            )}
          />
          <ErrorMessage message={errors.passport?.message} />
        </>
      )}

      {panVerification.isVerified && (
        <p className="text-xs text-lendswift-accent">
          ✓ PAN verified — PAN card upload will be optional in Step 7
        </p>
      )}
    </div>
  );
}
