import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Initialize i18next with basic configuration
i18n
  .use(initReactI18next) // Passes i18n to react-i18next
  .init({
    fallbackLng: 'en', // Default language
    debug: false, // Disable debug logging

    resources: {
      en: {
        translation: {
          welcome: 'Welcome',
          query_prompt: 'Ask me anything!',
          error_message: "Couldn't connect to chatbot! Please try later."
        }
      },
      fr: {
        translation: {
          welcome: 'Bienvenue',
          query_prompt: 'Demandez-moi tout!',
          error_message: "Impossible de se connecter au chatbot! Veuillez réessayer plus tard."
        }
      }
    },
    interpolation: {
      escapeValue: false // React already escapes values
    }
  });

export default i18n;
