import { Controller } from 'react-hook-form';
import { useEffect, useRef } from 'react';
import { LazyMotion, domAnimation, m, AnimatePresence } from 'framer-motion';
import { STEP_THEMES } from '@/constants';
import { useLoanForm } from '@/hooks/useLoanForm';
import { RadioGroup } from '@/components/common/RadioGroup';
import { Input } from '@/components/common/Input';
import { NativeSelect } from '@/components/common/Select';
import { CurrencyInput } from '@/components/common/CurrencyInput';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import {
  EMPLOYMENT_OPTIONS,
  BUSINESS_TYPE_OPTIONS,
  COMPANY_SUGGESTIONS,
} from '@/types/form';
import { clearEmploymentFields } from '@/utils/employmentHelpers';
import { cn } from '@/lib/utils';

const INDIAN_STATES = [
  'Andhra Pradesh', 'Delhi', 'Gujarat', 'Karnataka', 'Maharashtra',
  'Tamil Nadu', 'Telangana', 'Uttar Pradesh', 'West Bengal', 'Rajasthan',
  'Haryana', 'Kerala', 'Punjab', 'Madhya Pradesh', 'Odisha',
].map((s) => ({ value: s, label: s }));

function SubFormShell({ children, formKey }: { children: React.ReactNode; formKey: string }) {
  return (
    <LazyMotion features={domAnimation}>
      <AnimatePresence mode="wait">
        <m.div
          key={formKey}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="space-y-5 rounded-xl border border-border/60 bg-secondary/30 p-4"
        >
          {children}
        </m.div>
      </AnimatePresence>
    </LazyMotion>
  );
}

function SalariedForm() {
  const { control, formState: { errors } } = useLoanForm();

  return (
    <SubFormShell formKey="salaried">
      <h3 className="font-medium text-lendswift-primary">Salaried Employment Details</h3>

      <Controller
        name="companyName"
        control={control}
        render={({ field }) => (
          <Input>
            <Input.Label htmlFor="companyName" required>Company Name</Input.Label>
            <Input.Field
              id="companyName"
              list="company-suggestions"
              autoComplete="organization"
              invalid={!!errors.companyName}
              placeholder="Start typing company name..."
              {...field}
            />
            <datalist id="company-suggestions">
              {COMPANY_SUGGESTIONS.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
          </Input>
        )}
      />
      <ErrorMessage message={errors.companyName?.message} />

      <Controller
        name="designation"
        control={control}
        render={({ field }) => (
          <Input>
            <Input.Label htmlFor="designation" required>Designation</Input.Label>
            <Input.Field id="designation" invalid={!!errors.designation} placeholder="e.g. Software Engineer" {...field} />
          </Input>
        )}
      />
      <ErrorMessage message={errors.designation?.message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Controller
          name="monthlySalary"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Monthly Net Salary"
              name="monthlySalary"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={!!errors.monthlySalary}
              required
              min={15000}
              helpText="Used for EMI affordability check"
            />
          )}
        />
        <Controller
          name="yearsOfExperience"
          control={control}
          render={({ field }) => (
            <Input>
              <Input.Label htmlFor="yearsOfExperience" required>Years of Experience</Input.Label>
              <Input.Field
                id="yearsOfExperience"
                type="number"
                min={0}
                max={50}
                invalid={!!errors.yearsOfExperience}
                value={field.value === '' ? '' : field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                onBlur={field.onBlur}
              />
            </Input>
          )}
        />
      </div>
      <ErrorMessage message={errors.monthlySalary?.message ?? errors.yearsOfExperience?.message} />
    </SubFormShell>
  );
}

function SelfEmployedForm({ showGst }: { showGst: boolean }) {
  const { control, formState: { errors } } = useLoanForm();

  return (
    <SubFormShell formKey={showGst ? 'business_owner' : 'self_employed'}>
      <h3 className="font-medium text-lendswift-primary">
        {showGst ? 'Business Owner Details' : 'Self-Employed Details'}
      </h3>

      <Controller
        name="businessName"
        control={control}
        render={({ field }) => (
          <Input>
            <Input.Label htmlFor="businessName" required>Business Name</Input.Label>
            <Input.Field id="businessName" invalid={!!errors.businessName} {...field} />
          </Input>
        )}
      />
      <ErrorMessage message={errors.businessName?.message} />

      <Controller
        name="businessType"
        control={control}
        render={({ field }) => (
          <NativeSelect
            label="Business Type"
            required
            options={BUSINESS_TYPE_OPTIONS}
            invalid={!!errors.businessType}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
          />
        )}
      />
      <ErrorMessage message={errors.businessType?.message} />

      {showGst && (
        <>
          <Controller
            name="gstNumber"
            control={control}
            render={({ field }) => (
              <Input>
                <Input.Label htmlFor="gstNumber" required>GST Number</Input.Label>
                <Input.Field
                  id="gstNumber"
                  invalid={!!errors.gstNumber}
                  placeholder="22AAAAA0000A1Z5"
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                />
                <Input.HelpText>15-character GSTIN format</Input.HelpText>
              </Input>
            )}
          />
          <ErrorMessage message={errors.gstNumber?.message} />
        </>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Controller
          name="annualTurnover"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Annual Turnover"
              name="annualTurnover"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={!!errors.annualTurnover}
              required
              min={300000}
            />
          )}
        />
        <Controller
          name="yearsInBusiness"
          control={control}
          render={({ field }) => (
            <Input>
              <Input.Label htmlFor="yearsInBusiness" required>Years in Business</Input.Label>
              <Input.Field
                id="yearsInBusiness"
                type="number"
                min={2}
                max={50}
                invalid={!!errors.yearsInBusiness}
                value={field.value === '' ? '' : field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                onBlur={field.onBlur}
              />
            </Input>
          )}
        />
      </div>
      <ErrorMessage message={errors.annualTurnover?.message ?? errors.yearsInBusiness?.message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <Controller
          name="monthlyIncome"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Monthly Income"
              name="monthlyIncome"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={!!errors.monthlyIncome}
              required
              min={15000}
              helpText="Net monthly income for EMI check"
            />
          )}
        />
        <Controller
          name="yearsOfExperience"
          control={control}
          render={({ field }) => (
            <Input>
              <Input.Label htmlFor="yearsExpBiz" required>Years of Experience</Input.Label>
              <Input.Field
                id="yearsExpBiz"
                type="number"
                min={0}
                max={50}
                invalid={!!errors.yearsOfExperience}
                value={field.value === '' ? '' : field.value}
                onChange={(e) => field.onChange(e.target.value === '' ? '' : Number(e.target.value))}
                onBlur={field.onBlur}
              />
            </Input>
          )}
        />
      </div>
      <ErrorMessage message={errors.monthlyIncome?.message ?? errors.yearsOfExperience?.message} />

      <div className="space-y-3 border-t border-border pt-4">
        <p className="text-sm font-medium">Office / Business Address</p>
        <Controller
          name="officeAddressLine1"
          control={control}
          render={({ field }) => (
            <Input>
              <Input.Label htmlFor="officeAddressLine1" required>Address Line 1</Input.Label>
              <Input.Field id="officeAddressLine1" invalid={!!errors.officeAddressLine1} {...field} />
            </Input>
          )}
        />
        <ErrorMessage message={errors.officeAddressLine1?.message} />

        <div className="grid gap-4 sm:grid-cols-3">
          <Controller
            name="officePinCode"
            control={control}
            render={({ field }) => (
              <Input>
                <Input.Label htmlFor="officePinCode" required>PIN Code</Input.Label>
                <Input.Field
                  id="officePinCode"
                  maxLength={6}
                  invalid={!!errors.officePinCode}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
                />
              </Input>
            )}
          />
          <Controller
            name="officeCity"
            control={control}
            render={({ field }) => (
              <Input>
                <Input.Label htmlFor="officeCity" required>City</Input.Label>
                <Input.Field id="officeCity" invalid={!!errors.officeCity} {...field} />
              </Input>
            )}
          />
          <Controller
            name="officeState"
            control={control}
            render={({ field }) => (
              <NativeSelect
                label="State"
                required
                options={INDIAN_STATES}
                invalid={!!errors.officeState}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        </div>
        <ErrorMessage message={errors.officePinCode?.message ?? errors.officeCity?.message ?? errors.officeState?.message} />
      </div>
    </SubFormShell>
  );
}

export default function Step5Employment() {
  const theme = STEP_THEMES[4];
  const { control, watch, setValue, formState: { errors } } = useLoanForm();

  const loanType = watch('loanType');
  const employmentType = watch('employmentType');
  const prevEmploymentType = useRef(employmentType);

  useEffect(() => {
    if (!employmentType) return;
    if (prevEmploymentType.current && prevEmploymentType.current !== employmentType) {
      const cleared = clearEmploymentFields(employmentType);
      Object.entries(cleared).forEach(([key, val]) => {
        setValue(key as keyof typeof cleared, val as never, { shouldDirty: true });
      });
    }
    prevEmploymentType.current = employmentType;
  }, [employmentType, setValue]);

  const employmentOptions = EMPLOYMENT_OPTIONS.filter(
    (opt) => !(loanType === 'business' && opt.value === 'salaried'),
  ).map(({ value, label, description }) => ({ value, label, description }));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{theme.label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Tell us about your employment or business. Fields change based on your selection.
        </p>
      </div>

      {loanType === 'business' && (
        <div className="rounded-lg border border-lendswift-warning/30 bg-lendswift-warning/10 px-4 py-3 text-sm text-lendswift-warning">
          Business loans require <strong>Business Owner</strong> or <strong>Self-Employed</strong> status.
        </div>
      )}

      <Controller
        name="employmentType"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <RadioGroup
              label="Employment Type"
              options={employmentOptions}
              value={field.value}
              onValueChange={field.onChange}
              invalid={!!errors.employmentType}
            />
            <ErrorMessage message={errors.employmentType?.message} />
          </div>
        )}
      />

      {employmentType === 'salaried' && <SalariedForm />}

      {(employmentType === 'self_employed' || employmentType === 'business_owner') && (
        <SelfEmployedForm showGst={employmentType === 'business_owner'} />
      )}

      {!employmentType && (
        <p className={cn('text-center text-sm text-muted-foreground py-8')}>
          Select an employment type above to continue
        </p>
      )}
    </div>
  );
}
