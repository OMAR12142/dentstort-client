/**
 * Helper to convert a Latin string to Title Case.
 * Handles hyphens (e.g. "al-samir" -> "Al-Samir").
 */
function toLatinTitleCase(str = '') {
  return str
    .split(/\s+/)
    .map((word) => {
      if (!word) return '';
      if (word.includes('-')) {
        return word
          .split('-')
          .map((part) => (part ? part[0].toUpperCase() + part.slice(1).toLowerCase() : ''))
          .join('-');
      }
      return word[0].toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Format doctor display name without duplicating "Dr." / "د." prefixes,
 * and ensuring Latin names are formatted in Title Case ("Dr. omar selema" -> "Dr. Omar Selema")
 * while preserving Arabic names as-is.
 */
export function formatDoctorDisplayName(name = '', isArabic = false) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return '';

  const hasArabic = /[\u0600-\u06FF]/.test(trimmed);

  if (hasArabic) {
    if (/^(د\.?\s*|دكتور\s+|دكتورة\s+|dr\.?\s+)/i.test(trimmed)) {
      return trimmed;
    }
    return `${isArabic ? 'د.' : 'Dr.'} ${trimmed}`;
  }

  // Latin name processing: check for existing Dr. prefix (case-insensitive)
  const prefixMatch = trimmed.match(/^(dr\.?\s+)/i);
  if (prefixMatch) {
    const rest = trimmed.slice(prefixMatch[0].length).trim();
    return `Dr. ${toLatinTitleCase(rest)}`;
  }

  return `Dr. ${toLatinTitleCase(trimmed)}`;
}

/**
 * Format a phone string for wa.me links:
 * - Preserves explicit international prefixes (`+...` or `00...`)
 * - Normalizes local Egyptian 11-digit mobile numbers (`01xxxxxxxxx`) to `201xxxxxxxxx`
 * - Leaves other numbers untouched (digits only) rather than blindly prepending `20`
 */
export function formatWhatsAppNumber(rawPhone) {
  const trimmed = String(rawPhone || '').trim();
  if (!trimmed) return '';
  const hasPlusPrefix = trimmed.startsWith('+');
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return '';
  if (hasPlusPrefix) return digits;
  if (digits.startsWith('00')) return digits.slice(2);
  if (/^01[0125]\d{8}$/.test(digits)) {
    return `20${digits.slice(1)}`;
  }
  return digits;
}

