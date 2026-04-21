import PatientLayout from '../components/PatientLayout';
import { WebsiteFeedbackForm } from '../components/feedback';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

export const HelpFeedbackPage = () => {
  const { t } = useSafeTranslation();

  return (
    <PatientLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-(--text-primary)">
            {t('PatientHelpFeedback.page.title', 'Help & Feedback')}
          </h1>
          <p className="mt-2 text-(--text-secondary)">
            {t(
              'PatientHelpFeedback.page.subtitle',
              'Share your website experience to help us make retinal care journeys better.'
            )}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <section className="rounded-2xl border border-(--border-color) bg-(--bg-primary) p-6">
            <h2 className="text-lg font-semibold text-(--text-primary)">
              {t(
                'PatientHelpFeedback.whyFeedbackMatters.title',
                'Why your feedback matters'
              )}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-(--text-secondary)">
              <li>
                {t(
                  'PatientHelpFeedback.whyFeedbackMatters.items.bookingAndConsultation',
                  'Help us improve booking and consultation usability.'
                )}
              </li>
              <li>
                {t(
                  'PatientHelpFeedback.whyFeedbackMatters.items.bugReporting',
                  'Highlight bug issues before they impact more patients.'
                )}
              </li>
              <li>
                {t(
                  'PatientHelpFeedback.whyFeedbackMatters.items.featureSuggestions',
                  'Suggest features that make your care journey smoother.'
                )}
              </li>
            </ul>
          </section>

          <WebsiteFeedbackForm />
        </div>
      </div>
    </PatientLayout>
  );
};

export default HelpFeedbackPage;
