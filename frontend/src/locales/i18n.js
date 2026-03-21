import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import am from './am.json';

const storedLanguage = localStorage.getItem('i18nextLng') || 'en';

console.log('--- i18n.js: Initializing with en keys:', Object.keys(en).length, 'am keys:', Object.keys(am).length);

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            am: { translation: am }
        },
        lng: storedLanguage,
        fallbackLng: 'en',
        detection: {
            order: ['localStorage', 'navigator'],
            caches: ['localStorage']
        },
        interpolation: {
            escapeValue: false
        },
        react: {
            useSuspense: true
        }
    });

console.log('--- i18n.js: Initialized. Current language:', i18n.language);

export default i18n;
