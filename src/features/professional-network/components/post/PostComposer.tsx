/**
 * Post Composer Component
 * Component for creating new posts with file upload and anonymization consent
 */

import { useRef, useState } from 'react';
import { Image, FileText, HelpCircle, Link2, X } from 'lucide-react';
import type { PostCategory } from '../../types';
import { useCreatePost } from '../../hooks/useCreatePost';
import useAuthStore from '@/store/auth-store';
import { LoadingButton } from '@/components/ui/loading-button';
import UserAvatar from '@/components/ui/UserAvatar';
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
  const [isExpanded, setIsExpanded] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isAnonymizationConfirmed, setIsAnonymizationConfirmed] =
    useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createPost = useCreatePost();
  const { user } = useAuthStore();

  const hasFiles = files.length > 0;
  const hasCaseMedia = hasFiles;
  const hasContent = content.trim() !== '';

  const isPostDisabled =
    !hasContent ||
    createPost.isPending ||
    (hasFiles && !isAnonymizationConfirmed);

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
    formData.append('isInternalCase', 'false');
    formData.append(
      'isAnonymizationConfirmed',
      String(isAnonymizationConfirmed)
    );

    files.forEach((file) => {
      formData.append('attachments', file);
    });

    createPost.mutate(formData, {
      onSuccess: () => {
        setContent('');
        setFiles([]);
        setPreviews([]);
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
                  {t('ProfessionalNetwork.postComposer.actions.post', 'Post')}
                </LoadingButton>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
