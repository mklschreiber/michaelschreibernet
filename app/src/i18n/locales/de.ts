import type { MessageSchema } from '../types'

const de: MessageSchema = {
  nav: {
    home: 'Home',
    about: 'Über mich',
    projects: 'Projekte',
    contact: 'Kontakt',
  },
  landing: {
    title: 'Willkommen',
    subtitle: 'Entdecken Sie meine Projekte und nehmen Sie Kontakt auf.',
    logoAlt: 'Animiertes michaelschreiber.net Logo als verbundenes IT-Netzwerk',
    viewProjects: 'Projekte ansehen',
    getInTouch: 'Kontakt aufnehmen',
  },
  projects: {
    title: 'Meine Projekte',
    subtitle: 'Eine Auswahl meiner aktuellen Arbeiten',
    projectTitle: 'myStandby',
    projectDescription:
      'Eine Android App zur Verwaltung von Bereitschaftsdiensten, entwickelt mit Kotlin',
    projectLinkText: 'Im Play Store ansehen',
    projectTitleMichaelSchreiberNet: 'michaelschreiber.net',
    projectDescriptionMichaelSchreiberNet:
      'Eine Vue-Applikation zur Auflistung meiner persönlichen Projekte.',
    projectLinkTextGithub: 'Auf GitHub ansehen',
  },
  contact: {
    title: 'Kontakt',
    subtitle: 'Lassen Sie uns in Verbindung treten',
    contactInfo: 'Kontaktinformationen',
    email: 'Email',
    emailValue: "michael.schreiber{'@'}outlook.com",
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
  about: {
    title: 'Über mich',
    businessCard: {
      name: 'Michael Schreiber',
      role: 'Senior Software Engineer',
      email: 'E-Mail',
      xing: 'Xing-Profil',
      avatarAlt: 'Profilbild von Michael Schreiber',
    },
    timeline: {
      title: 'Beruflicher Werdegang',
      entries: {
        mercedesBenz: {
          date: 'April 2022 – heute',
          company: 'Mercedes-Benz Tech Innovation',
          role: 'Senior Software Engineer',
        },
        daimlerTssSenior: {
          date: 'Mai 2018 - März 2022',
          company: 'Daimler TSS GmbH',
          role: 'Senior Software Engineer',
        },
        daimlerTssConsultant: {
          date: 'November 2015 – April 2018',
          company: 'Daimler TSS GmbH',
          role: 'Mobile Consultant',
        },
        daimlerWerkstudent: {
          date: 'März 2012 – Oktober 2015',
          company: 'Daimler AG',
          role: 'Werkstudent (App-Entwicklung)',
        },
        uniUlm: {
          date: 'Oktober 2013 – Oktober 2015',
          company: 'Universität Ulm',
          role: 'Informatik',
        },
        hsUlm: {
          date: 'Oktober 2010 – August 2013',
          company: 'Hochschule Ulm',
          role: 'Technische Informatik',
        },
        toUlm: {
          date: 'September 2008 – Juli 2010',
          company: 'Technische Oberschule Ulm',
          role: 'Fachgebundene Hochschulreife',
        },
        asys: {
          date: 'September 2005 – Juli 2008',
          company: 'ASYS GmbH',
          role: 'Ausbildung zum Mechatroniker für Automatisierungssysteme',
        },
      },
    },
  },
}

export default de
