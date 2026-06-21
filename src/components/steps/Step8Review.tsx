import { Controller } from 'react-hook-form';
import { Pencil, Lock, AlertTriangle } from 'lucide-react';
import { CountUp } from '@/components/animations/MotionPrimitives';
import { STEP_THEMES, type LoanType } from '@/constants';
import { useLoanForm } from '@/hooks/useLoanForm';
import { useWizard } from '@/components/wizard/WizardContext';
import { Checkbox } from '@/components/common/Checkbox';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { computeEmiAffordability } from '@/utils/crossStepSync';
import { calculateEmi } from '@/utils/emiCalculator';
import { getApplicantMonthlyIncome } from '@/utils/employmentHelpers';
import { getRequiredDocuments } from '@/utils/documentRequirements';
import { needsCoApplicant } from '@/utils/stepVisibility';
import { maskPii } from '@/utils/validators';
import { formatINR } from '@/lib/utils';
import {
  LOAN_PURPOSES,
  MARITAL_OPTIONS,
  GENDER_OPTIONS,
  EMPLOYMENT_OPTIONS,
  CO_APPLICANT_RELATIONSHIPS,
} from '@/types/form';
import { cn } from '@/lib/utils';

const LOAN_TYPE_LABELS: Record<LoanType, string> = {
  personal: 'Personal Loan',
  home: 'Home Loan',
  business: 'Business Loan',
};

function ReviewSection({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: number;
  onEdit: (step: number) => void;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <button
          type="button"
          onClick={() => onEdit(step)}
          className="inline-flex min-h-[36px] items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-lendswift-primary hover:bg-lendswift-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
          Edit
        </button>
      </div>
      <dl className="grid gap-2 text-sm">{children}</dl>
    </section>
  );
}

function ReviewRow({ label, value }: { label: string; value: React.ReactNode }) {
  if (value === '' || value === null || value === undefined) return null;
  return (
    <div className="grid grid-cols-[minmax(0,38%)] gap-1 sm:grid-cols-[140px_1fr] sm:gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-foreground break-words">{value}</dd>
    </div>
  );
}

function labelFor(
  options: readonly { value: string; label: string }[],
  value: string,
): string {
  return options.find((o) => o.value === value)?.label ?? value;
}

export default function Step8Review() {
  const theme = STEP_THEMES[7];
  const { goToStep } = useWizard();
  const {
    control,
    watch,
    formState: { errors },
  } = useLoanForm();

  const data = watch();
  const loanType = data.loanType as LoanType;
  const amount = typeof data.loanAmount === 'number' ? data.loanAmount : 0;
  const tenure = typeof data.loanTenure === 'number' ? data.loanTenure : 0;
  const showCoApplicant = needsCoApplicant(data.loanType, data.loanAmount);

  const emiResult = loanType && amount && tenure ? calculateEmi(amount, tenure, loanType) : null;
  const monthlyIncome = getApplicantMonthlyIncome(data);
  const coIncome = typeof data.coApplicantIncome === 'number' ? data.coApplicantIncome : 0;
  const affordability = computeEmiAffordability(data);
  const rentDeduction =
    data.residenceType === 'rented' && typeof data.rentAmount === 'number' ? data.rentAmount : 0;

  const purposeLabel =
    loanType && data.loanPurpose
      ? LOAN_PURPOSES[loanType]?.find((p) => p.value === data.loanPurpose)?.label ?? data.loanPurpose
      : '';

  const requiredDocs = getRequiredDocuments(data);
  const uploadedRequired = requiredDocs.filter((r) => r.required && data.documents[r.key]).length;
  const totalRequired = requiredDocs.filter((r) => r.required).length;

  const residenceLabels: Record<string, string> = {
    owned: 'Owned',
    rented: 'Rented',
    company: 'Company Provided',
    family: 'Family',
  };

  return (
    <div className="space-y-6 pb-4">
      <div>
        <h2 className="text-xl font-semibold">{theme.label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Review your application and provide consent before submitting
        </p>
      </div>

      {emiResult && (
        <div className="rounded-xl bg-gradient-to-br from-lendswift-primary to-lendswift-primary-light p-6 text-white">
          <p className="text-sm font-medium opacity-90">Pre-Approval Summary</p>
          <p className="mt-3 text-xs uppercase tracking-wide opacity-75">Estimated EMI</p>
          <CountUp value={emiResult.emi} className="text-3xl font-bold" prefix="₹" />
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs opacity-90">
            <span>Loan Amount: {formatINR(amount)}</span>
            <span>Tenure: {tenure} months</span>
            <span>Interest Rate: {emiResult.annualRate}% p.a.</span>
            <span>Processing Fee: {formatINR(emiResult.processingFee)}</span>
            <span className="col-span-2">
              Total Cost of Borrowing: {formatINR(emiResult.totalCost)}
            </span>
            {affordability.effectiveIncome > 0 && (
              <span className="col-span-2">
                EMI / Effective Income: {affordability.ratio.toFixed(1)}%
                {rentDeduction > 0 && ` (after ₹${rentDeduction.toLocaleString('en-IN')} rent)`}
                {!affordability.withinLimit && ' — exceeds 50% guideline'}
              </span>
            )}
          </div>
        </div>
      )}

      {emiResult && !affordability.withinLimit && (
        <div
          role="alert"
          className="flex gap-3 rounded-xl border border-lendswift-warning/40 bg-lendswift-warning/10 p-4 text-sm text-foreground"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 text-lendswift-warning" aria-hidden="true" />
          <div>
            <p className="font-medium">EMI affordability warning</p>
            <p className="mt-1 text-muted-foreground">
              Your estimated EMI is {affordability.ratio.toFixed(1)}% of effective monthly income
              (₹{monthlyIncome.toLocaleString('en-IN')}
              {coIncome > 0 ? ` + ₹${coIncome.toLocaleString('en-IN')} co-applicant` : ''}
              {rentDeduction > 0 ? ` − ₹${rentDeduction.toLocaleString('en-IN')} rent` : ''}
              ), which exceeds the recommended 50% limit. Additional consent is required to submit.
            </p>
          </div>
        </div>
      )}

      <ReviewSection title="Loan Details" step={1} onEdit={goToStep}>
        <ReviewRow label="Loan Type" value={loanType ? LOAN_TYPE_LABELS[loanType] : ''} />
        <ReviewRow label="Amount" value={amount ? formatINR(amount) : ''} />
        <ReviewRow label="Tenure" value={tenure ? `${tenure} months` : ''} />
        <ReviewRow label="Purpose" value={purposeLabel} />
        {data.referralCode && <ReviewRow label="Referral" value={data.referralCode} />}
      </ReviewSection>

      <ReviewSection title="Personal Information" step={2} onEdit={goToStep}>
        <ReviewRow label="Full Name" value={data.fullName} />
        <ReviewRow
          label="Date of Birth"
          value={data.dateOfBirth ? new Date(data.dateOfBirth).toLocaleDateString('en-IN') : ''}
        />
        <ReviewRow label="Gender" value={data.gender ? labelFor(GENDER_OPTIONS, data.gender) : ''} />
        <ReviewRow
          label="Marital Status"
          value={data.maritalStatus ? labelFor(MARITAL_OPTIONS, data.maritalStatus) : ''}
        />
        <ReviewRow label="Email" value={data.email} />
        <ReviewRow label="Mobile" value={data.mobile} />
      </ReviewSection>

      <ReviewSection title="KYC" step={3} onEdit={goToStep}>
        <ReviewRow label="PAN" value={data.pan ? maskPii(data.pan, 4) : ''} />
        <ReviewRow label="Aadhaar" value={data.aadhaar ? maskPii(data.aadhaar, 4) : ''} />
        <ReviewRow label="PAN Verified" value={data.panVerified ? 'Yes' : 'No'} />
        <ReviewRow label="Aadhaar Verified" value={data.aadhaarVerified ? 'Yes' : 'No'} />
      </ReviewSection>

      <ReviewSection title="Address" step={4} onEdit={goToStep}>
        <ReviewRow label="Current" value={[data.currentAddressLine1, data.city, data.state, data.pinCode].filter(Boolean).join(', ')} />
        <ReviewRow
          label="Residence"
          value={data.residenceType ? residenceLabels[data.residenceType] : ''}
        />
        {data.residenceType === 'rented' && typeof data.rentAmount === 'number' && (
          <ReviewRow label="Rent" value={formatINR(data.rentAmount)} />
        )}
      </ReviewSection>

      <ReviewSection title="Employment & Income" step={5} onEdit={goToStep}>
        <ReviewRow
          label="Type"
          value={data.employmentType ? labelFor(EMPLOYMENT_OPTIONS, data.employmentType) : ''}
        />
        {data.employmentType === 'salaried' && (
          <>
            <ReviewRow label="Company" value={data.companyName} />
            <ReviewRow
              label="Salary"
              value={typeof data.monthlySalary === 'number' ? formatINR(data.monthlySalary) : ''}
            />
          </>
        )}
        {(data.employmentType === 'self_employed' || data.employmentType === 'business_owner') && (
          <>
            <ReviewRow label="Business" value={data.businessName} />
            <ReviewRow
              label="Income"
              value={typeof data.monthlyIncome === 'number' ? formatINR(data.monthlyIncome) : ''}
            />
          </>
        )}
      </ReviewSection>

      {showCoApplicant && (
        <ReviewSection title="Co-Applicant" step={6} onEdit={goToStep}>
          <ReviewRow label="Name" value={data.coApplicantName} />
          <ReviewRow
            label="Relationship"
            value={
              data.coApplicantRelationship
                ? labelFor(CO_APPLICANT_RELATIONSHIPS, data.coApplicantRelationship)
                : ''
            }
          />
          <ReviewRow
            label="Income"
            value={typeof data.coApplicantIncome === 'number' ? formatINR(data.coApplicantIncome) : ''}
          />
        </ReviewSection>
      )}

      <ReviewSection title="Documents" step={7} onEdit={goToStep}>
        <ReviewRow label="Uploaded" value={`${uploadedRequired} / ${totalRequired} required documents`} />
        <ReviewRow label="E-Signature" value={data.eSignaturePreview ? 'Captured & encrypted' : 'Missing'} />
      </ReviewSection>

      {data.eSignaturePreview && (
        <div className="rounded-xl border border-border p-4">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium">
            <Lock className="h-4 w-4 text-lendswift-accent" aria-hidden="true" />
            E-Signature Preview
          </div>
          <img
            src={data.eSignaturePreview}
            alt="Your e-signature"
            className="mx-auto max-h-20 object-contain"
          />
          {data.eSignatureSavedAt && (
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Captured {new Date(data.eSignatureSavedAt).toLocaleString('en-IN')}
            </p>
          )}
        </div>
      )}

      <div className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold">Declarations & Consent</h3>
        <p className="text-xs text-muted-foreground">
          All four consents are required to submit your application.
        </p>

        <Controller
          name="consentAccuracy"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="consentAccuracy"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              label="I confirm all information provided is accurate and complete"
            />
          )}
        />
        <ErrorMessage message={errors.consentAccuracy?.message} />

        <Controller
          name="consentCreditCheck"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="consentCreditCheck"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              label="I authorise LendSwift to check my credit score via CIBIL/Equifax"
              description="Required for loan eligibility assessment under RBI guidelines"
            />
          )}
        />
        <ErrorMessage message={errors.consentCreditCheck?.message} />

        <Controller
          name="consentTerms"
          control={control}
          render={({ field }) => (
            <div className="space-y-1">
              <Checkbox
                id="consentTerms"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
                label="I agree to the Terms and Conditions"
              />
              <a
                href="/terms-and-conditions.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-8 text-xs text-lendswift-primary hover:underline"
              >
                View Terms & Conditions (PDF)
              </a>
            </div>
          )}
        />
        <ErrorMessage message={errors.consentTerms?.message} />

        <Controller
          name="consentCommunications"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="consentCommunications"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked === true)}
              label="I consent to receive communications regarding this application"
              description="SMS, email, and phone updates about your application status"
            />
          )}
        />
        <ErrorMessage message={errors.consentCommunications?.message} />

        {!affordability.withinLimit && emiResult && (
          <>
            <Controller
              name="consentEmiAffordability"
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="consentEmiAffordability"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  label="I acknowledge that my EMI exceeds 50% of effective monthly income"
                  description="Required when EMI/income ratio exceeds the recommended affordability limit"
                />
              )}
            />
            <ErrorMessage message={errors.consentEmiAffordability?.message} />
          </>
        )}

        {(errors.eSignatureEncrypted || errors.documents) && (
          <div
            role="alert"
            className={cn(
              'rounded-lg border border-lendswift-error/30 bg-lendswift-error/5 p-3 text-sm text-lendswift-error',
            )}
          >
            {errors.eSignatureEncrypted?.message && <p>{errors.eSignatureEncrypted.message}</p>}
            {typeof errors.documents === 'object' &&
              errors.documents &&
              Object.values(errors.documents).map((err, i) => {
                const msg =
                  err && typeof err === 'object' && 'message' in err
                    ? String((err as { message?: string }).message)
                    : '';
                return msg ? <p key={i}>{msg}</p> : null;
              })}
          </div>
        )}
      </div>
    </div>
  );
}
