import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import translationEN from './locales/en/translation.json';
import translationPT from './locales/pt/translation.json';

const resources = {
  en: { translation: translationEN },
  pt: { translation: translationPT }
};

i18n
  .use(LanguageDetector) // Detecta o idioma do utilizador
  .use(initReactI18next) // Passa a instância i18n para react-i18next
  .init({
    resources,
    fallbackLng: 'pt', // Idioma padrão se o detectado não estiver disponível
    debug: false, // Mude para true para ver logs no console durante desenvolvimento
    interpolation: {
      escapeValue: false // React já protege contra XSS
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'], // Ordem de deteção
      caches: ['localStorage'], // Guarda o idioma escolhido no localStorage
    }
  });

export default i18n;