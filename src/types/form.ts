import type { LoanType } from '@/constants';
import type { DocumentKey, StoredDocument } from '@/utils/documentRequirements';
import { createEmptyDocuments } from '@/utils/documentRequirements';

export type Gender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface LoanFormData {
  loanType: LoanType | '';
  loanAmount: number | '';
  loanTenure: number | '';
  loanPurpose: string;
  referralCode: string;

  fullName: string;
  dateOfBirth: string;
  gender: Gender | '';
  maritalStatus: MaritalStatus | '';
  fatherName: string;
  motherName: string;
  email: string;
  mobile: string;
  alternateMobile: string;

  pan: string;
  panVerified: boolean;
  aadhaar: string;
  aadhaarVerified: boolean;
  aadhaarConsent: boolean;
  voterId: string;
  passport: string;

  currentAddressLine1: string;
  currentAddressLine2: string;
  pinCode: string;
  city: string;
  state: string;
  postOffice: string;
  residenceType: 'owned' | 'rented' | 'company' | 'family' | '';
  rentAmount: number | '';
  yearsAtAddress: number | '';
  sameAsPermanent: boolean;
  permanentAddressLine1: string;
  permanentAddressLine2: string;
  permanentPinCode: string;
  permanentCity: string;
  permanentState: string;

  employmentType: 'salaried' | 'self_employed' | 'business_owner' | '';
  companyName: string;
  designation: string;
  monthlySalary: number | '';
  yearsOfExperience: number | '';
  businessName: string;
  businessType: string;
  annualTurnover: number | '';
  yearsInBusiness: number | '';
  monthlyIncome: number | '';
  gstNumber: string;
  officeAddressLine1: string;
  officeAddressLine2: string;
  officePinCode: string;
  officeCity: string;
  officeState: string;

  coApplicantName: string;
  coApplicantRelationship: string;
  coApplicantPan: string;
  coApplicantPanVerified: boolean;
  coApplicantIncome: number | '';
  coApplicantConsent: boolean;

  documents: Record<DocumentKey, StoredDocument | null>;
  signatureSessionId: string;
  eSignatureEncrypted: string;
  eSignaturePreview: string;
  eSignatureSavedAt: string;

  consentAccuracy: boolean;
  consentCreditCheck: boolean;
  consentTerms: boolean;
  consentCommunications: boolean;
  consentEmiAffordability: boolean;
}

export const defaultFormValues: LoanFormData = {
  loanType: '',
  loanAmount: '',
  loanTenure: '',
  loanPurpose: '',
  referralCode: '',

  fullName: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  fatherName: '',
  motherName: '',
  email: '',
  mobile: '',
  alternateMobile: '',

  pan: '',
  panVerified: false,
  aadhaar: '',
  aadhaarVerified: false,
  aadhaarConsent: false,
  voterId: '',
  passport: '',

  currentAddressLine1: '',
  currentAddressLine2: '',
  pinCode: '',
  city: '',
  state: '',
  postOffice: '',
  residenceType: '',
  rentAmount: '',
  yearsAtAddress: '',
  sameAsPermanent: true,
  permanentAddressLine1: '',
  permanentAddressLine2: '',
  permanentPinCode: '',
  permanentCity: '',
  permanentState: '',

  employmentType: '',
  companyName: '',
  designation: '',
  monthlySalary: '',
  yearsOfExperience: '',
  businessName: '',
  businessType: '',
  annualTurnover: '',
  yearsInBusiness: '',
  monthlyIncome: '',
  gstNumber: '',
  officeAddressLine1: '',
  officeAddressLine2: '',
  officePinCode: '',
  officeCity: '',
  officeState: '',

  coApplicantName: '',
  coApplicantRelationship: '',
  coApplicantPan: '',
  coApplicantPanVerified: false,
  coApplicantIncome: '',
  coApplicantConsent: false,

  documents: createEmptyDocuments(),
  signatureSessionId: '',
  eSignatureEncrypted: '',
  eSignaturePreview: '',
  eSignatureSavedAt: '',

  consentAccuracy: false,
  consentCreditCheck: false,
  consentTerms: false,
  consentCommunications: false,
  consentEmiAffordability: false,
};

export const STEP_FIELD_GROUPS: Record<number, (keyof LoanFormData)[]> = {
  1: ['loanType', 'loanAmount', 'loanTenure', 'loanPurpose', 'referralCode'],
  2: [
    'fullName',
    'dateOfBirth',
    'gender',
    'maritalStatus',
    'fatherName',
    'motherName',
    'email',
    'mobile',
    'alternateMobile',
  ],
  3: ['pan', 'panVerified', 'aadhaar', 'aadhaarVerified', 'aadhaarConsent', 'voterId', 'passport'],
  4: [
    'currentAddressLine1',
    'currentAddressLine2',
    'pinCode',
    'city',
    'state',
    'residenceType',
    'rentAmount',
    'yearsAtAddress',
    'sameAsPermanent',
    'permanentAddressLine1',
    'permanentAddressLine2',
    'permanentPinCode',
    'permanentCity',
    'permanentState',
  ],
  5: [
    'employmentType',
    'companyName',
    'designation',
    'monthlySalary',
    'yearsOfExperience',
    'businessName',
    'businessType',
    'annualTurnover',
    'yearsInBusiness',
    'monthlyIncome',
    'gstNumber',
    'officeAddressLine1',
    'officeAddressLine2',
    'officePinCode',
    'officeCity',
    'officeState',
  ],
  6: [
    'coApplicantName',
    'coApplicantRelationship',
    'coApplicantPan',
    'coApplicantPanVerified',
    'coApplicantIncome',
    'coApplicantConsent',
  ],
  7: ['eSignatureEncrypted', 'eSignaturePreview', 'eSignatureSavedAt', 'signatureSessionId'],
  8: ['consentAccuracy', 'consentCreditCheck', 'consentTerms', 'consentCommunications', 'consentEmiAffordability'],
};

export const LOAN_PURPOSES: Record<LoanType, { value: string; label: string }[]> = {
  personal: [
    { value: 'medical', label: 'Medical Expenses' },
    { value: 'education', label: 'Education' },
    { value: 'travel', label: 'Travel' },
    { value: 'wedding', label: 'Wedding' },
    { value: 'debt', label: 'Debt Consolidation' },
    { value: 'other', label: 'Other' },
  ],
  home: [
    { value: 'purchase', label: 'Home Purchase' },
    { value: 'construction', label: 'Construction' },
    { value: 'renovation', label: 'Renovation' },
    { value: 'balance_transfer', label: 'Balance Transfer' },
  ],
  business: [
    { value: 'working_capital', label: 'Working Capital' },
    { value: 'equipment', label: 'Equipment Purchase' },
    { value: 'expansion', label: 'Business Expansion' },
    { value: 'inventory', label: 'Inventory' },
  ],
};

export const TENURE_OPTIONS: Record<LoanType, number[]> = {
  personal: [12, 24, 36, 48, 60],
  home: [60, 84, 120, 180, 240, 300, 360],
  business: [12, 24, 36, 48, 60, 72, 84, 96, 108, 120],
};

export const MARITAL_OPTIONS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'widowed', label: 'Widowed' },
] as const;

export const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;

export const EMPLOYMENT_OPTIONS = [
  { value: 'salaried', label: 'Salaried', description: 'Full-time employee with regular salary' },
  { value: 'self_employed', label: 'Self-Employed', description: 'Freelancer, consultant, or professional' },
  { value: 'business_owner', label: 'Business Owner', description: 'Own and operate a registered business' },
] as const;

export const BUSINESS_TYPE_OPTIONS = [
  { value: 'proprietorship', label: 'Proprietorship' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'private_limited', label: 'Private Limited' },
  { value: 'llp', label: 'LLP' },
  { value: 'other', label: 'Other' },
];

export const COMPANY_SUGGESTIONS = [
  'Tata Consultancy Services',
  'Infosys',
  'Wipro',
  'HCL Technologies',
  'HDFC Bank',
  'ICICI Bank',
  'Reliance Industries',
  'Larsen & Toubro',
  'State Bank of India',
  'Bharti Airtel',
  'Amazon India',
  'Flipkart',
  'Zomato',
  'Swiggy',
  'LendSwift Technologies',
];

export const CO_APPLICANT_RELATIONSHIPS = [
  { value: 'spouse', label: 'Spouse' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'business_partner', label: 'Business Partner' },
];
