import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [dir, setDir] = useState('ltr');

  useEffect(() => {
    const currentLang = i18n.language || 'en';
    const isRTL = currentLang.startsWith('ar');
    setDir(isRTL ? 'rtl' : 'ltr');
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = currentLang;
  }, [i18n.language]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
  };

  return (
    <LanguageContext.Provider value={{ dir, changeLanguage, currentLanguage: i18n.language }}>
      <div dir={dir} className={dir === 'rtl' ? 'rtl-layout' : 'ltr-layout'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    return { dir: 'ltr', changeLanguage: () => {}, currentLanguage: 'en' };
  }
  return context;
};

export default LanguageContext;
