import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

export const i18nForTests = i18n.createInstance()

i18nForTests.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns: ['translation'],
  defaultNS: 'translation',
  resources: {
    en: {
      translation: {
        // Add common translations used in tests
        common: {
          loading: 'Loading...',
          error: 'Error',
          submit: 'Submit',
          cancel: 'Cancel',
        },
      },
    },
  },
  interpolation: {
    escapeValue: false,
  },
})

export default i18nForTests
