// lib/i18n/config.ts
"use client"
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Import translation files directly to bundle them
// This avoids backend calls and works with static export
import uz from './locales/uz.json';
import uz_cyrl from './locales/uz_cyrl.json';

// Define resources
export const resources = {
    uz: { translation: uz },
    uz_cyrl: { translation: uz_cyrl },
} as const;

i18n
    .use(initReactI18next) // Pass i18n to react-i18next
    .init({
        resources,
        // Always initialize with 'uz' to match SSR output and avoid hydration mismatch.
        // The I18nProvider will update the language client-side after mount.
        lng: 'uz',
        fallbackLng: 'uz',
        supportedLngs: ['uz', 'uz_cyrl'],

        interpolation: {
            escapeValue: false, // React already escapes XSS
        },

        react: {
            useSuspense: false
        }
    });

export default i18n;