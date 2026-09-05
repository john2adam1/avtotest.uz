/**
 * Utilities for normalizing and formatting Uzbek phone numbers
 */

export interface NormalizedPhone {
  cleanPhone: string   // e.g. "+998901234567"
  authEmail: string    // e.g. "998901234567@gmail.com"
  rawDigits: string    // e.g. "901234567" (9 digits)
  isValid: boolean
}

/**
 * Normalizes any Uzbek phone number input (with/without +998, with spaces, brackets, etc.)
 */
export function normalizeUzbekPhone(input: string): NormalizedPhone {
  if (!input) {
    return { cleanPhone: "", authEmail: "", rawDigits: "", isValid: false }
  }

  // Extract all digit characters only
  const digits = input.replace(/\D/g, "")

  let raw9Digits = ""

  if (digits.startsWith("998")) {
    if (digits.length === 12) {
      raw9Digits = digits.slice(3)
    } else if (digits.length > 12) {
      // In case of duplicate prefixes like 998998901234567
      const last12 = digits.slice(-12)
      if (last12.startsWith("998")) {
        raw9Digits = last12.slice(3)
      } else {
        raw9Digits = digits.slice(-9)
      }
    } else {
      raw9Digits = digits.slice(3)
    }
  } else if (digits.length === 9) {
    raw9Digits = digits
  } else if (digits.length > 9) {
    raw9Digits = digits.slice(-9)
  } else {
    raw9Digits = digits
  }

  const isValid = raw9Digits.length === 9
  const cleanPhone = isValid ? `+998${raw9Digits}` : ""
  const authEmail = isValid ? `998${raw9Digits}@gmail.com` : ""

  return {
    cleanPhone,
    authEmail,
    rawDigits: raw9Digits,
    isValid,
  }
}

/**
 * Formats a 9-digit Uzbek phone string into readable display format (XX) XXX-XX-XX
 */
export function formatUzbekPhoneDisplay(digits: string): string {
  const clean = digits.replace(/\D/g, "").slice(0, 9)
  if (!clean) return ""

  let formatted = ""
  if (clean.length > 0) {
    formatted += clean.slice(0, 2)
  }
  if (clean.length > 2) {
    formatted += " " + clean.slice(2, 5)
  }
  if (clean.length > 5) {
    formatted += " " + clean.slice(5, 7)
  }
  if (clean.length > 7) {
    formatted += " " + clean.slice(7, 9)
  }
  return formatted
}
