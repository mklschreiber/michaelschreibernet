export interface MessageSchema {
  nav: {
    home: string
    about: string
    projects: string
    contact: string
  }
  landing: {
    title: string
    subtitle: string
    logoAlt: string
    viewProjects: string
    getInTouch: string
  }
  projects: {
    title: string
    subtitle: string
    projectTitle: string
    projectDescription: string
    projectLinkText: string
    projectLinkTextGithub: string
    projectTitleMichaelSchreiberNet: string
    projectDescriptionMichaelSchreiberNet: string
  }
  contact: {
    title: string
    subtitle: string
    contactInfo: string
    email: string
    emailValue: string
    phone: string
    phoneValue: string
    location: string
    locationValue: string
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
    businessCard: {
      name: string
      role: string
      email: string
      xing: string
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
