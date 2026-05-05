/**
 * Share Clinic Case Modal
 * Displays consultation case with images and findings
 * Live preview updates as doctor types notes
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, AlertCircle } from 'lucide-react';
import type { ConsultationSessionDto } from '@/types/consultation';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

interface ShareClinicCaseModalProps {
  session: ConsultationSessionDto | null;
  isOpen: boolean;
  onClose: () => void;
  onShare: (content: string) => void;
  isLoading?: boolean;
}

export function ShareClinicCaseModal({
  session,
  isOpen,
  onClose,
  onShare,
  isLoading = false,
}: ShareClinicCaseModalProps) {
  const { t } = useSafeTranslation();
  const [doctorNotes, setDoctorNotes] = useState('');

  const handleShare = useCallback(() => {
    if (!doctorNotes.trim()) return;
    onShare(doctorNotes);
    setDoctorNotes('');
    onClose();
  }, [doctorNotes, onShare, onClose]);

  const caseSnapshot = useMemo(() => session?.caseSnapshot, [session]);

  const previewContent = useMemo(() => {
    if (!caseSnapshot) return '';

    const parts: string[] = [];

    // Case summary
    if (caseSnapshot.summary) {
      parts.push(
        `📋 **${t('ProfessionalNetwork.shareClinicCaseModal.summary.label', 'Summary')}**: ${caseSnapshot.summary}`
      );
    }

    // Risk level and confidence
    if (caseSnapshot.riskLevel) {
      parts.push(
        `⚠️ **${t('ProfessionalNetwork.shareClinicCaseModal.fields.riskLevel', 'Risk Level')}**: ${caseSnapshot.riskLevel}`
      );
    }
    if (
      caseSnapshot.confidenceScore !== null &&
      caseSnapshot.confidenceScore !== undefined
    ) {
      parts.push(
        `✓ **${t('ProfessionalNetwork.shareClinicCaseModal.fields.confidence', 'Confidence')}**: ${(caseSnapshot.confidenceScore * 100).toFixed(1)}%`
      );
    }

    // Findings
    if (caseSnapshot.findings) {
      parts.push(
        `🔍 **${t('ProfessionalNetwork.shareClinicCaseModal.findings.label', 'Findings')}**: ${caseSnapshot.findings}`
      );
    }

    // Symptoms
    if (caseSnapshot.symptoms && caseSnapshot.symptoms.length > 0) {
      parts.push(
        `🩺 **${t('ProfessionalNetwork.shareClinicCaseModal.symptoms.label', 'Symptoms')}**: ${caseSnapshot.symptoms.join(', ')}`
      );
    }

    // Doctor notes
    if (doctorNotes.trim()) {
      parts.push(
        `\n📝 **${t('ProfessionalNetwork.shareClinicCaseModal.doctorNotes.label', 'Doctor Notes')}**:\n${doctorNotes}`
      );
    }

    return parts.join('\n\n');
  }, [caseSnapshot, doctorNotes, t]);

  if (!session || !caseSnapshot) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-4 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[90vw] md:max-w-4xl md:h-[90vh] bg-white dark:bg-slate-900 rounded-xl shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {t(
                  'ProfessionalNetwork.shareClinicCaseModal.title',
                  'Share Clinic Case'
                )}
              </h2>
              <button
                onClick={onClose}
                disabled={isLoading}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-hidden flex flex-col md:flex-row gap-4 p-6">
              {/* Left: Images + Case Summary */}
              <div className="flex-1 flex flex-col gap-4 overflow-y-auto">
                {/* Case Type Badge */}
                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 font-medium">
                    🔬{' '}
                    {t(
                      'ProfessionalNetwork.postTypes.casePresentation',
                      'Case Presentation'
                    )}
                  </span>
                </div>

                {/* Patient Info */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                    {t(
                      'ProfessionalNetwork.shareClinicCaseModal.caseInformation.title',
                      'Case Information'
                    )}
                  </h3>
                  <div className="space-y-2 text-sm">
                    {session.patientName && (
                      <p>
                        <span className="text-gray-600 dark:text-gray-400">
                          {t(
                            'ProfessionalNetwork.shareClinicCaseModal.fields.patient',
                            'Patient'
                          )}
                          :
                        </span>{' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {session.patientName}
                        </span>
                      </p>
                    )}
                    {caseSnapshot.riskLevel && (
                      <p>
                        <span className="text-gray-600 dark:text-gray-400">
                          {t(
                            'ProfessionalNetwork.shareClinicCaseModal.fields.riskLevel',
                            'Risk Level'
                          )}
                          :
                        </span>{' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {caseSnapshot.riskLevel}
                        </span>
                      </p>
                    )}
                    {caseSnapshot.confidenceScore !== null && (
                      <p>
                        <span className="text-gray-600 dark:text-gray-400">
                          {t(
                            'ProfessionalNetwork.shareClinicCaseModal.fields.confidence',
                            'Confidence'
                          )}
                          :
                        </span>{' '}
                        <span className="font-medium text-gray-900 dark:text-white">
                          {(caseSnapshot.confidenceScore * 100).toFixed(1)}%
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Retinal Images */}
                {caseSnapshot.originalImageUrls &&
                  caseSnapshot.originalImageUrls.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        {t(
                          'ProfessionalNetwork.shareClinicCaseModal.retinalImages.title',
                          'Retinal Images ({{count}})',
                          { count: caseSnapshot.originalImageUrls.length }
                        )}
                      </h3>
                      <div className="grid grid-cols-2 gap-3">
                        {caseSnapshot.originalImageUrls.map((imageUrl, idx) => (
                          <div
                            key={idx}
                            className="aspect-square rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                          >
                            <img
                              src={imageUrl}
                              alt={t(
                                'ProfessionalNetwork.shareClinicCaseModal.retinalImages.alt',
                                'Retinal image {{index}}',
                                { index: idx + 1 }
                              )}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"%3E%3Cpath stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14" /%3E%3C/svg%3E';
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Case Findings */}
                {caseSnapshot.findings && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {t(
                        'ProfessionalNetwork.shareClinicCaseModal.findings.label',
                        'Findings'
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-slate-50 dark:bg-slate-800/50 rounded p-3">
                      {caseSnapshot.findings}
                    </p>
                  </div>
                )}

                {/* Symptoms */}
                {caseSnapshot.symptoms && caseSnapshot.symptoms.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {t(
                        'ProfessionalNetwork.shareClinicCaseModal.symptoms.label',
                        'Symptoms'
                      )}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {caseSnapshot.symptoms.map((symptom, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Summary */}
                {caseSnapshot.summary && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                      {t(
                        'ProfessionalNetwork.shareClinicCaseModal.summary.label',
                        'Summary'
                      )}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 bg-slate-50 dark:bg-slate-800/50 rounded p-3">
                      {caseSnapshot.summary}
                    </p>
                  </div>
                )}
              </div>

              {/* Right: Input + Live Preview */}
              <div className="flex-1 flex flex-col gap-4 overflow-hidden border-l border-slate-200 dark:border-slate-700 md:pl-4">
                {/* Doctor Notes Input */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    {t(
                      'ProfessionalNetwork.shareClinicCaseModal.doctorNotes.label',
                      'Add Doctor Notes'
                    )}
                  </label>
                  <textarea
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    placeholder={t(
                      'ProfessionalNetwork.shareClinicCaseModal.doctorNotes.placeholder',
                      'Type your observations, recommendations, or additional notes...'
                    )}
                    disabled={isLoading}
                    className="flex-1 min-h-[120px] p-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>

                {/* Live Preview */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-900 dark:text-white">
                    {t(
                      'ProfessionalNetwork.shareClinicCaseModal.preview.title',
                      'Post Preview'
                    )}
                  </label>
                  <div className="flex-1 overflow-y-auto p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/30">
                    {previewContent ? (
                      <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                        {previewContent}
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                        <div className="text-center">
                          <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-xs">
                            {t(
                              'ProfessionalNetwork.shareClinicCaseModal.preview.empty',
                              'Type notes to see preview'
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={onClose}
                disabled={isLoading}
                className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 text-gray-900 dark:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('ProfessionalNetwork.common.actions.cancel', 'Cancel')}
              </button>
              <button
                onClick={handleShare}
                disabled={isLoading || !doctorNotes.trim()}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium inline-flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isLoading
                  ? t(
                      'ProfessionalNetwork.shareClinicCaseModal.actions.posting',
                      'Posting...'
                    )
                  : t(
                      'ProfessionalNetwork.shareClinicCaseModal.actions.postCase',
                      'Post Case'
                    )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
