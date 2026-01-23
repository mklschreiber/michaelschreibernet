import type { MessageSchema } from '../types'

const de: MessageSchema = {
  nav: {
    home: 'Home',
    projects: 'Projekte',
    contact: 'Kontakt',
  },
  landing: {
    title: 'Willkommen',
    subtitle: 'Entdecken Sie meine Projekte und nehmen Sie Kontakt auf.',
    viewProjects: 'Projekte ansehen',
    getInTouch: 'Kontakt aufnehmen',
  },
  projects: {
    title: 'Meine Projekte',
    subtitle: 'Eine Auswahl meiner aktuellen Arbeiten',
    projectTitle: 'myStandby',
    projectDescription: 'Eine Android App zur Verwaltung von Bereitschaftsdiensten, entwickelt mit Kotlin',
    projectLinkText: 'Im Play Store ansehen',
  },
  contact: {
    title: 'Kontakt',
    subtitle: 'Lassen Sie uns in Verbindung treten',
    contactInfo: 'Kontaktinformationen',
    email: 'Email',
    emailValue: "mkl.schreiber{'@'}gmail.com",
    phone: 'Telefon',
    phoneValue: '+49 (0) 15679 724718',
    location: 'Standort',
    locationValue: 'Leipheim',
    form: {
      name: 'Name',
      namePlaceholder: 'Ihr Name',
      email: 'Email',
      emailPlaceholder: "ihre.email{'@'}example.com",
      message: 'Nachricht',
      messagePlaceholder: 'Ihre Nachricht...',
      submit: 'Nachricht senden',
      submitting: 'Wird gesendet...',
      successMessage: 'Vielen Dank für Ihre Nachricht! Ich werde mich bald bei Ihnen melden.',
      errorMessage: 'Es gab ein Problem beim Senden der Nachricht. Bitte versuchen Sie es erneut.',
    },
  },
}

export default de

