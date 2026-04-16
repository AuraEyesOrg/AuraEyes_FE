import type { Step } from 'react-joyride';

export interface GuestTourMessages {
  logo: string;
  navAbout: string;
  navHowItWorks: string;
  aboutMission: string;
  contactOrganisation: string;
  getStartedPatient: string;
  getStartedDoctor: string;
}

export const buildGuestTourSteps = (messages: GuestTourMessages): Step[] => [
  {
    target: '[data-tour="guest-logo-home"]',
    content: messages.logo,
    skipBeacon: true,
    placement: 'bottom',
  },
  {
    target: '[data-tour="guest-nav-about"]',
    content: messages.navAbout,
    placement: 'bottom',
  },
  {
    target: '[data-tour="guest-nav-how-it-works"]',
    content: messages.navHowItWorks,
    placement: 'bottom',
  },
  {
    target: '[data-tour="guest-home-mission"]',
    content: messages.aboutMission,
    placement: 'top',
  },
  {
    target: '[data-tour="guest-nav-contact-orga"]',
    content: messages.contactOrganisation,
    placement: 'bottom',
  },
  {
    target: '[data-tour="guest-cta-get-started"]',
    content: messages.getStartedPatient,
    placement: 'bottom',
  },
  {
    target: '[data-tour="guest-cta-get-started"]',
    content: messages.getStartedDoctor,
    placement: 'bottom',
  },
];
