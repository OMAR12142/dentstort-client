/**
 * Curated clinical cover theme presets for PublicPortfolioHeader & PortfolioEditorPage.
 * Designed to look crisp in both Light Mode and Dark Mode.
 */
export const PORTFOLIO_COVER_THEMES = [
  {
    id: 'clinical-blue',
    name: 'Clinical Blue',
    nameAr: 'أزرق طبي',
    gradientClass:
      'bg-gradient-to-br from-[#0A66C2] via-[#0B3B6E] to-[#061A33] dark:from-[#0C4A82] dark:via-[#07264A] dark:to-[#041122]',
    swatchClass: 'bg-gradient-to-br from-[#0A66C2] via-[#0B3B6E] to-[#061A33]',
    orbPrimaryClass: 'bg-sky-300/20',
    orbSecondaryClass: 'bg-cyan-400/15',
    isLightSurface: false,
  },
  {
    id: 'emerald-care',
    name: 'Emerald Care',
    nameAr: 'أخضر زمردي',
    gradientClass:
      'bg-gradient-to-br from-[#059669] via-[#065F46] to-[#042F2E] dark:from-[#047857] dark:via-[#064E3B] dark:to-[#022C22]',
    swatchClass: 'bg-gradient-to-br from-[#059669] via-[#065F46] to-[#042F2E]',
    orbPrimaryClass: 'bg-emerald-300/20',
    orbSecondaryClass: 'bg-teal-300/15',
    isLightSurface: false,
  },
  {
    id: 'midnight-slate',
    name: 'Midnight Slate',
    nameAr: 'رمادي داكن',
    gradientClass:
      'bg-gradient-to-br from-[#334155] via-[#1E293B] to-[#0F172A] dark:from-[#1E293B] dark:via-[#0F172A] dark:to-[#020617]',
    swatchClass: 'bg-gradient-to-br from-[#334155] via-[#1E293B] to-[#0F172A]',
    orbPrimaryClass: 'bg-indigo-300/15',
    orbSecondaryClass: 'bg-sky-400/15',
    isLightSurface: false,
  },
  {
    id: 'pearl-minimal',
    name: 'Pearl Minimal',
    nameAr: 'لؤلؤي هادئ',
    gradientClass:
      'bg-gradient-to-br from-[#E2ECFA] via-[#F1F5F9] to-[#DCE8F8] dark:from-[#1E293B] dark:via-[#243247] dark:to-[#172133]',
    swatchClass:
      'bg-gradient-to-br from-[#E2ECFA] via-[#F8FAFC] to-[#CBD5E1] dark:from-[#334155] dark:via-[#1E293B] dark:to-[#0F172A]',
    orbPrimaryClass: 'bg-primary/15 dark:bg-sky-400/15',
    orbSecondaryClass: 'bg-sky-400/15 dark:bg-indigo-400/10',
    isLightSurface: true,
  },
];

export function getCoverThemePreset(themeId) {
  return (
    PORTFOLIO_COVER_THEMES.find((preset) => preset.id === themeId) ||
    PORTFOLIO_COVER_THEMES[0]
  );
}

