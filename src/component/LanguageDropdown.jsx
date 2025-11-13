import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";
import { useTranslation } from "react-i18next"; // ✅ import
import US from "../assets/US.jpg";
import IN from "../assets/IN.jpg";
import SA from "../assets/SA.jpg";
import PL from "../assets/PL.jpg";
import CN from "../assets/CN.webp";

const LanguageDropdown = () => {
  const { i18n } = useTranslation(); // ✅ use i18n
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState({
    code: "en",
    name: "English",
    flag: US,
  });
  const dropdownRef = useRef(null);

 const languages = [
  { code: "en", name: "English", flag: US },
  { code: "hi", name: "हिन्दी", flag: IN },
  { code: "ar", name: "العربية", flag: SA },
  { code: "pl", name: "Polski", flag: PL },
  { code: "zh", name: "中文", flag: CN },
];


  const handleSelect = (lang) => {
    setSelected(lang);
    setIsOpen(false);
    i18n.changeLanguage(lang.code); // ✅ switch language
    localStorage.setItem("lang", lang.code); // ✅ persist choice
  };

  // Load saved language on mount
  useEffect(() => {
    const savedLang = localStorage.getItem("lang");
    if (savedLang) {
      const langObj = languages.find((l) => l.code === savedLang);
      if (langObj) {
        setSelected(langObj);
        i18n.changeLanguage(savedLang);
      }
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer flex items-center justify-between w-30 px-3 py-1.5 bg-white border border-gray-200 rounded-md shadow-sm hover:bg-gray-50 transition-colors duration-150 text-sm"
      >
        <div className="flex items-center">
          <img
            src={selected.flag}
            alt={selected.name}
            className="w-5 h-5 mr-2 rounded-sm"
          />
          <span className="truncate">{selected.name}</span>
        </div>
        <FaChevronDown
          className={`ml-1 transition-transform duration-200 ${
            isOpen ? "rotate-180" : "rotate-0"
          }`}
          size={10}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute mt-1 w-30 bg-[#F0F0F0] border border-gray-200 rounded-md shadow-lg z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelect(lang)}
              className={`cursor-pointer flex items-center w-full text-left px-3 py-2 text-sm hover:bg-blue-50 transition-colors duration-150 ${
                selected.code === lang.code ? "bg-blue-50 text-blue-600" : ""
              }`}
            >
              <img
                src={lang.flag}
                alt={lang.name}
                className="w-5 h-5 mr-2 rounded-sm"
              />
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageDropdown;
