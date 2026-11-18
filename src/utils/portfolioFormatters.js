/**
 * Format doctor display name without duplicating "Dr." / "د." prefixes.
 */
export function formatDoctorDisplayName(name = '', isArabic = false) {
  const trimmed = String(name || '').trim();
  if (!trimmed) return '';
  if (/^(dr\.?\s+|د\.?\s*|دكتور\s+|دكتورة\s+)/i.test(trimmed)) {
    return trimmed;
  }
  return `${isArabic ? 'د.' : 'Dr.'} ${trimmed}`;
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

