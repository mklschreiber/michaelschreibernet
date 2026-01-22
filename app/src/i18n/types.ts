export interface MessageSchema {
  nav: {
    home: string
    projects: string
    contact: string
  }
  landing: {
    title: string
    subtitle: string
    viewProjects: string
    getInTouch: string
  }
  projects: {
    title: string
    subtitle: string
    projectTitle: string
    projectDescription: string
    projectLinkText: string
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
}
