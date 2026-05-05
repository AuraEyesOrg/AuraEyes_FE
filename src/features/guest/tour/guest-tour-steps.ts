import type { Step } from 'react-joyride';

export interface GuestTourMessages {
  logo: string;
  navAbout: string;
  navHowItWorks: string;
  navEthics: string;
  navContact: string;
  bookAppointment: string;
  patientPortalLogin: string;
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
    target: '[data-tour="guest-nav-ethics"]',
    content: messages.navEthics,
    placement: 'bottom',
  },
  {
    target: '[data-tour="guest-nav-contact"]',
    content: messages.navContact,
    placement: 'bottom',
  },
  {
    target: '[data-tour="guest-book-appointment"]',
    content: messages.bookAppointment,
    placement: 'top',
  },
  {
    target: '[data-tour="guest-patient-portal-login"]',
    content: messages.patientPortalLogin,
    placement: 'bottom',
  },
];
