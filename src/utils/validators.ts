const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const VALID_PAN_ENTITY = ['P', 'C', 'H', 'A', 'B', 'G', 'J', 'L', 'F', 'T'];

const VERHOEFF_D = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const VERHOEFF_P = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

export function validatePanFormat(pan: string): boolean {
  return PAN_REGEX.test(pan.toUpperCase());
}

export function validatePanEntityType(
  pan: string,
  allowedEntities: string[] = ['P'],
): { valid: boolean; message?: string } {
  const upper = pan.toUpperCase();
  if (!validatePanFormat(upper)) {
    return { valid: false, message: 'PAN must be 10 characters in format AAAAA9999A' };
  }
  const entityChar = upper[3];
  if (!VALID_PAN_ENTITY.includes(entityChar)) {
    return {
      valid: false,
      message: 'PAN 4th character must indicate entity type (P for Individual, C for Company, etc.)',
    };
  }
  if (!allowedEntities.includes(entityChar)) {
    return {
      valid: false,
      message: `For this loan type, PAN entity type must be one of: ${allowedEntities.join(', ')}`,
    };
  }
  return { valid: true };
}

export function validateAadhaarVerhoeff(aadhaar: string): boolean {
  const digits = aadhaar.replace(/\s/g, '');
  if (!/^\d{12}$/.test(digits)) return false;

  let c = 0;
  const reversed = digits.split('').map(Number).reverse();
  for (let i = 0; i < reversed.length; i += 1) {
    // Standard Verhoeff validation uses (i + 1) for permutation row
    c = VERHOEFF_D[c][VERHOEFF_P[(i + 1) % 8][reversed[i]]];
  }
  return c === 0;
}

/** Format rules for simulated UIDAI verification (12 digits, cannot start with 0/1) */
export function validateAadhaarFormat(aadhaar: string): { valid: boolean; message?: string } {
  const digits = aadhaar.replace(/\s/g, '');

  if (!digits) {
    return { valid: false, message: 'Aadhaar number is required' };
  }
  if (!/^\d{12}$/.test(digits)) {
    return { valid: false, message: 'Aadhaar must be exactly 12 digits (numbers only)' };
  }
  if (digits.startsWith('0') || digits.startsWith('1')) {
    return { valid: false, message: 'Aadhaar cannot start with 0 or 1' };
  }
  return { valid: true };
}

/** Full validation including Verhoeff checksum */
export function validateAadhaar(aadhaar: string): { valid: boolean; message?: string } {
  const format = validateAadhaarFormat(aadhaar);
  if (!format.valid) return format;

  const digits = aadhaar.replace(/\s/g, '');
  if (!validateAadhaarVerhoeff(digits)) {
    return {
      valid: false,
      message:
        'Invalid Aadhaar checksum. Please verify all 12 digits are correct (Verhoeff validation failed)',
    };
  }
  return { valid: true };
}

/**
 * Simulation verify — accepts valid 12-digit format for mock UIDAI API.
 * Real production would require Verhoeff pass; demo accepts format so testers can proceed.
 */
export function validateAadhaarForSimulation(aadhaar: string): { valid: boolean; message?: string } {
  return validateAadhaarFormat(aadhaar);
}

export function validateMobile(mobile: string): boolean {
  return /^[6-9]\d{9}$/.test(mobile);
}

export function validateGst(gst: string): boolean {
  return /^\d{2}[A-Z]{5}\d{4}[A-Z]\d[Z][A-Z0-9]$/.test(gst.toUpperCase());
}

export function maskPii(value: string, visibleChars = 4): string {
  if (value.length <= visibleChars) return value;
  return '*'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
}

export async function simulateVerification(
  type: 'PAN' | 'Aadhaar',
  _value: string,
  validator: () => boolean,
): Promise<{ success: boolean; error?: string }> {
  await new Promise((resolve) => setTimeout(resolve, 1500));
  if (!validator()) {
    return { success: false, error: `Invalid ${type} format or checksum` };
  }
  return { success: true };
}
