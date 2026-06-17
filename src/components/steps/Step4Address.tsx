import { Controller } from 'react-hook-form';
import { useCallback } from 'react';
import { Loader2 } from 'lucide-react';
import { STEP_THEMES } from '@/constants';
import { useLoanForm } from '@/hooks/useLoanForm';
import { usePinCodeLookup } from '@/hooks/usePinCodeLookup';
import { Input } from '@/components/common/Input';
import { NativeSelect } from '@/components/common/Select';
import { CurrencyInput } from '@/components/common/CurrencyInput';
import { Checkbox } from '@/components/common/Checkbox';
import { ErrorMessage } from '@/components/common/ErrorMessage';

const RESIDENCE_OPTIONS = [
  { value: 'owned', label: 'Owned' },
  { value: 'rented', label: 'Rented' },
  { value: 'company', label: 'Company Provided' },
  { value: 'family', label: 'Family' },
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chandigarh',
  'Chhattisgarh', 'Delhi', 'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh',
  'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra',
  'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Andaman and Nicobar Islands', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
].map((s) => ({ value: s, label: s }));

export default function Step4Address() {
  const theme = STEP_THEMES[3];
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useLoanForm();

  const { lookup, isLoading, error: pinError } = usePinCodeLookup();

  const residenceType = watch('residenceType');
  const sameAsPermanent = watch('sameAsPermanent');
  const yearsAtAddress = watch('yearsAtAddress');

  const handlePinLookup = useCallback(
    async (pin: string) => {
      if (pin.length !== 6) return;
      const record = await lookup(pin);
      if (record) {
        setValue('city', record.city, { shouldDirty: true });
        setValue('state', record.state, { shouldDirty: true });
        setValue('postOffice', record.postOffice, { shouldDirty: true });
      }
    },
    [lookup, setValue],
  );

  const copyToPermanent = useCallback(() => {
    const values = watch();
    setValue('permanentAddressLine1', values.currentAddressLine1);
    setValue('permanentAddressLine2', values.currentAddressLine2);
    setValue('permanentPinCode', values.pinCode);
    setValue('permanentCity', values.city);
    setValue('permanentState', values.state);
  }, [watch, setValue]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground">{theme.label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Enter your current address. PIN code will auto-fill city and state.
        </p>
      </div>

      <Controller
        name="currentAddressLine1"
        control={control}
        render={({ field }) => (
          <Input>
            <Input.Label htmlFor="currentAddressLine1" required>
              Current Address Line 1
            </Input.Label>
            <Input.Field
              id="currentAddressLine1"
              autoComplete="address-line1"
              invalid={!!errors.currentAddressLine1}
              placeholder="House/Flat no., Building, Street"
              {...field}
            />
          </Input>
        )}
      />
      <ErrorMessage message={errors.currentAddressLine1?.message} />

      <Controller
        name="currentAddressLine2"
        control={control}
        render={({ field }) => (
          <Input>
            <Input.Label htmlFor="currentAddressLine2">Address Line 2</Input.Label>
            <Input.Field
              id="currentAddressLine2"
              autoComplete="address-line2"
              placeholder="Landmark, Area (optional)"
              {...field}
            />
          </Input>
        )}
      />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Controller
            name="pinCode"
            control={control}
            render={({ field }) => (
              <Input>
                <Input.Label htmlFor="pinCode" required>
                  PIN Code
                </Input.Label>
                <div className="relative">
                  <Input.Field
                    id="pinCode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    maxLength={6}
                    invalid={!!errors.pinCode || !!pinError}
                    placeholder="110001"
                    {...field}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      field.onChange(val);
                      if (val.length === 6) handlePinLookup(val);
                    }}
                  />
                  {isLoading && (
                    <Loader2
                      className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
                      aria-hidden="true"
                    />
                  )}
                </div>
                <Input.HelpText>Try: 110001, 560001, 400001, 600001</Input.HelpText>
              </Input>
            )}
          />
          <ErrorMessage message={errors.pinCode?.message ?? pinError ?? undefined} />
        </div>

        <Controller
          name="city"
          control={control}
          render={({ field }) => (
            <Input>
              <Input.Label htmlFor="city" required>
                City
              </Input.Label>
              <Input.Field id="city" autoComplete="address-level2" invalid={!!errors.city} {...field} />
            </Input>
          )}
        />
      </div>
      <ErrorMessage message={errors.city?.message} />

      <Controller
        name="state"
        control={control}
        render={({ field }) => (
          <NativeSelect
            label="State"
            required
            options={INDIAN_STATES}
            invalid={!!errors.state}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
          />
        )}
      />
      <ErrorMessage message={errors.state?.message} />

      <Controller
        name="residenceType"
        control={control}
        render={({ field }) => (
          <NativeSelect
            label="Residence Type"
            required
            options={RESIDENCE_OPTIONS}
            invalid={!!errors.residenceType}
            value={field.value}
            onChange={(e) => field.onChange(e.target.value)}
            onBlur={field.onBlur}
          />
        )}
      />
      <ErrorMessage message={errors.residenceType?.message} />

      {residenceType === 'rented' && (
        <Controller
          name="rentAmount"
          control={control}
          render={({ field }) => (
            <CurrencyInput
              label="Monthly Rent"
              name="rentAmount"
              value={field.value}
              onChange={field.onChange}
              onBlur={field.onBlur}
              invalid={!!errors.rentAmount}
              required
              min={1}
              max={500000}
            />
          )}
        />
      )}
      <ErrorMessage message={errors.rentAmount?.message} />

      <Controller
        name="yearsAtAddress"
        control={control}
        render={({ field }) => (
          <Input>
            <Input.Label htmlFor="yearsAtAddress" required>
              Years at Current Address
            </Input.Label>
            <Input.Field
              id="yearsAtAddress"
              type="number"
              min={0}
              max={50}
              invalid={!!errors.yearsAtAddress}
              value={field.value === '' ? '' : field.value}
              onChange={(e) =>
                field.onChange(e.target.value === '' ? '' : Number(e.target.value))
              }
              onBlur={field.onBlur}
            />
          </Input>
        )}
      />
      <ErrorMessage message={errors.yearsAtAddress?.message} />

      {yearsAtAddress !== '' && Number(yearsAtAddress) < 1 && (
        <p className="rounded-lg border border-lendswift-warning/30 bg-lendswift-warning/10 p-3 text-sm text-lendswift-warning">
          You&apos;ve lived here less than 1 year — previous address details may be requested later.
        </p>
      )}

      <Controller
        name="sameAsPermanent"
        control={control}
        render={({ field }) => (
          <Checkbox
            id="sameAsPermanent"
            checked={field.value}
            onCheckedChange={(checked) => {
              const isSame = checked === true;
              field.onChange(isSame);
              if (isSame) copyToPermanent();
            }}
            label="Permanent address is same as current address"
          />
        )}
      />

      {!sameAsPermanent && (
        <div className="space-y-4 rounded-xl border border-border p-4">
          <h3 className="font-medium text-foreground">Permanent Address</h3>

          <Controller
            name="permanentAddressLine1"
            control={control}
            render={({ field }) => (
              <Input>
                <Input.Label htmlFor="permanentAddressLine1" required>
                  Address Line 1
                </Input.Label>
                <Input.Field id="permanentAddressLine1" invalid={!!errors.permanentAddressLine1} {...field} />
              </Input>
            )}
          />
          <ErrorMessage message={errors.permanentAddressLine1?.message} />

          <div className="grid gap-4 sm:grid-cols-3">
            <Controller
              name="permanentPinCode"
              control={control}
              render={({ field }) => (
                <Input>
                  <Input.Label htmlFor="permanentPinCode" required>
                    PIN Code
                  </Input.Label>
                  <Input.Field
                    id="permanentPinCode"
                    maxLength={6}
                    invalid={!!errors.permanentPinCode}
                    {...field}
                    onChange={(e) =>
                      field.onChange(e.target.value.replace(/\D/g, '').slice(0, 6))
                    }
                  />
                </Input>
              )}
            />
            <Controller
              name="permanentCity"
              control={control}
              render={({ field }) => (
                <Input>
                  <Input.Label htmlFor="permanentCity" required>
                    City
                  </Input.Label>
                  <Input.Field id="permanentCity" invalid={!!errors.permanentCity} {...field} />
                </Input>
              )}
            />
            <Controller
              name="permanentState"
              control={control}
              render={({ field }) => (
                <NativeSelect
                  label="State"
                  required
                  options={INDIAN_STATES}
                  invalid={!!errors.permanentState}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                />
              )}
            />
          </div>
          <ErrorMessage message={errors.permanentPinCode?.message ?? errors.permanentCity?.message ?? errors.permanentState?.message} />
        </div>
      )}
    </div>
  );
}
