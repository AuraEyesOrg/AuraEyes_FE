export const UPLOAD_SCREENING_CONSENT_CONTENT =
  'By continuing, you agree that your retinal images and AI analysis results can be processed and securely stored for diagnosis, medical review, and improving service quality.';

export const buildBookingShareConsentContent = (
  shareRetinalImages: boolean,
  shareAiResults: boolean
): string => {
  const retinalConsent = shareRetinalImages ? 'Agreed' : 'Declined';
  const aiConsent = shareAiResults ? 'Agreed' : 'Declined';

  return [
    'Consultation booking data sharing consent.',
    `Retinal images sharing: ${retinalConsent}.`,
    `AI analysis results sharing: ${aiConsent}.`,
  ].join(' ');
};
