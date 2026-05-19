import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import AppContextProvider from './context/AppContext.jsx'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n'
import { LanguageProvider } from './context/LanguageContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <I18nextProvider i18n={i18n}>
    <BrowserRouter>
      <AppContextProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AppContextProvider>
    </BrowserRouter>
  </I18nextProvider>,
)
