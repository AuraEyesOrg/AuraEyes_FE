import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Loader2,
  Save,
  Upload,
  Eye,
  CheckCircle2,
  XCircle,
  Link as LinkIcon,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { contractTemplatesApi } from '../api/contract-templates.api';
import { extractApiErrorMessage } from '@/lib/api-error';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import type { EmploymentTypeValue } from '../types/system-admin.types';

const formatDateTime = (
  dateText: string | undefined | null,
  locale: string,
  fallback: string
) => {
  if (!dateText) return fallback;
  const parsed = new Date(dateText);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return parsed.toLocaleString(locale);
};

export default function ContractTemplateEditorPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useSafeTranslation();
  const { i18n } = useTranslation();
  const dateLocale = i18n.resolvedLanguage?.startsWith('en')
    ? 'en-US'
    : 'vi-VN';
  const notAvailableLabel = t('SystemAdmin.common.notAvailable', 'N/A');
  const { id } = useParams<{ id: string }>();
  const isNew = !id || id === 'new';

  const { data: existingTemplate, isLoading: isLoadingTemplate } = useQuery({
    queryKey: ['contract-template', id],
    queryFn: () => contractTemplatesApi.getContractTemplateById(id!),
    enabled: !isNew && !!id,
  });

  const [title, setTitle] = useState('');
  const [contractType, setContractType] = useState<1 | 2>(1);
  const [employmentType, setEmploymentType] =
    useState<EmploymentTypeValue>('FullTime');
  const [contractVersion, setContractVersion] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [templateFile, setTemplateFile] = useState<File | null>(null);

  useEffect(() => {
    if (!existingTemplate) {
      if (isNew) {
        setTitle('');
        setContractType(1);
        setEmploymentType('FullTime');
        setContractVersion('1.0');
        setEffectiveDate('');
      }
      return;
    }

    setTitle(existingTemplate.title);
    setContractType(
      existingTemplate.type === 'OphthalmologistContract' ? 1 : 2
    );
    setEmploymentType(existingTemplate.employmentType ?? 'FullTime');
    setContractVersion(existingTemplate.contractVersion);
    setEffectiveDate(existingTemplate.effectiveDate?.slice(0, 10) ?? '');
  }, [existingTemplate, isNew]);

  const selectedFileUrl = useMemo(() => {
    if (!templateFile) return null;
    return URL.createObjectURL(templateFile);
  }, [templateFile]);

  useEffect(() => {
    return () => {
      if (selectedFileUrl) URL.revokeObjectURL(selectedFileUrl);
    };
  }, [selectedFileUrl]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) {
        throw new Error(
          t(
            'SystemAdmin.contractTemplateEditor.errors.templateNameRequired',
            'Template name is required.'
          )
        );
      }
      if (!contractVersion.trim())
        throw new Error(
          t(
            'SystemAdmin.contractTemplateEditor.errors.contractVersionRequired',
            'Contract version is required.'
          )
        );
      if (contractType === 1 && !employmentType) {
        throw new Error(
          t(
            'SystemAdmin.contractTemplateEditor.errors.employmentTypeRequired',
            'Please select Full-time or Part-time for ophthalmologist templates.'
          )
        );
      }

      const payload = {
        title: title.trim(),
        type: contractType,
        employmentType: contractType === 1 ? employmentType : undefined,
        contractVersion: contractVersion.trim(),
        effectiveDate: effectiveDate || undefined,
        templateFile: templateFile ?? undefined,
      };

      if (isNew) {
        if (!templateFile)
          throw new Error(
            t(
              'SystemAdmin.contractTemplateEditor.errors.docxRequired',
              'Please upload a DOCX template file.'
            )
          );
        return contractTemplatesApi.createContractTemplate({
          ...payload,
          templateFile,
        });
      }

      return contractTemplatesApi.updateContractTemplate(id!, payload);
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      if (isNew && result?.id) {
        navigate(`/system-admin/contract-templates/${result.id}/edit`, {
          replace: true,
        });
        return;
      }
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['contract-template', id] });
      }
      setTemplateFile(null);
    },
  });

  const statusMutation = useMutation({
    mutationFn: (isActive: boolean) =>
      contractTemplatesApi.setContractTemplateStatus(id!, isActive),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-templates'] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ['contract-template', id] });
      }
    },
  });

  const active = existingTemplate?.isActive ?? true;
  const saveErrorMessage = saveMutation.error
    ? extractApiErrorMessage(
        saveMutation.error,
        t(
          'SystemAdmin.contractTemplateEditor.errors.saveFailed',
          'Could not save contract template. Please try again.'
        )
      )
    : null;

  return (
    <div className="flex h-screen bg-(--bg-primary) overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <button
            onClick={() => navigate('/system-admin/contract-templates')}
            aria-label={t(
              'SystemAdmin.contractTemplateEditor.actions.backToTemplates',
              'Back to contract templates'
            )}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
              {isNew
                ? t(
                    'SystemAdmin.contractTemplateEditor.titleCreate',
                    'Create Contract Template'
                  )
                : t(
                    'SystemAdmin.contractTemplateEditor.titleDetail',
                    'Contract Template Detail'
                  )}
            </h1>
            <p className="text-xs text-slate-500">
              {t(
                'SystemAdmin.contractTemplateEditor.subtitle',
                'Upload DOCX only. No HTML or variable configuration.'
              )}
            </p>
          </div>

          {!isNew && existingTemplate && (
            <div className="ml-auto flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                  active
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {active ? (
                  <CheckCircle2 className="w-3 h-3" />
                ) : (
                  <XCircle className="w-3 h-3" />
                )}
                {active
                  ? t(
                      'SystemAdmin.contractTemplateEditor.status.active',
                      'Active'
                    )
                  : t(
                      'SystemAdmin.contractTemplateEditor.status.inactive',
                      'Inactive'
                    )}
              </span>
              <button
                onClick={() => statusMutation.mutate(!active)}
                disabled={statusMutation.isPending}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-300 hover:bg-slate-50 disabled:opacity-60"
              >
                {statusMutation.isPending
                  ? t(
                      'SystemAdmin.contractTemplateEditor.actions.updatingStatus',
                      'Updating...'
                    )
                  : active
                    ? t(
                        'SystemAdmin.contractTemplateEditor.actions.deactivate',
                        'Deactivate'
                      )
                    : t(
                        'SystemAdmin.contractTemplateEditor.actions.activate',
                        'Activate'
                      )}
              </button>
            </div>
          )}
        </div>

        {isLoadingTemplate ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="xl:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {t(
                  'SystemAdmin.contractTemplateEditor.sections.templateFile',
                  'Template File'
                )}
              </h2>

              <label className="flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-colors">
                <Upload className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {templateFile
                    ? templateFile.name
                    : t(
                        'SystemAdmin.contractTemplateEditor.actions.uploadDocxFile',
                        'Upload DOCX file'
                      )}
                </span>
                <input
                  type="file"
                  accept=".doc,.docx"
                  className="hidden"
                  onChange={(e) => setTemplateFile(e.target.files?.[0] ?? null)}
                />
              </label>

              <div className="flex flex-wrap gap-3">
                {selectedFileUrl && (
                  <a
                    href={selectedFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-50"
                  >
                    <Eye className="w-4 h-4" />
                    {t(
                      'SystemAdmin.contractTemplateEditor.links.previewUploadedFile',
                      'Preview uploaded file'
                    )}
                  </a>
                )}

                {!selectedFileUrl && existingTemplate?.contentTemplate && (
                  <a
                    href={existingTemplate.contentTemplate}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-lg border border-slate-300 hover:bg-slate-50"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {t(
                      'SystemAdmin.contractTemplateEditor.links.openCurrentTemplateFile',
                      'Open current template file'
                    )}
                  </a>
                )}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 space-y-4">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                {t(
                  'SystemAdmin.contractTemplateEditor.sections.templateMetadata',
                  'Template Metadata'
                )}
              </h2>

              <div>
                <label className="text-xs text-slate-500">
                  {t(
                    'SystemAdmin.contractTemplateEditor.fields.title.label',
                    'Title'
                  )}
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                  placeholder={t(
                    'SystemAdmin.contractTemplateEditor.fields.title.placeholder',
                    'Template title'
                  )}
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">
                  {t(
                    'SystemAdmin.contractTemplateEditor.fields.type.label',
                    'Type'
                  )}
                </label>
                <select
                  value={contractType}
                  onChange={(e) =>
                    setContractType(Number(e.target.value) as 1 | 2)
                  }
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                >
                  <option value={1}>
                    {t(
                      'SystemAdmin.contractTemplateEditor.fields.type.ophthalmologist',
                      'Ophthalmologist'
                    )}
                  </option>
                  <option value={2}>
                    {t(
                      'SystemAdmin.contractTemplateEditor.fields.type.medicalOrganization',
                      'Medical Organization'
                    )}
                  </option>
                </select>
              </div>

              {contractType === 1 && (
                <div>
                  <label className="text-xs text-slate-500">
                    {t(
                      'SystemAdmin.contractTemplateEditor.fields.employmentMode.label',
                      'Employment Mode'
                    )}
                  </label>
                  <select
                    value={employmentType}
                    onChange={(e) =>
                      setEmploymentType(e.target.value as EmploymentTypeValue)
                    }
                    className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                  >
                    <option value="FullTime">
                      {t(
                        'SystemAdmin.contractTemplateEditor.fields.employmentMode.fullTime',
                        'Full-time'
                      )}
                    </option>
                    <option value="PartTime">
                      {t(
                        'SystemAdmin.contractTemplateEditor.fields.employmentMode.partTime',
                        'Part-time'
                      )}
                    </option>
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs text-slate-500">
                  {t(
                    'SystemAdmin.contractTemplateEditor.fields.version.label',
                    'Version'
                  )}
                </label>
                <input
                  value={contractVersion}
                  onChange={(e) => setContractVersion(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                  placeholder={t(
                    'SystemAdmin.contractTemplateEditor.fields.version.placeholder',
                    '2026'
                  )}
                />
              </div>

              <div>
                <label className="text-xs text-slate-500">
                  {t(
                    'SystemAdmin.contractTemplateEditor.fields.effectiveDate.label',
                    'Effective Date'
                  )}
                </label>
                <input
                  type="date"
                  value={effectiveDate}
                  onChange={(e) => setEffectiveDate(e.target.value)}
                  className="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-sm"
                />
              </div>

              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold hover:bg-primary/90 disabled:opacity-60"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isNew
                  ? t(
                      'SystemAdmin.contractTemplateEditor.actions.createTemplate',
                      'Create Template'
                    )
                  : t(
                      'SystemAdmin.contractTemplateEditor.actions.saveChanges',
                      'Save Changes'
                    )}
              </button>

              {saveErrorMessage && (
                <p className="text-xs text-red-500">{saveErrorMessage}</p>
              )}

              {!isNew && existingTemplate && (
                <div className="pt-2 text-xs text-slate-500 space-y-1">
                  <p>
                    {t(
                      'SystemAdmin.contractTemplateEditor.metadata.createdAt',
                      'Created'
                    )}
                    :{' '}
                    {formatDateTime(
                      existingTemplate.createdAt,
                      dateLocale,
                      notAvailableLabel
                    )}
                  </p>
                  <p>
                    {t(
                      'SystemAdmin.contractTemplateEditor.metadata.updatedAt',
                      'Updated'
                    )}
                    :{' '}
                    {formatDateTime(
                      existingTemplate.updatedAt ?? existingTemplate.createdAt,
                      dateLocale,
                      notAvailableLabel
                    )}
                  </p>
                  <p>
                    {t(
                      'SystemAdmin.contractTemplateEditor.metadata.contractsUsingTemplate',
                      'Contracts using template: {{count}}',
                      {
                        count: existingTemplate.usageCount,
                      }
                    )}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
