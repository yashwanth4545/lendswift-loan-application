import { z } from 'zod';
import { LOAN_LIMITS } from '@/constants';
import type { LoanFormData } from '@/types/form';
import { getMaxTenureByAge } from '@/utils/emiCalculator';
import { computeEmiAffordability } from '@/utils/crossStepSync';
import { getRequiredDocuments } from '@/utils/documentRequirements';
import type { DocumentKey } from '@/utils/documentRequirements';
import { validatePanEntityType, validateAadhaarForSimulation, validateGst } from '@/utils/validators';
import pinCodeData from '@/utils/pinCodeData.json';

const nameRegex = /^[a-zA-Z.\s]{2,100}$/;

function getAge(dob: string): number | null {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }
  return age;
}

export function createStep1Schema(formData: Partial<LoanFormData>) {
  const loanType = formData.loanType;

  return z
    .object({
      loanType: z.preprocess(
        (val) => (val === '' || val == null ? undefined : val),
        z.enum(['personal', 'home', 'business'], {
          required_error: 'Please select a loan type',
          invalid_type_error: 'Please select a loan type',
        }),
      ),
      loanAmount: z
        .number({ invalid_type_error: 'Enter a valid loan amount' })
        .min(50_000, 'Minimum loan amount is ₹50,000'),
      loanTenure: z
        .number({ invalid_type_error: 'Select loan tenure' })
        .positive('Select loan tenure'),
      loanPurpose: z.string().min(1, 'Select loan purpose'),
      referralCode: z.string().refine(
        (val) => val === '' || /^[a-zA-Z0-9]{6,10}$/.test(val),
        'Referral code must be 6–10 alphanumeric characters',
      ),
    })
    .superRefine((data, ctx) => {
      if (!loanType && data.loanType) {
        // use data.loanType
      }
      const type = data.loanType;
      const limits = LOAN_LIMITS[type];

      if (data.loanAmount > limits.max) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Maximum amount for ${type} loan is ₹${limits.max.toLocaleString('en-IN')}`,
          path: ['loanAmount'],
        });
      }

      if (data.loanTenure < limits.tenureMin || data.loanTenure > limits.tenureMax) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Tenure must be between ${limits.tenureMin} and ${limits.tenureMax} months`,
          path: ['loanTenure'],
        });
      }

      const age = getAge(formData.dateOfBirth ?? '');
      if (age !== null) {
        const maxTenure = getMaxTenureByAge(age);
        if (data.loanTenure > maxTenure) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Age + tenure cannot exceed 65 years. Max tenure for your age: ${maxTenure} months`,
            path: ['loanTenure'],
          });
        }
      }
    });
}

export function createStep2Schema(formData: Partial<LoanFormData>) {
  return z
    .object({
      fullName: z
        .string()
        .min(2, 'Name must be at least 2 characters')
        .max(100, 'Name must be under 100 characters')
        .regex(nameRegex, 'Name can only contain letters, spaces, and periods'),
      dateOfBirth: z.string().min(1, 'Date of birth is required'),
      gender: z.enum(['male', 'female', 'other'], { required_error: 'Select gender' }),
      maritalStatus: z.enum(['single', 'married', 'divorced', 'widowed'], {
        required_error: 'Select marital status',
      }),
      fatherName: z
        .string()
        .min(2, "Father's name is required")
        .regex(nameRegex, 'Invalid characters in name'),
      motherName: z
        .string()
        .min(2, "Mother's name is required")
        .regex(nameRegex, 'Invalid characters in name'),
      email: z.string().email('Enter a valid email address'),
      mobile: z
        .string()
        .regex(/^[6-9]\d{9}$/, 'Mobile must be 10 digits starting with 6–9'),
      alternateMobile: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      const age = getAge(data.dateOfBirth);
      if (age === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a valid date of birth',
          path: ['dateOfBirth'],
        });
        return;
      }
      if (age < 21) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'You must be at least 21 years old to apply',
          path: ['dateOfBirth'],
        });
      }
      if (age > 65) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Maximum age for loan application is 65 years',
          path: ['dateOfBirth'],
        });
      }

      if (data.alternateMobile && data.alternateMobile === data.mobile) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Alternate mobile must differ from primary mobile',
          path: ['alternateMobile'],
        });
      }

      if (data.alternateMobile && !/^[6-9]\d{9}$/.test(data.alternateMobile)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Alternate mobile must be 10 digits starting with 6–9',
          path: ['alternateMobile'],
        });
      }

      if (formData.loanTenure && age !== null) {
        const maxTenure = getMaxTenureByAge(age);
        if (Number(formData.loanTenure) > maxTenure) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Your selected tenure (${formData.loanTenure} months) exceeds max allowed (${maxTenure} months) for age ${age}`,
            path: ['dateOfBirth'],
          });
        }
      }
    });
}

function getPanAllowedEntities(loanType: string | undefined): string[] {
  if (loanType === 'business') return ['P', 'C', 'F'];
  return ['P'];
}

export function createStep3Schema(formData: Partial<LoanFormData>) {
  const showPassport =
    formData.loanType === 'home' &&
    typeof formData.loanAmount === 'number' &&
    formData.loanAmount > 50_00_000;

  return z
    .object({
      pan: z.string().min(1, 'PAN number is required'),
      panVerified: z.boolean(),
      aadhaar: z.string().min(1, 'Aadhaar number is required'),
      aadhaarVerified: z.boolean(),
      aadhaarConsent: z.literal(true, {
        errorMap: () => ({ message: 'You must consent to Aadhaar verification' }),
      }),
      voterId: z.string(),
      passport: z.string(),
    })
    .superRefine((data, ctx) => {
      const panCheck = validatePanEntityType(data.pan, getPanAllowedEntities(formData.loanType));
      if (!panCheck.valid) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: panCheck.message!, path: ['pan'] });
      } else if (!data.panVerified) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'PAN must be verified before proceeding',
          path: ['pan'],
        });
      }

      const aadhaarCheck = validateAadhaarForSimulation(data.aadhaar);
      if (!aadhaarCheck.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: aadhaarCheck.message ?? 'Invalid Aadhaar number',
          path: ['aadhaar'],
        });
      } else if (!data.aadhaarVerified) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Aadhaar must be verified before proceeding',
          path: ['aadhaar'],
        });
      }

      if (data.voterId && !/^[A-Z]{3}\d{7}$/i.test(data.voterId)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Voter ID must be 3 letters followed by 7 digits',
          path: ['voterId'],
        });
      }

      if (showPassport && !data.passport) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Passport is required for home loans above ₹50 lakh',
          path: ['passport'],
        });
      }

      if (data.passport && !/^[A-Z]\d{7}$/i.test(data.passport)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Passport must be 1 letter followed by 7 digits',
          path: ['passport'],
        });
      }
    });
}

export function createStep4Schema(_formData: Partial<LoanFormData>) {
  return z
    .object({
      currentAddressLine1: z
        .string()
        .min(5, 'Address must be at least 5 characters')
        .max(200, 'Address must be under 200 characters'),
      currentAddressLine2: z.string(),
      pinCode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
      city: z.string().min(1, 'City is required'),
      state: z.string().min(1, 'State is required'),
      residenceType: z.enum(['owned', 'rented', 'company', 'family'], {
        required_error: 'Select residence type',
      }),
      rentAmount: z.union([z.number(), z.literal('')]),
      yearsAtAddress: z
        .number({ invalid_type_error: 'Enter years at current address' })
        .min(0, 'Minimum 0 years')
        .max(50, 'Maximum 50 years'),
      sameAsPermanent: z.boolean(),
      permanentAddressLine1: z.string(),
      permanentAddressLine2: z.string(),
      permanentPinCode: z.string(),
      permanentCity: z.string(),
      permanentState: z.string(),
    })
    .superRefine((data, ctx) => {
      const pinRecord = pinCodeData[data.pinCode as keyof typeof pinCodeData];
      if (!pinRecord) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'PIN code not found in our database',
          path: ['pinCode'],
        });
      } else if (
        data.state &&
        pinRecord.state.toLowerCase() !== data.state.toLowerCase()
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `State "${data.state}" does not match PIN code (expected ${pinRecord.state})`,
          path: ['state'],
        });
      }

      if (data.residenceType === 'rented') {
        if (data.rentAmount === '' || (typeof data.rentAmount === 'number' && data.rentAmount < 1)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Monthly rent amount is required for rented residence',
            path: ['rentAmount'],
          });
        }
      }

      if (!data.sameAsPermanent) {
        if (!data.permanentAddressLine1 || data.permanentAddressLine1.length < 5) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Permanent address is required',
            path: ['permanentAddressLine1'],
          });
        }
        if (!/^\d{6}$/.test(data.permanentPinCode)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Permanent PIN code must be 6 digits',
            path: ['permanentPinCode'],
          });
        }
        if (!data.permanentCity) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Permanent city is required',
            path: ['permanentCity'],
          });
        }
        if (!data.permanentState) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Permanent state is required',
            path: ['permanentState'],
          });
        }
      }
    });
}

export function createStep5Schema(formData: Partial<LoanFormData>) {
  return z
    .object({
      employmentType: z.enum(['salaried', 'self_employed', 'business_owner'], {
        required_error: 'Select your employment type',
      }),
      companyName: z.string(),
      designation: z.string(),
      monthlySalary: z.union([z.number(), z.literal('')]),
      yearsOfExperience: z.union([z.number(), z.literal('')]),
      businessName: z.string(),
      businessType: z.string(),
      annualTurnover: z.union([z.number(), z.literal('')]),
      yearsInBusiness: z.union([z.number(), z.literal('')]),
      monthlyIncome: z.union([z.number(), z.literal('')]),
      gstNumber: z.string(),
      officeAddressLine1: z.string(),
      officeAddressLine2: z.string(),
      officePinCode: z.string(),
      officeCity: z.string(),
      officeState: z.string(),
    })
    .superRefine((data, ctx) => {
      if (formData.loanType === 'business' && data.employmentType === 'salaried') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Business loan requires Business Owner or Self-Employed employment',
          path: ['employmentType'],
        });
      }

      if (data.employmentType === 'salaried') {
        if (!data.companyName.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Company name is required', path: ['companyName'] });
        }
        if (!data.designation.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Designation is required', path: ['designation'] });
        }
        if (data.monthlySalary === '' || data.monthlySalary < 15_000) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Monthly net salary must be at least ₹15,000',
            path: ['monthlySalary'],
          });
        }
        if (data.yearsOfExperience === '' || data.yearsOfExperience < 0 || data.yearsOfExperience > 50) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Years of experience must be between 0 and 50',
            path: ['yearsOfExperience'],
          });
        }
        return;
      }

      const isBusinessOwner = data.employmentType === 'business_owner';

      if (!data.businessName.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Business name is required', path: ['businessName'] });
      }
      if (!data.businessType) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Select business type', path: ['businessType'] });
      }
      if (data.annualTurnover === '' || data.annualTurnover < 3_00_000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Annual turnover must be at least ₹3,00,000',
          path: ['annualTurnover'],
        });
      }
      if (data.yearsInBusiness === '' || data.yearsInBusiness < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Minimum 2 years in business required',
          path: ['yearsInBusiness'],
        });
      }
      if (data.monthlyIncome === '' || data.monthlyIncome < 15_000) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Monthly income must be at least ₹15,000',
          path: ['monthlyIncome'],
        });
      }
      if (data.yearsOfExperience === '' || data.yearsOfExperience < 0 || data.yearsOfExperience > 50) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Years of experience must be between 0 and 50',
          path: ['yearsOfExperience'],
        });
      }
      if (!data.officeAddressLine1.trim() || data.officeAddressLine1.length < 5) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Office/business address is required',
          path: ['officeAddressLine1'],
        });
      }
      if (!/^\d{6}$/.test(data.officePinCode)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Office PIN code must be 6 digits',
          path: ['officePinCode'],
        });
      }
      if (!data.officeCity.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Office city is required', path: ['officeCity'] });
      }
      if (!data.officeState.trim()) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Office state is required', path: ['officeState'] });
      }

      if (isBusinessOwner) {
        if (!data.gstNumber.trim()) {
          ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'GST number is required', path: ['gstNumber'] });
        } else if (!validateGst(data.gstNumber)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Invalid GST format (15 characters: 22AAAAA0000A1Z5)',
            path: ['gstNumber'],
          });
        }
      }
    });
}

export function createStep6Schema(formData: Partial<LoanFormData>) {
  return z
    .object({
      coApplicantName: z
        .string()
        .min(2, 'Co-applicant name is required')
        .max(100, 'Name too long'),
      coApplicantRelationship: z.string().min(1, 'Select relationship'),
      coApplicantPan: z.string().min(1, 'Co-applicant PAN is required'),
      coApplicantPanVerified: z.boolean(),
      coApplicantIncome: z
        .number({ invalid_type_error: 'Enter co-applicant income' })
        .min(1, 'Co-applicant income is required'),
      coApplicantConsent: z.literal(true, {
        errorMap: () => ({ message: 'Co-applicant consent is required' }),
      }),
    })
    .superRefine((data, ctx) => {
      const panCheck = validatePanEntityType(
        data.coApplicantPan,
        getPanAllowedEntities(formData.loanType),
      );
      if (!panCheck.valid) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: panCheck.message!,
          path: ['coApplicantPan'],
        });
      } else if (!data.coApplicantPanVerified) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Co-applicant PAN must be verified',
          path: ['coApplicantPan'],
        });
      }
    });
}

export function createStep7Schema(formData: Partial<LoanFormData>) {
  return z
    .object({
      eSignatureEncrypted: z.string().min(1, 'E-signature must be saved and encrypted'),
      eSignaturePreview: z.string().min(1, 'E-signature preview missing'),
      eSignatureSavedAt: z.string().min(1),
      signatureSessionId: z.string().min(1),
    })
    .superRefine((_data, ctx) => {
      const reqs = getRequiredDocuments(formData);
      const docs = (formData.documents ?? {}) as Partial<Record<DocumentKey, unknown>>;

      for (const req of reqs) {
        if (req.required && !docs[req.key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${req.label} is required`,
            path: ['documents', req.key],
          });
        }
      }
    });
}

export function createStep8Schema(formData: Partial<LoanFormData>) {
  return z
    .object({
      consentAccuracy: z.literal(true, {
        errorMap: () => ({ message: 'Please confirm all information is accurate' }),
      }),
      consentCreditCheck: z.literal(true, {
        errorMap: () => ({ message: 'Credit score check authorisation is required' }),
      }),
      consentTerms: z.literal(true, {
        errorMap: () => ({ message: 'You must agree to the Terms and Conditions' }),
      }),
      consentCommunications: z.literal(true, {
        errorMap: () => ({ message: 'Communication consent is required' }),
      }),
      consentEmiAffordability: z.boolean(),
    })
    .superRefine((_data, ctx) => {
      const affordability = computeEmiAffordability(formData);
      if (!affordability.withinLimit && !_data.consentEmiAffordability) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'EMI exceeds 50% of effective income — acknowledge the affordability warning to proceed',
          path: ['consentEmiAffordability'],
        });
      }

      const reqs = getRequiredDocuments(formData);
      const docs = (formData.documents ?? {}) as Partial<Record<DocumentKey, unknown>>;

      for (const req of reqs) {
        if (req.required && !docs[req.key]) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `${req.label} is required — upload in Documents step`,
            path: ['documents', req.key],
          });
        }
      }

      if (!formData.eSignatureEncrypted || !formData.eSignaturePreview) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'E-signature is required — complete in Documents step',
          path: ['eSignatureEncrypted'],
        });
      }
    });
}

export function getStepSchema(step: number, formData: Partial<LoanFormData>) {
  switch (step) {
    case 1:
      return createStep1Schema(formData);
    case 2:
      return createStep2Schema(formData);
    case 3:
      return createStep3Schema(formData);
    case 4:
      return createStep4Schema(formData);
    case 5:
      return createStep5Schema(formData);
    case 6:
      return createStep6Schema(formData);
    case 7:
      return createStep7Schema(formData);
    case 8:
      return createStep8Schema(formData);
    default:
      return z.object({});
  }
}
