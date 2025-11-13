// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import JSON translations from assets
import en from "./assets/translations/en.json";
import hi from "./assets/translations/hi.json";
import ar from "./assets/translations/ar.json";
import pl from "./assets/translations/pl.json";
import zh from "./assets/translations/zh.json";

i18n
  .use(LanguageDetector) // Detect language
  .use(initReactI18next) // Bind with React
  .init({
    resources: {
      en: { translation: en },
      hi: { translation: hi },
      ar: { translation: ar },
      pl: { translation: pl },
      zh: { translation: zh },
    },
    lng: localStorage.getItem("lang") || "en", // Default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false, // React already handles escaping
    },
    detection: {
      order: ["localStorage", "navigator"],
      caches: ["localStorage"], // Store user choice in localStorage
    },
  });

export default i18n;
