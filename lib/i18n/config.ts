// lib/i18n/config.ts
"use client"
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

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
    .use(LanguageDetector) // Detect user language automatically
    .use(initReactI18next) // Pass i18n to react-i18next
    .init({
        resources,
        fallbackLng: 'uz', // Default language if detection fails
        supportedLngs: ['uz', 'uz_cyrl'], // Safe list of languages

        interpolation: {
            escapeValue: false, // React already escapes XSS
        },

        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage'], // Cache user language in localStorage
        },

        react: {
            useSuspense: false // Avoid hydration mismatch on client if possible, or handle suspense
        }
    });

export default i18n;