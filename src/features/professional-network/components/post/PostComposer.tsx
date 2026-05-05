/**
 * Post Composer Component
 * Component for creating new posts with file upload and anonymization consent
 */

import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Image,
  FileText,
  FlaskConical,
  HelpCircle,
  Link2,
  X,
} from 'lucide-react';
import type { PostCategory } from '../../types';
import { useCreatePost } from '../../hooks/useCreatePost';
import useAuthStore from '@/store/auth-store';
import { LoadingButton } from '@/components/ui/loading-button';
import UserAvatar from '@/components/ui/UserAvatar';
import { useConsultationSession } from '@/features/consultation/hooks';
import { getConsultationSessions } from '@/features/consultation/api/consultation.api';
import { SessionStatus } from '@/types/consultation';
import { ShareClinicCaseModal } from './ShareClinicCaseModal';
import { resolveAuthorType } from '../../utils/authorType';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';

const postTypes: {
  type: PostCategory;
  icon: React.ElementType;
  labelKey: string;
  labelFallback: string;
}[] = [
  {
    type: 'KnowledgeShare',
    icon: FileText,
    labelKey: 'ProfessionalNetwork.postTypes.knowledgeShare',
    labelFallback: 'Knowledge Share',
  },
  {
    type: 'CasePresentation',
    icon: FlaskConical,
    labelKey: 'ProfessionalNetwork.postTypes.casePresentation',
    labelFallback: 'Case Presentation',
  },
  {
    type: 'PeerDiscussion',
    icon: HelpCircle,
    labelKey: 'ProfessionalNetwork.postTypes.peerDiscussion',
    labelFallback: 'Peer Discussion',
  },
  {
    type: 'Announcement',
    icon: FileText,
    labelKey: 'ProfessionalNetwork.postTypes.announcement',
    labelFallback: 'Announcement',
  },
];

export function PostComposer() {
  const { t } = useSafeTranslation();
  const [content, setContent] = useState('');
  const [selectedType, setSelectedType] =
    useState<PostCategory>('KnowledgeShare');
  const [caseSource, setCaseSource] = useState<'external' | 'internal'>(
    'external'
  );
  const [selectedInternalSessionId, setSelectedInternalSessionId] =
    useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientGender, setPatientGender] = useState('');
  const [isCaseDisclaimerAccepted, setIsCaseDisclaimerAccepted] =
    useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isAnonymizationConfirmed, setIsAnonymizationConfirmed] =
    useState(false);
  const [isShareClinicCaseModalOpen, setIsShareClinicCaseModalOpen] =
    useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();
  const { user } = useAuthStore();

  const isCasePresentation = selectedType === 'CasePresentation';
  const hasFiles = files.length > 0;
  const isInternalCase = isCasePresentation && caseSource === 'internal';

  const { data: internalSessionsData, isLoading: isInternalSessionsLoading } =
    useQuery({
      queryKey: ['network', 'internal-case-sessions', user?.roleId],
      enabled: Boolean(
        isExpanded && isCasePresentation && caseSource === 'internal'
      ),
      staleTime: 30_000,
      queryFn: async () => {
        const allItems = [];
        let pageNumber = 1;
        let hasNext = true;

        while (hasNext && pageNumber <= 20) {
          const response = await getConsultationSessions({
            ophthalmologistId: user?.roleId ?? undefined,
            status: SessionStatus.Completed,
            pageNumber,
            pageSize: 100,
          });

          allItems.push(...response.items);
          hasNext = response.hasNext;
          pageNumber += 1;
        }

        return allItems;
      },
    });

  const internalSessions = useMemo(
    () => internalSessionsData ?? [],
    [internalSessionsData]
  );

  const selectedSessionSummary = useMemo(
    () =>
      internalSessions.find(
        (session) => session.id === selectedInternalSessionId
      ),
    [internalSessions, selectedInternalSessionId]
  );

  const { data: selectedSessionDetail } = useConsultationSession(
    selectedInternalSessionId,
    {
      enabled: Boolean(selectedInternalSessionId),
    }
  );

  const selectedCaseSnapshot =
    selectedSessionDetail?.caseSnapshot ??
    selectedSessionSummary?.caseSnapshot ??
    null;
  const selectedCaseDiagnosis =
    selectedCaseSnapshot?.findings ?? selectedCaseSnapshot?.summary ?? '';
  const hasSelectedInternalCaseImage = Boolean(
    selectedCaseSnapshot?.originalImageUrls?.length ||
    selectedCaseSnapshot?.annotatedImageUrl
  );
  const hasSelectedInternalDiagnosis = Boolean(selectedCaseDiagnosis.trim());
  const hasCaseMedia = hasFiles || hasSelectedInternalCaseImage;
  const hasContent = content.trim() !== '';

  const hasRequiredCaseMetadata =
    !isCasePresentation ||
    (caseSource === 'internal'
      ? isCaseDisclaimerAccepted &&
        selectedInternalSessionId !== '' &&
        hasSelectedInternalCaseImage &&
        hasSelectedInternalDiagnosis
      : isCaseDisclaimerAccepted && hasCaseMedia);
  const isPostDisabled =
    (!hasContent && !(isCasePresentation && isInternalCase)) ||
    createPost.isPending ||
    (hasFiles && !isAnonymizationConfirmed) ||
    !hasRequiredCaseMetadata;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    setFiles((prev) => [...prev, ...selectedFiles]);

    // Generate previews for image files
    selectedFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPreviews((prev) => [...prev, event.target?.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviews((prev) => [...prev, '']);
      }
    });

    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
    // If no files left, reset checkbox
    if (files.length <= 1) {
      setIsAnonymizationConfirmed(false);
    }
  };

  const handleSubmit = () => {
    if (isPostDisabled) return;

    const formData = new FormData();
    const normalizedContent = content.trim();

    formData.append(
      'authorType',
      resolveAuthorType(user?.roles, 'Ophthalmologist')
    );
    formData.append('content', normalizedContent);
    formData.append('category', selectedType);
    formData.append('visibility', 'Public');
    formData.append('allowComments', 'true');
    formData.append('isInternalCase', String(isInternalCase));
    formData.append(
      'isAnonymizationConfirmed',
      String(isInternalCase || isAnonymizationConfirmed)
    );

    if (isCasePresentation && isInternalCase) {
      formData.append('consultationSessionId', selectedInternalSessionId);
    }

    if (isCasePresentation && !isInternalCase) {
      if (patientAge.trim()) {
        formData.append('patientAge', patientAge.trim());
      }
      if (patientGender.trim()) {
        formData.append('patientGender', patientGender.trim());
      }
    }

    if (!isInternalCase) {
      files.forEach((file) => {
        formData.append('attachments', file);
      });
    }

    createPost.mutate(formData, {
      onSuccess: () => {
        setContent('');
        setCaseSource('external');
        setSelectedInternalSessionId('');
        setFiles([]);
        setPreviews([]);
        setPatientAge('');
        setPatientGender('');
        setIsCaseDisclaimerAccepted(false);
        setIsAnonymizationConfirmed(false);
        setIsExpanded(false);
      },
    });
  };

  return (
    <div className="flex gap-x-3 px-4 py-3 border-b border-light-border">
      <UserAvatar
        fullName={user?.fullName}
        avatarUrl={user?.avatarUrl}
        fallbackName={t('ProfessionalNetwork.common.user', 'User')}
        size="md"
        className="shrink-0"
        fallbackClassName="bg-brand/20 text-brand"
      />
      <div className="flex-1 min-w-0">
        <textarea
          placeholder={t(
            'ProfessionalNetwork.postComposer.placeholder',
            'Share insights with your network...'
          )}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          className={`w-full bg-transparent text-xl text-text-main placeholder:text-text-muted focus:outline-none resize-none hover-animation ${
            isExpanded ? 'min-h-[100px]' : 'min-h-[52px] py-3'
          }`}
        />

        {/* Files Preview */}
        {previews.length > 0 && (
          <div className="grid grid-cols-2 gap-0.5 mt-3 rounded-2xl overflow-hidden border border-light-border">
            {previews.map((preview, index) => (
              <div key={index} className="relative">
                {preview ? (
                  <img
                    src={preview}
                    alt={files[index]?.name}
                    className="w-full h-32 object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                    <div className="text-center">
                      <FileText className="w-6 h-6 text-text-muted mx-auto mb-1" />
                      <p className="text-xs text-text-muted truncate max-w-[100px]">
                        {files[index]?.name}
                      </p>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1.5 bg-black/70 text-white rounded-full hover:bg-black/80 hover-animation"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {isExpanded && (
          <>
            {/* Post Type Selection */}
            <div className="flex items-center gap-2 mt-3 pb-3 border-b border-light-border">
              <span className="text-[13px] text-text-muted">
                {t('ProfessionalNetwork.postComposer.typeLabel', 'Type:')}
              </span>
              <div className="flex gap-1">
                {postTypes.map(
                  ({ type, icon: Icon, labelKey, labelFallback }) => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium hover-animation ${
                        selectedType === type
                          ? 'bg-brand-primary text-white'
                          : 'bg-main-search-background text-text-muted hover:bg-brand-soft'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {t(labelKey, labelFallback)}
                    </button>
                  )
                )}
              </div>
            </div>

            {isCasePresentation && (
              <div className="mt-3 space-y-3 rounded-xl border border-cyan-200 bg-cyan-50/60 p-3 dark:border-cyan-800 dark:bg-cyan-900/20">
                <p className="text-[13px] font-semibold text-cyan-800 dark:text-cyan-200">
                  {t(
                    'ProfessionalNetwork.postComposer.caseSource.title',
                    'Case source'
                  )}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setCaseSource('external')}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      caseSource === 'external'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white text-cyan-800 border border-cyan-200 dark:bg-slate-900 dark:text-cyan-200 dark:border-cyan-700'
                    }`}
                  >
                    {t(
                      'ProfessionalNetwork.postComposer.caseSource.externalCase',
                      'External Case'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setCaseSource('internal')}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                      caseSource === 'internal'
                        ? 'bg-cyan-600 text-white'
                        : 'bg-white text-cyan-800 border border-cyan-200 dark:bg-slate-900 dark:text-cyan-200 dark:border-cyan-700'
                    }`}
                  >
                    {t(
                      'ProfessionalNetwork.postComposer.caseSource.internalCase',
                      'Internal Case'
                    )}
                  </button>
                </div>

                {caseSource === 'internal' && (
                  <div className="space-y-3 rounded-lg border border-cyan-200 bg-white p-3 dark:border-cyan-800 dark:bg-slate-900/40">
                    <label className="text-xs font-semibold text-cyan-800 dark:text-cyan-200">
                      {t(
                        'ProfessionalNetwork.postComposer.internal.selectConsultationCase',
                        'Select consultation case'
                      )}
                    </label>
                    <select
                      value={selectedInternalSessionId}
                      onChange={(e) =>
                        setSelectedInternalSessionId(e.target.value)
                      }
                      className="w-full rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-cyan-800 dark:bg-slate-900"
                    >
                      <option value="">
                        {isInternalSessionsLoading
                          ? t(
                              'ProfessionalNetwork.postComposer.internal.loadingInternalCases',
                              'Loading internal cases...'
                            )
                          : t(
                              'ProfessionalNetwork.postComposer.internal.chooseInternalCase',
                              'Choose an internal case'
                            )}
                      </option>
                      {internalSessions.map((session) => (
                        <option key={session.id} value={session.id}>
                          {t(
                            'ProfessionalNetwork.postComposer.internal.caseOptionLabel',
                            '{{patient}} - {{type}} - {{status}} - #{{id}}',
                            {
                              patient:
                                session.patientName ||
                                t(
                                  'ProfessionalNetwork.postComposer.internal.anonymousPatient',
                                  'Anonymous patient'
                                ),
                              type: session.typeName,
                              status: session.statusName,
                              id: session.id.slice(0, 8).toUpperCase(),
                            }
                          )}
                        </option>
                      ))}
                    </select>

                    {selectedCaseSnapshot && (
                      <div className="rounded-lg border border-cyan-200 bg-cyan-50 p-3 dark:border-cyan-800 dark:bg-cyan-900/20">
                        <p className="text-[12px] font-semibold text-cyan-900 dark:text-cyan-200">
                          {t(
                            'ProfessionalNetwork.postComposer.internal.previewTitle',
                            'Internal case preview (anonymized)'
                          )}
                        </p>
                        <div className="mt-2 grid grid-cols-2 gap-2">
                          <div className="overflow-hidden rounded-lg border border-cyan-200 bg-white dark:border-cyan-800 dark:bg-slate-900">
                            {selectedCaseSnapshot.originalImageUrls?.[0] ? (
                              <img
                                src={selectedCaseSnapshot.originalImageUrls[0]}
                                alt={t(
                                  'ProfessionalNetwork.postComposer.internal.retinalCasePreviewAlt',
                                  'Retinal case preview'
                                )}
                                className="h-24 w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-24 items-center justify-center text-xs text-cyan-800 dark:text-cyan-300">
                                {t(
                                  'ProfessionalNetwork.postComposer.internal.noImagePreview',
                                  'No image preview'
                                )}
                              </div>
                            )}
                          </div>
                          <div className="rounded-lg border border-cyan-200 bg-white p-2 dark:border-cyan-800 dark:bg-slate-900">
                            <p className="text-[11px] font-semibold text-cyan-800 dark:text-cyan-200">
                              {t(
                                'ProfessionalNetwork.postComposer.internal.medicalDiagnosis',
                                'Medical diagnosis'
                              )}
                            </p>
                            <p className="mt-1 text-[11px] leading-snug text-cyan-900 dark:text-cyan-100 line-clamp-5">
                              {selectedCaseDiagnosis ||
                                t(
                                  'ProfessionalNetwork.postComposer.internal.noFinalDiagnosis',
                                  'No final doctor diagnosis available for this case.'
                                )}
                            </p>
                          </div>
                        </div>
                        <p className="mt-2 text-[11px] text-cyan-800 dark:text-cyan-200">
                          {t(
                            'ProfessionalNetwork.postComposer.internal.patientIdentityHidden',
                            'Patient identity is hidden. Only medical snapshot is shared.'
                          )}
                        </p>
                        <button
                          type="button"
                          onClick={() => setIsShareClinicCaseModalOpen(true)}
                          className="mt-3 w-full rounded-lg bg-cyan-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-cyan-700 dark:bg-cyan-700 dark:hover:bg-cyan-600"
                        >
                          {t(
                            'ProfessionalNetwork.postComposer.internal.addDoctorNotes',
                            'Add doctor notes'
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {caseSource === 'external' && (
                  <>
                    <p className="text-[13px] font-semibold text-cyan-800 dark:text-cyan-200">
                      {t(
                        'ProfessionalNetwork.postComposer.external.allowedInfoOptional',
                        'Allowed anonymized patient info (optional)'
                      )}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="number"
                        min={0}
                        max={120}
                        value={patientAge}
                        onChange={(e) => setPatientAge(e.target.value)}
                        placeholder={t(
                          'ProfessionalNetwork.postComposer.external.patientAge',
                          'Patient age'
                        )}
                        className="w-full rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-cyan-800 dark:bg-slate-900"
                      />
                      <select
                        value={patientGender}
                        onChange={(e) => setPatientGender(e.target.value)}
                        className="w-full rounded-lg border border-cyan-200 bg-white px-3 py-2 text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-cyan-500 dark:border-cyan-800 dark:bg-slate-900"
                      >
                        <option value="">
                          {t(
                            'ProfessionalNetwork.postComposer.external.patientGender',
                            'Patient gender'
                          )}
                        </option>
                        <option value="Male">
                          {t('ProfessionalNetwork.common.gender.male', 'Male')}
                        </option>
                        <option value="Female">
                          {t(
                            'ProfessionalNetwork.common.gender.female',
                            'Female'
                          )}
                        </option>
                        <option value="Other">
                          {t(
                            'ProfessionalNetwork.common.gender.other',
                            'Other'
                          )}
                        </option>
                      </select>
                    </div>
                    <div className="rounded-lg border border-cyan-200 bg-white p-2 text-[11px] text-cyan-800 dark:border-cyan-800 dark:bg-slate-900 dark:text-cyan-200">
                      {t(
                        'ProfessionalNetwork.postComposer.external.allowedDataHint',
                        'Allowed only: age, gender, and medical images. Do not include name, address, or phone number.'
                      )}
                    </div>
                  </>
                )}
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={isCaseDisclaimerAccepted}
                    onChange={(e) =>
                      setIsCaseDisclaimerAccepted(e.target.checked)
                    }
                    className="mt-0.5 w-4 h-4 rounded border-cyan-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span className="text-[12px] leading-snug text-cyan-800 dark:text-cyan-200">
                    {t(
                      'ProfessionalNetwork.postComposer.caseDisclosureConsent',
                      'I confirm this case is anonymized and shared for professional educational discussion only.'
                    )}
                  </span>
                </label>
              </div>
            )}

            {/* Anonymization Consent Checkbox */}
            {hasFiles && (
              <label className="flex items-start gap-2 mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isAnonymizationConfirmed}
                  onChange={(e) =>
                    setIsAnonymizationConfirmed(e.target.checked)
                  }
                  className="mt-0.5 w-4 h-4 rounded border-amber-300 text-brand-primary focus:ring-brand-primary"
                />
                <span className="text-[13px] text-amber-800 dark:text-amber-200 leading-snug">
                  {t(
                    'ProfessionalNetwork.postComposer.fileAnonymizationConsent',
                    'I confirm attached files do not contain patient-identifying information.'
                  )}
                </span>
              </label>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center -ml-2">
                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-full hover-animation"
                  title={t(
                    'ProfessionalNetwork.postComposer.actions.addImage',
                    'Add Image'
                  )}
                >
                  <Image className="w-5 h-5" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-full hover-animation"
                  title={t(
                    'ProfessionalNetwork.postComposer.actions.attachDocument',
                    'Attach Document'
                  )}
                >
                  <FileText className="w-5 h-5" />
                </button>
                <button
                  className="p-2 text-brand-primary hover:bg-brand-primary/10 rounded-full hover-animation"
                  title={t(
                    'ProfessionalNetwork.postComposer.actions.addLink',
                    'Add Link'
                  )}
                >
                  <Link2 className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3">
                <LoadingButton
                  onClick={handleSubmit}
                  isPending={createPost.isPending}
                  disabled={isPostDisabled}
                  className="btn-primary py-2 px-5 text-[15px]"
                >
                  {isCasePresentation && isInternalCase
                    ? t(
                        'ProfessionalNetwork.postComposer.actions.shareInternalCase',
                        'Share Internal Case'
                      )
                    : t(
                        'ProfessionalNetwork.postComposer.actions.post',
                        'Post'
                      )}
                </LoadingButton>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Share Clinic Case Modal */}
      <ShareClinicCaseModal
        session={selectedSessionDetail ?? null}
        isOpen={isShareClinicCaseModalOpen}
        onClose={() => setIsShareClinicCaseModalOpen(false)}
        onShare={(notes) => {
          // Update content with notes
          setContent(
            (prev) =>
              `${prev}\n\n${t('ProfessionalNetwork.postComposer.doctorNotesHeading', 'Doctor Notes')}:\n${notes}`
          );
          setIsShareClinicCaseModalOpen(false);
        }}
      />
    </div>
  );
}
