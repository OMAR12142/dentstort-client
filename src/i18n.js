import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// ── English translations ──
import commonEn from './locales/en/common.json';
import authEn from './locales/en/auth.json';
import dashboardEn from './locales/en/dashboard.json';
import patientsEn from './locales/en/patients.json';
import sessionsEn from './locales/en/sessions.json';
import clinicsEn from './locales/en/clinics.json';
import appointmentsEn from './locales/en/appointments.json';
import analyticsEn from './locales/en/analytics.json';
import expensesEn from './locales/en/expenses.json';
import tasksEn from './locales/en/tasks.json';
import portfolioEn from './locales/en/portfolio.json';
import profileEn from './locales/en/profile.json';
import adminEn from './locales/en/admin.json';
import landingEn from './locales/en/landing.json';

// ── Arabic translations ──
import commonAr from './locales/ar/common.json';
import authAr from './locales/ar/auth.json';
import dashboardAr from './locales/ar/dashboard.json';
import patientsAr from './locales/ar/patients.json';
import sessionsAr from './locales/ar/sessions.json';
import clinicsAr from './locales/ar/clinics.json';
import appointmentsAr from './locales/ar/appointments.json';
import analyticsAr from './locales/ar/analytics.json';
import expensesAr from './locales/ar/expenses.json';
import tasksAr from './locales/ar/tasks.json';
import portfolioAr from './locales/ar/portfolio.json';
import profileAr from './locales/ar/profile.json';
import adminAr from './locales/ar/admin.json';
import landingAr from './locales/ar/landing.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        common: commonEn,
        auth: authEn,
        dashboard: dashboardEn,
        patients: patientsEn,
        sessions: sessionsEn,
        clinics: clinicsEn,
        appointments: appointmentsEn,
        analytics: analyticsEn,
        expenses: expensesEn,
        tasks: tasksEn,
        portfolio: portfolioEn,
        profile: profileEn,
        admin: adminEn,
        landing: landingEn,
      },
      ar: {
        common: commonAr,
        auth: authAr,
        dashboard: dashboardAr,
        patients: patientsAr,
        sessions: sessionsAr,
        clinics: clinicsAr,
        appointments: appointmentsAr,
        analytics: analyticsAr,
        expenses: expensesAr,
        tasks: tasksAr,
        portfolio: portfolioAr,
        profile: profileAr,
        admin: adminAr,
        landing: landingAr,
      },
    },
    fallbackLng: 'en',
    defaultNS: 'common',
    ns: [
      'common', 'auth', 'dashboard', 'patients', 'sessions',
      'clinics', 'appointments', 'analytics', 'expenses',
      'tasks', 'portfolio', 'profile', 'admin', 'landing',
    ],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'dentstory-lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false, // React already escapes
    },
    react: {
      useSuspense: false,
    },
  });

// Apply dir attribute on init
const currentLang = i18n.language?.startsWith('ar') ? 'ar' : 'en';
document.documentElement.dir = currentLang === 'ar' ? 'rtl' : 'ltr';
document.documentElement.lang = currentLang;

// Listen for language changes
i18n.on('languageChanged', (lng) => {
  const isArabic = lng === 'ar';
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  document.documentElement.lang = lng;
});

export default i18n;
