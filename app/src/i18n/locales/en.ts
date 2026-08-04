import type { MessageSchema } from '../types'

const en: MessageSchema = {
  nav: {
    home: 'Home',
    about: 'About',
    projects: 'Projects',
    contact: 'Contact',
  },
  landing: {
    title: 'Welcome',
    subtitle: 'Discover my projects and get in touch.',
    logoAlt: 'Animated michaelschreiber.net logo as a connected IT network',
    viewProjects: 'View Projects',
    getInTouch: 'Get in Touch',
  },
  projects: {
    title: 'My Projects',
    subtitle: 'A selection of my current work',
    projectTitle: 'myStandby',
    projectDescription: 'An Android app for managing on-call duties, developed with Kotlin',
    projectLinkText: 'View on Play Store',
    projectTitleMichaelSchreiberNet: 'michaelschreiber.net',
    projectDescriptionMichaelSchreiberNet: 'A Vue application that lists my personal projects.',
    projectLinkTextGithub: 'View on GitHub',
  },
  contact: {
    title: 'Contact',
    subtitle: "Let's get in touch",
    contactInfo: 'Contact Information',
    email: 'Email',
    emailValue: "michael.schreiber{'@'}outlook.com",
    phone: 'Phone',
    phoneValue: '+49 (0) 15679 724718',
    location: 'Location',
    locationValue: 'Leipheim',
    form: {
      name: 'Name',
      namePlaceholder: 'Your Name',
      email: 'Email',
      emailPlaceholder: "your.email{'@'}example.com",
      message: 'Message',
      messagePlaceholder: 'Your message...',
      submit: 'Send Message',
      submitting: 'Sending...',
      successMessage: 'Thank you for your message! I will get back to you soon.',
      errorMessage: 'There was a problem sending the message. Please try again.',
    },
  },
  about: {
    title: 'About Me',
    businessCard: {
      name: 'Michael Schreiber',
      role: 'Senior Software Engineer',
      email: 'Email',
      xing: 'Xing Profile',
      avatarAlt: 'Profile picture of Michael Schreiber',
    },
    timeline: {
      title: 'Professional Experience',
      entries: {
        mercedesBenz: {
          date: 'April 2022 – present',
          company: 'Mercedes-Benz Tech Innovation',
          role: 'Senior Software Engineer',
        },
        daimlerTssSenior: {
          date: 'May 2018 - March 2022',
          company: 'Daimler TSS GmbH',
          role: 'Senior Software Engineer',
        },
        daimlerTssConsultant: {
          date: 'November 2015 – April 2018',
          company: 'Daimler TSS GmbH',
          role: 'Mobile Consultant',
        },
        daimlerWerkstudent: {
          date: 'March 2012 – October 2015',
          company: 'Daimler AG',
          role: 'Working Student (App Development)',
        },
        uniUlm: {
          date: 'October 2013 – October 2015',
          company: 'University of Ulm',
          role: 'Computer Science',
        },
        hsUlm: {
          date: 'October 2010 – August 2013',
          company: 'Ulm University of Applied Sciences',
          role: 'Computer Engineering',
        },
        toUlm: {
          date: 'September 2008 – July 2010',
          company: 'Technische Oberschule Ulm',
          role: '\n' + 'Subject-specific university entrance qualification',
        },
        asys: {
          date: 'September 2005 – July 2008',
          company: 'ASYS GmbH',
          role: 'Apprenticeship: Mechatronics Technician for Automation Systems',
        },
      },
    },
  },
}

export default en
