/**
 * Numeral normalization helpers.
 *
 * Iranian users frequently type numbers with Persian numerals (۰-۹) or
 * Arabic-Indic numerals (٠-٩). Validation regexes and `Number()` only
 * understand ASCII digits, so every numeric input must be normalized before
 * validation and before persistence.
 */

/** Persian (Extended Arabic-Indic) digits: U+06F0 – U+06F9 */
const PERSIAN_ZERO = 0x06f0;
/** Arabic-Indic digits: U+0660 – U+0669 */
const ARABIC_ZERO = 0x0660;

/**
 * Convert Persian and Arabic-Indic numerals to standard ASCII digits, and
 * normalize Arabic/Persian numeric separators.
 *
 * Also handled:
 *  - Arabic decimal separator `٫` (U+066B) -> `.`
 *  - Arabic thousands separator `٬` (U+066C) -> removed
 *  - Arabic comma `،` (U+060C) -> removed
 *  - Persian/Arabic keyboard zero-width chars (ZWNJ / ZWJ) -> removed
 *
 * Any character that is not a numeral or separator is left untouched, so this
 * is safe to run on mixed text.
 */
export function toEnglishDigits(input: string): string {
  if (!input) return '';

  let out = '';
  for (const char of String(input)) {
    const code = char.codePointAt(0) ?? 0;

    if (code >= PERSIAN_ZERO && code <= PERSIAN_ZERO + 9) {
      out += String(code - PERSIAN_ZERO);
      continue;
    }
    if (code >= ARABIC_ZERO && code <= ARABIC_ZERO + 9) {
      out += String(code - ARABIC_ZERO);
      continue;
    }

    switch (char) {
      case '\u066B': // Arabic decimal separator ٫
        out += '.';
        break;
      case '\u066C': // Arabic thousands separator ٬
      case '\u060C': // Arabic comma ،
      case '\u200C': // ZWNJ
      case '\u200D': // ZWJ
        break;
      default:
        out += char;
    }
  }
  return out;
}

/** Convert ASCII digits to Persian numerals (display only — never for storage). */
export function toPersianDigits(value: number | string): string {
  return String(value).replace(/\d/g, (d) =>
    String.fromCodePoint(PERSIAN_ZERO + Number(d))
  );
}

/**
 * Normalize any numeral system to ASCII and keep digits only.
 * Useful for phone numbers, OTP codes and integer-only inputs.
 */
export function digitsOnly(input: string): string {
  return toEnglishDigits(input).replace(/\D/g, '');
}

/**
 * Normalize a phone-number input as the user types.
 * Converts numerals, drops spaces/dashes/parentheses, and caps at 11 digits
 * so the value shown on screen is exactly what gets validated and stored.
 */
export function normalizePhoneInput(input: string): string {
  return digitsOnly(input).slice(0, 11);
}

/**
 * Normalize a numeric (possibly decimal) input as the user types.
 * Converts numerals, strips grouping characters, and keeps at most one
 * decimal point so `Number()` can parse the result.
 */
export function normalizeNumericInput(input: string): string {
  const converted = toEnglishDigits(input).replace(/[^\d.]/g, '');
  const [integerPart, ...rest] = converted.split('.');
  return rest.length > 0 ? `${integerPart}.${rest.join('')}` : integerPart;
}

/** Iranian mobile/landline: 11 digits starting with 0. */
export const ELEVEN_DIGIT_PHONE = /^0\d{10}$/;

/** Iranian mobile only: 11 digits starting with 09. */
export const IRAN_MOBILE = /^09\d{9}$/;