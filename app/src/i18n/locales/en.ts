import type { MessageSchema } from '../types'

const en: MessageSchema = {
  nav: {
    home: 'Home',
    projects: 'Projects',
    contact: 'Contact',
  },
  landing: {
    title: 'Welcome',
    subtitle: 'Discover my projects and get in touch.',
    viewProjects: 'View Projects',
    getInTouch: 'Get in Touch',
  },
  projects: {
    title: 'My Projects',
    subtitle: 'A selection of my current work',
    projectTitle: 'myStandby',
    projectDescription: 'An Android app for managing on-call duties, developed with Kotlin',
    projectLinkText: 'View on Play Store',
  },
  contact: {
    title: 'Contact',
    subtitle: 'Let\'s get in touch',
    contactInfo: 'Contact Information',
    email: 'Email',
    emailValue: 'mkl.schreiber@gmail.com',
    phone: 'Phone',
    phoneValue: '+49 (0) 15679 724718',
    location: 'Location',
    locationValue: 'Leipheim',
    form: {
      name: 'Name',
      namePlaceholder: 'Your Name',
      email: 'Email',
      emailPlaceholder: 'your.email@example.com',
      message: 'Message',
      messagePlaceholder: 'Your message...',
      submit: 'Send Message',
      submitting: 'Sending...',
      successMessage: 'Thank you for your message! I will get back to you soon.',
      errorMessage: 'There was a problem sending the message. Please try again.',
    },
  },
}

export default en
