import PatientLayout from '../components/PatientLayout';
import { WebsiteFeedbackForm } from '../components/feedback';

export const HelpFeedbackPage = () => {
  return (
    <PatientLayout>
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-(--text-primary)">
            Help & Feedback
          </h1>
          <p className="mt-2 text-(--text-secondary)">
            Share your website experience to help us make retinal care journeys
            better.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <section className="rounded-2xl border border-(--border-color) bg-(--bg-primary) p-6">
            <h2 className="text-lg font-semibold text-(--text-primary)">
              Why your feedback matters
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-(--text-secondary)">
              <li>Help us improve booking and consultation usability.</li>
              <li>Highlight bug issues before they impact more patients.</li>
              <li>Suggest features that make your care journey smoother.</li>
            </ul>
          </section>

          <WebsiteFeedbackForm />
        </div>
      </div>
    </PatientLayout>
  );
};

export default HelpFeedbackPage;
