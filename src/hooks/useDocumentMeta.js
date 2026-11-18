import { useEffect } from 'react';

const DEFAULT_TITLE = 'DentStory';
const DEFAULT_DESCRIPTION =
  'DentStory — SaaS platform for dental practitioners. Manage patients, clinics, sessions and financials in one place.';

/**
 * Imperatively synchronizes document.title and <meta name="description">
 * when dynamic page data loads, and restores the default title/description on unmount.
 */
export function useDocumentMeta(title, description) {
  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    if (title) {
      document.title = title;
    }

    let metaEl = document.querySelector('meta[name="description"]');
    if (description) {
      if (!metaEl) {
        metaEl = document.createElement('meta');
        metaEl.setAttribute('name', 'description');
        document.head.appendChild(metaEl);
      }
      metaEl.setAttribute('content', description);
    }

    return undefined;
  }, [title, description]);

  useEffect(() => {
    if (typeof document === 'undefined') return undefined;

    return () => {
      document.title = DEFAULT_TITLE;
      const metaEl = document.querySelector('meta[name="description"]');
      if (metaEl) {
        metaEl.setAttribute('content', DEFAULT_DESCRIPTION);
      }
    };
  }, []);
}

