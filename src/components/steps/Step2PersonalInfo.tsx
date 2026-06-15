import { Controller } from 'react-hook-form';
import { STEP_THEMES } from '@/constants';
import { useLoanForm } from '@/hooks/useLoanForm';
import { Input } from '@/components/common/Input';
import { RadioGroup } from '@/components/common/RadioGroup';
import { NativeSelect } from '@/components/common/Select';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { GENDER_OPTIONS, MARITAL_OPTIONS } from '@/types/form';

export default function Step2PersonalInfo() {
  const theme = STEP_THEMES[1];
  const {
    control,
    formState: { errors },
  } = useLoanForm();

  const today = new Date();
  const maxDob = new Date(today.getFullYear() - 21, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];
  const minDob = new Date(today.getFullYear() - 65, today.getMonth(), today.getDate())
    .toISOString()
    .split('T')[0];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{theme.label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your personal details as per PAN records.
        </p>
      </div>

      <Controller
        name="fullName"
        control={control}
        render={({ field }) => (
          <Input>
            <Input.Label htmlFor="fullName" required>
              Full Name (as per PAN)
            </Input.Label>
            <Input.Field
              id="fullName"
              autoComplete="name"
              invalid={!!errors.fullName}
              placeholder="Enter full legal name"
              {...field}
            />
          </Input>
        )}
      />
      <ErrorMessage message={errors.fullName?.message} />

      <Controller
        name="dateOfBirth"
        control={control}
        render={({ field }) => (
          <Input>
            <Input.Label htmlFor="dateOfBirth" required>
              Date of Birth
            </Input.Label>
            <Input.Field
              id="dateOfBirth"
              type="date"
              autoComplete="bday"
              min={minDob}
              max={maxDob}
              invalid={!!errors.dateOfBirth}
              {...field}
            />
            <Input.HelpText>Age must be between 21 and 65 years</Input.HelpText>
          </Input>
        )}
      />
      <ErrorMessage message={errors.dateOfBirth?.message} />

      <Controller
        name="gender"
        control={control}
        render={({ field }) => (
          <div className="space-y-1">
            <RadioGroup
              label="Gender"
              options={[...GENDER_OPTIONS]}
              value={field.value}
              onValueChange={field.onChange}
              layout="horizontal"
              invalid={!!errors.gender}
            />
            <ErrorMessage message={errors.gender?.message} />
          </div>
        )}
      />

      <Controller
        name="maritalStatus"
        control={control}
        render={({ field }) => (
          <div>
            <NativeSelect
              label="Marital Status"
              required
              options={[...MARITAL_OPTIONS]}
              invalid={!!errors.maritalStatus}
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
              onBlur={field.onBlur}
            />
            <ErrorMessage message={errors.maritalStatus?.message} />
          </div>
        )}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Controller
            name="fatherName"
            control={control}
            render={({ field }) => (
              <Input>
                <Input.Label htmlFor="fatherName" required>
                  Father&apos;s Name
                </Input.Label>
                <Input.Field
                  id="fatherName"
                  autoComplete="off"
                  invalid={!!errors.fatherName}
                  {...field}
                />
              </Input>
            )}
          />
          <ErrorMessage message={errors.fatherName?.message} />
        </div>
        <div>
          <Controller
            name="motherName"
            control={control}
            render={({ field }) => (
              <Input>
                <Input.Label htmlFor="motherName" required>
                  Mother&apos;s Name
                </Input.Label>
                <Input.Field
                  id="motherName"
                  autoComplete="off"
                  invalid={!!errors.motherName}
                  {...field}
                />
              </Input>
            )}
          />
          <ErrorMessage message={errors.motherName?.message} />
        </div>
      </div>

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <Input>
            <Input.Label htmlFor="email" required>
              Email Address
            </Input.Label>
            <Input.Field
              id="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              invalid={!!errors.email}
              placeholder="you@example.com"
              {...field}
            />
          </Input>
        )}
      />
      <ErrorMessage message={errors.email?.message} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Controller
            name="mobile"
            control={control}
            render={({ field }) => (
              <Input>
                <Input.Label htmlFor="mobile" required>
                  Mobile Number
                </Input.Label>
                <Input.Field
                  id="mobile"
                  type="tel"
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="9876543210"
                  invalid={!!errors.mobile}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </Input>
            )}
          />
          <ErrorMessage message={errors.mobile?.message} />
        </div>
        <div>
          <Controller
            name="alternateMobile"
            control={control}
            render={({ field }) => (
              <Input>
                <Input.Label htmlFor="alternateMobile">Alternate Mobile</Input.Label>
                <Input.Field
                  id="alternateMobile"
                  type="tel"
                  autoComplete="tel"
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="Optional"
                  invalid={!!errors.alternateMobile}
                  {...field}
                  onChange={(e) => field.onChange(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </Input>
            )}
          />
          <ErrorMessage message={errors.alternateMobile?.message} />
        </div>
      </div>
    </div>
  );
}
