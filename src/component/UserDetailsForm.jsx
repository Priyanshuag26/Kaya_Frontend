// UserDetailsForm.jsx
import React, { useState, useEffect } from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import './UserDetailsForm.css';
import { useTranslation } from "react-i18next";

const UserDetailsForm = ({ onFormSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    contact_number: '',
  });
  const [errors, setErrors] = useState({});
  const [selectedCountry, setSelectedCountry] = useState('IN');
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  // disable body scroll when form is open
  useEffect(() => {
    document.body.classList.add('no-scroll');
    return () => document.body.classList.remove('no-scroll');
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePhoneChange = (value) => {
    if (selectedCountry === 'IN' && value) {
      value = value.replace(/^\+91(0+)/, '+91');
    }
    setFormData({ ...formData, contact_number: value });
  };
  const API_BASE_URL = import.meta.env.VITE_API_URL; 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/insert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error("Failed to submit form");

      const result = await response.json();
      console.log("Server response:", result);

      if (typeof onFormSubmit === "function") {
        onFormSubmit(formData);
      }
    } catch (error) {
      console.error("Error:", error);
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
   
      <div className="user-form">
        <form onSubmit={handleSubmit}>
          <label className="custom-label">{t("Name")}</label>
          <input
            type="text"
            name="name"
            className="custom-input"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <label className="custom-label">{t("Email")}</label>
          <input
            type="email"
            name="email"
            className="custom-input"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <label className="custom-label">{t("Phone No.")}</label>
          <PhoneInput
            className="custom-input2"
            value={formData.contact_number}
            onChange={handlePhoneChange}
            defaultCountry="IN"
            required
          />

          <label className="custom-label">{t("Company Name")}</label>
          <input
            type="text"
            name="company_name"
            className="custom-input"
            value={formData.company_name}
            onChange={handleChange}
          />

          {errors.form && <p className="text-red-500">{errors.form}</p>}

          <button id="btn" type="submit" disabled={loading}>
            <p id="btnText">{loading ? t("Submitting...") : t("Submit")}</p>
            {loading && <div className="loader"></div>}
          </button>

        </form>
      </div>
    
  );
};

export default UserDetailsForm;