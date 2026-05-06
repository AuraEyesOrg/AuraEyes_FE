import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle, Stethoscope } from 'lucide-react';
import Spinner from '@/components/ui/spinner';

interface ShareCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  patientName: string;
  content: string;
  onChangeContent: (content: string) => void;
  caseSnapshot: {
    summary: string;
    findings: string;
    riskLevel: string;
    confidenceScore: number | null;
    originalImageUrls: string[];
  };
  t: (key: string, fallback: string) => string;
}

export function ShareCaseModal({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
  patientName,
  content,
  onChangeContent,
  caseSnapshot,
  t,
}: ShareCaseModalProps) {
  const previewContent = useMemo(() => {
    const parts: string[] = [];

    if (caseSnapshot.summary) {
      parts.push(
        `📋 **${t('ProfessionalNetwork.shareClinicCaseModal.summary.label', 'Summary')}**: ${caseSnapshot.summary}`
      );
    }

    if (caseSnapshot.riskLevel) {
      parts.push(
        `⚠️ **${t('ProfessionalNetwork.shareClinicCaseModal.fields.riskLevel', 'Risk Level')}**: ${caseSnapshot.riskLevel}`
      );
    }

    if (caseSnapshot.confidenceScore !== null) {
      parts.push(
        `✓ **${t('ProfessionalNetwork.shareClinicCaseModal.fields.confidence', 'Confidence')}**: ${caseSnapshot.confidenceScore}%`
      );
    }

    if (caseSnapshot.findings) {
      parts.push(
        `🔍 **${t('ProfessionalNetwork.shareClinicCaseModal.findings.label', 'Findings')}**: ${caseSnapshot.findings}`
      );
    }

    if (content.trim()) {
      parts.push(
        `\n📝 **${t('ProfessionalNetwork.shareClinicCaseModal.doctorNotes.label', 'Doctor Notes')}**:\n${content}`
      );
    }

    return parts.join('\n\n');
  }, [caseSnapshot, content, t]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 top-1/2 z-[70] mx-auto flex h-[90vh] w-full max-w-4xl -translate-y-1/2 flex-col overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-2xl dark:border-[#1e3a5f] dark:bg-[#0a1f44]"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-6 dark:border-[#1e3a5f]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400">
                  <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {t(
                      'Ophthalmologist.consultations.chat.shareCase.modalTitle',
                      'Share Case to Aura Network'
                    )}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-gray-400">
                    {t(
                      'Ophthalmologist.consultations.chat.shareCase.modalSubtitle',
                      'Post clinical findings for professional discussion'
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-slate-100 dark:hover:bg-[#1e3a5f]"
              >
                <X className="h-5 w-5 text-slate-400" />
              </button>
            </div>

            <div className="flex flex-1 flex-col overflow-hidden md:flex-row min-h-0">
              {/* Left Column: Data */}
              <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                <div className="space-y-6">
                  {/* Images */}
                  {caseSnapshot.originalImageUrls.length > 0 && (
                    <div>
                      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                        {t(
                          'Ophthalmologist.consultations.chat.shareCase.retinalImages',
                          'Retinal Images'
                        )}
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        {caseSnapshot.originalImageUrls
                          .slice(0, 4)
                          .map((url, i) => (
                            <div
                              key={i}
                              className="aspect-square overflow-hidden rounded-2xl border border-slate-200 dark:border-[#1e3a5f]"
                            >
                              <img
                                src={url}
                                alt="Retinal"
                                className="h-full w-full object-cover"
                              />
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Clinical Data */}
                  <div className="rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200 dark:bg-[#0a1929]/50 dark:ring-[#1e3a5f]">
                    <h4 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      {t(
                        'Ophthalmologist.consultations.chat.shareCase.clinicalData',
                        'Clinical Snapshot'
                      )}
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          {t(
                            'Ophthalmologist.consultations.chat.shareCase.patientName',
                            'Patient'
                          )}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {patientName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          {t(
                            'Ophthalmologist.consultations.chat.shareCase.riskLevel',
                            'Risk Level'
                          )}
                        </span>
                        <span className="rounded-full bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-600 dark:bg-rose-900/30">
                          {caseSnapshot.riskLevel}
                        </span>
                      </div>
                    </div>
                  </div>

                  {caseSnapshot.summary && (
                    <div>
                      <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                        {t(
                          'Ophthalmologist.consultations.chat.shareCase.aiSummary',
                          'AI Summary'
                        )}
                      </h4>
                      <p className="text-sm leading-relaxed text-slate-600 dark:text-gray-300 italic">
                        "{caseSnapshot.summary}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto border-l border-slate-100 bg-slate-50/50 p-6 dark:border-[#1e3a5f] dark:bg-[#0a1929]/20">
                <div className="flex flex-col gap-6">
                  {/* Input */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                      {t(
                        'Ophthalmologist.consultations.chat.shareCase.doctorNotes',
                        'Professional Notes'
                      )}
                    </label>
                    <textarea
                      value={content}
                      onChange={(e) => onChangeContent(e.target.value)}
                      placeholder={t(
                        'Ophthalmologist.consultations.chat.shareCase.placeholder',
                        'Add your clinical observations, questions for colleagues, or case context...'
                      )}
                      className="min-h-[140px] w-full resize-none rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none ring-primary/20 transition-all focus:border-primary focus:ring-4 dark:border-[#1e3a5f] dark:bg-[#0a1f44] dark:text-white"
                    />
                  </div>

                  {/* Preview */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-gray-400">
                      {t(
                        'Ophthalmologist.consultations.chat.shareCase.postPreview',
                        'Post Preview'
                      )}
                    </label>
                    <div className="rounded-2xl border border-dashed border-slate-300 p-4 dark:border-slate-700">
                      {content.trim() ? (
                        <div className="whitespace-pre-wrap text-sm text-slate-600 dark:text-gray-400">
                          {previewContent}
                        </div>
                      ) : (
                        <div className="flex h-full flex-col items-center justify-center text-center opacity-40">
                          <AlertCircle className="mb-2 h-8 w-8" />
                          <p className="text-xs">
                            {t(
                              'Ophthalmologist.consultations.chat.shareCase.previewEmpty',
                              'Enter notes to generate preview'
                            )}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-white p-6 dark:border-[#1e3a5f] dark:bg-[#0a1f44]">
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-500 hover:bg-slate-50 dark:text-gray-400 dark:hover:bg-[#1e3a5f]"
              >
                {t('Ophthalmologist.common.cancel', 'Cancel')}
              </button>
              <button
                onClick={onSubmit}
                disabled={isSubmitting || !content.trim()}
                className="flex items-center gap-2 rounded-xl bg-cyan-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-600/20 transition-all hover:bg-cyan-700 hover:shadow-cyan-600/40 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Spinner size={16} className="text-white" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                {t(
                  'Ophthalmologist.consultations.chat.shareCase.submit',
                  'Post to Network'
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
