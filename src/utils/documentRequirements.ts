import type { LoanFormData } from '@/types/form';

export interface StoredDocument {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  originalSize: number;
  preview?: string;
  dataUrl: string;
}

export type DocumentKey =
  | 'panCard'
  | 'aadhaarFront'
  | 'aadhaarBack'
  | 'salarySlips'
  | 'bankStatements'
  | 'itr'
  | 'propertyDocuments'
  | 'businessRegistration'
  | 'gstReturns'
  | 'photograph';

export interface DocumentRequirement {
  key: DocumentKey;
  label: string;
  accept: Record<string, string[]>;
  maxSizeMb: number;
  required: boolean;
  optionalReason?: string;
}

export const DOCUMENT_META: Record<DocumentKey, Omit<DocumentRequirement, 'required' | 'optionalReason'>> = {
  panCard: { key: 'panCard', label: 'PAN Card Copy', accept: { 'image/*': ['.jpg', '.jpeg', '.png'], 'application/pdf': ['.pdf'] }, maxSizeMb: 5 },
  aadhaarFront: { key: 'aadhaarFront', label: 'Aadhaar (Front)', accept: { 'image/*': ['.jpg', '.jpeg', '.png'], 'application/pdf': ['.pdf'] }, maxSizeMb: 5 },
  aadhaarBack: { key: 'aadhaarBack', label: 'Aadhaar (Back)', accept: { 'image/*': ['.jpg', '.jpeg', '.png'], 'application/pdf': ['.pdf'] }, maxSizeMb: 5 },
  salarySlips: { key: 'salarySlips', label: 'Salary Slips (Last 3 months)', accept: { 'application/pdf': ['.pdf'] }, maxSizeMb: 5 },
  bankStatements: { key: 'bankStatements', label: 'Bank Statements (Last 6 months)', accept: { 'application/pdf': ['.pdf'] }, maxSizeMb: 10 },
  itr: { key: 'itr', label: 'ITR (Last 2 years)', accept: { 'application/pdf': ['.pdf'] }, maxSizeMb: 5 },
  propertyDocuments: { key: 'propertyDocuments', label: 'Property Documents', accept: { 'application/pdf': ['.pdf'] }, maxSizeMb: 10 },
  businessRegistration: { key: 'businessRegistration', label: 'Business Registration Certificate', accept: { 'application/pdf': ['.pdf'] }, maxSizeMb: 5 },
  gstReturns: { key: 'gstReturns', label: 'GST Returns (Last 4 quarters)', accept: { 'application/pdf': ['.pdf'] }, maxSizeMb: 5 },
  photograph: { key: 'photograph', label: 'Passport Size Photograph', accept: { 'image/*': ['.jpg', '.jpeg', '.png'] }, maxSizeMb: 2 },
};

export function getRequiredDocuments(data: Partial<LoanFormData>): DocumentRequirement[] {
  const reqs: DocumentRequirement[] = [];

  const add = (key: DocumentKey, required: boolean, optionalReason?: string) => {
    reqs.push({ ...DOCUMENT_META[key], required, optionalReason });
  };

  add('panCard', !data.panVerified, data.panVerified ? 'PAN already verified in Step 3' : undefined);
  add('aadhaarFront', true);
  add('aadhaarBack', true);
  add('bankStatements', true);
  add('photograph', true);

  if (data.employmentType === 'salaried') add('salarySlips', true);
  if (data.employmentType === 'self_employed' || data.employmentType === 'business_owner') add('itr', true);
  if (data.loanType === 'home') add('propertyDocuments', true);
  if (data.loanType === 'business') {
    add('businessRegistration', true);
    add('gstReturns', true);
  }

  return reqs;
}

export function createEmptyDocuments(): Record<DocumentKey, StoredDocument | null> {
  return {
    panCard: null,
    aadhaarFront: null,
    aadhaarBack: null,
    salarySlips: null,
    bankStatements: null,
    itr: null,
    propertyDocuments: null,
    businessRegistration: null,
    gstReturns: null,
    photograph: null,
  };
}
