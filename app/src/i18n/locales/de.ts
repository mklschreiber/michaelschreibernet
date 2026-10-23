import type { MessageSchema } from '../types'

const de: MessageSchema = {
  nav: {
    home: 'Home',
    about: 'Über mich',
    projects: 'Projekte',
    contact: 'Kontakt',
    mainLabel: 'Hauptnavigation',
    menu: 'Menü',
  },
  landing: {
    title: 'Willkommen',
    subtitle: 'Entdecke meine Projekte und nimm Kontakt auf.',
    logoAlt: 'Animiertes michaelschreiber.net Logo als verbundenes IT-Netzwerk',
    scrollToProjects: 'Zu „Projekte“ scrollen',
  },
  projects: {
    title: 'Projekte',
    subtitle: 'Eine Auswahl meiner aktuellen Arbeiten',
    projectTitle: 'myStandby',
    projectDescription:
      'Eine Android App zur Verwaltung von Bereitschaftsdiensten, entwickelt mit Kotlin',
    projectLinkText: 'Im Play Store ansehen',
    projectTitleMichaelSchreiberNet: 'michaelschreiber.net',
    projectDescriptionMichaelSchreiberNet:
      'Eine Vue-Applikation zur Auflistung meiner persönlichen Projekte.',
    projectLinkTextGithub: 'Auf GitHub ansehen',
    projectTitleMyStandbyLandingPage: 'myStandby – LandingPage',
    projectDescriptionMyStandbyLandingPage: 'Eine Vue-Applikation als Landing-Page für meine App myStandby.',
    projectLinkTextWebsite: 'Website besuchen',
    screenshotMacbookAlt: 'Startseite von michaelschreiber.net dargestellt auf einem MacBook',
    screenshotPhoneAlt: 'Startseite von michaelschreiber.net dargestellt auf einem Smartphone',
    screenshotMyStandbyDeskAlt:
      'myStandby auf einem Smartphone in einer Ladestation auf dem Schreibtisch, mit Klappuhr und Fotostapel',
    screenshotMyStandbyBedroomAlt: 'myStandby auf einem Smartphone auf dem Nachttisch bei Nacht, mit Uhrzeit und Datum',
    screenshotMyStandbyKitchenAlt:
      'myStandby auf einem Smartphone in einer Ladestation auf der Küchenarbeitsplatte, mit Fotostapel',
    screenshotMyStandbyLockScreenAlt: 'myStandby-Sperrbildschirm-Widget mit Uhrzeit und nächster Aufgabe',
    screenshotMyStandbyCalendarAlt: 'myStandby-Kalenderansicht mit Terminen und Monatsübersicht',
    screenshotMyStandbyLockScreenCloseUpAlt: 'Nahaufnahme des myStandby-Sperrbildschirm-Widgets',
    screenshotMyStandbyLandingMacbookAlt: 'Landingpage von myStandby dargestellt auf einem MacBook',
    screenshotMyStandbyLandingPhoneAlt: 'Landingpage von myStandby dargestellt auf einem Smartphone',
    galleryLabel: 'Bildergalerie: {title}',
  },
  contact: {
    title: 'Kontakt',
    subtitle: 'Lass uns in Verbindung treten',
    form: {
      name: 'Name',
      namePlaceholder: 'Dein Name',
      email: 'E-Mail',
      emailPlaceholder: "deine.email{'@'}example.com",
      message: 'Nachricht',
      messagePlaceholder: 'Deine Nachricht',
      submit: 'Nachricht senden',
      submitting: 'Wird gesendet...',
      successMessage: 'Vielen Dank für deine Nachricht! Ich melde mich bald bei dir.',
      errorMessage: 'Beim Senden der Nachricht gab es ein Problem. Bitte versuche es erneut.',
    },
  },
  about: {
    title: 'Über mich',
    subtitle: 'Eine Übersicht über mich und meine Stationen',
    businessCard: {
      name: 'Michael Schreiber',
      role: 'Senior Software Engineer',
      email: 'E-Mail',
      phone: 'Telefon',
      github: 'GitHub-Profil',
      linkedin: 'LinkedIn-Profil',
      facebook: 'Facebook-Profil',
      instagram: 'Instagram-Profil',
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
          date: 'Mai 2018 – März 2022',
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
