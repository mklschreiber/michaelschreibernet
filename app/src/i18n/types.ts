export interface MessageSchema {
  nav: {
    home: string
    about: string
    projects: string
    contact: string
    mainLabel: string
    menu: string
  }
  landing: {
    title: string
    subtitle: string
    logoAlt: string
    scrollToProjects: string
  }
  projects: {
    title: string
    subtitle: string
    projectTitle: string
    projectDescription: string
    projectLinkText: string
    projectLinkTextGithub: string
    projectTitleMyStandbyLandingPage: string
    projectDescriptionMyStandbyLandingPage: string
    projectLinkTextWebsite: string
    projectTitleMichaelSchreiberNet: string
    projectDescriptionMichaelSchreiberNet: string
    screenshotMacbookAlt: string
    screenshotPhoneAlt: string
    screenshotMyStandbyDeskAlt: string
    screenshotMyStandbyBedroomAlt: string
    screenshotMyStandbyKitchenAlt: string
    screenshotMyStandbyLockScreenAlt: string
    screenshotMyStandbyCalendarAlt: string
    screenshotMyStandbyLockScreenCloseUpAlt: string
    screenshotMyStandbyLandingMacbookAlt: string
    screenshotMyStandbyLandingPhoneAlt: string
    galleryLabel: string
  }
  contact: {
    title: string
    subtitle: string
    form: {
      name: string
      namePlaceholder: string
      email: string
      emailPlaceholder: string
      message: string
      messagePlaceholder: string
      submit: string
      submitting: string
      successMessage: string
      errorMessage: string
    }
  }
  about: {
    title: string
    subtitle: string
    businessCard: {
      name: string
      role: string
      email: string
      phone: string
      github: string
      linkedin: string
      facebook: string
      instagram: string
      avatarAlt: string
    }
    timeline: {
      title: string
      entries: {
        mercedesBenz: { date: string; company: string; role: string }
        daimlerTssSenior: { date: string; company: string; role: string }
        daimlerTssConsultant: { date: string; company: string; role: string }
        daimlerWerkstudent: { date: string; company: string; role: string }
        uniUlm: { date: string; company: string; role: string }
        hsUlm: { date: string; company: string; role: string }
        toUlm: { date: string; company: string; role: string }
        asys: { date: string; company: string; role: string }
      }
    }
  }
}
