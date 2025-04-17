import React from 'react';
import { useTranslation } from 'react-i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  const isPtActive = i18n.language === 'pt' || i18n.language.startsWith('pt-');
  const isEnActive = i18n.language === 'en' || i18n.language.startsWith('en-');


  return (
    <div className="language-switcher">
      <button
        onClick={() => changeLanguage('pt')}
        disabled={isPtActive} // Desativa se já for PT
        className={isPtActive ? 'active' : ''}
      >
        PT
      </button>
      <button
        onClick={() => changeLanguage('en')}
        disabled={isEnActive} // Desativa se já for EN
        className={isEnActive ? 'active' : ''}
      >
        EN
      </button>
    </div>
  );
}

export default LanguageSwitcher;