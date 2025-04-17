import React from 'react';
import { useTranslation } from 'react-i18next';

function BirthdateInput({ dateInput, onDateChange, onUpdateClick }) {
  const { t } = useTranslation();
  const maxDate = new Date().toISOString().split('T')[0];

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onUpdateClick();
    }
  };

  return (
    <div className="birthdate-input-section">
      <label htmlFor="birthdate">{t('birthDateLabel')}</label>
      <input
        type="date"
        id="birthdate"
        value={dateInput}
        onChange={onDateChange}
        max={maxDate}
        onKeyDown={handleKeyDown}
      />
      <button onClick={onUpdateClick}>{t('updateButton')}</button>
    </div>
  );
}

export default BirthdateInput;