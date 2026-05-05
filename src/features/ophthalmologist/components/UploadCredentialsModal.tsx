import { useState, useEffect } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { api } from '@/lib/api';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import { ophthalmologistProfileKeys } from '../hooks/useOphthalmologistProfile';

type DegreeLevel =
  | 'Bachelor'
  | 'Master'
  | 'Doctor'
  | 'AssociateProfessor'
  | 'Professor';

const DEGREE_LEVEL_OPTIONS: Array<{ value: DegreeLevel; label: string }> = [
  { value: 'Bachelor', label: 'Bachelor' },
  { value: 'Master', label: 'Master' },
  { value: 'Doctor', label: 'Doctor (PhD)' },
  { value: 'AssociateProfessor', label: 'Associate Professor' },
  { value: 'Professor', label: 'Professor' },
];

interface DegreeFormItem {
  name: string;
  degreeLevel: DegreeLevel;
  issuingAuthority: string;
  issuedDate: string;
  file?: FileList;
}

interface CertificateFormItem {
  name: string;
  issuingAuthority: string;
  licenseNumber: string;
  issuedDate: string;
  expiryDate: string;
  file?: FileList;
}

interface UploadCredentialsFormData {
  degrees: DegreeFormItem[];
  certificates: CertificateFormItem[];
}

interface UploadCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
  ophthalmologistId: string;
  editingCredential?: {
    id: string;
    type: 'Degree' | 'License';
    name: string;
    degreeLevel?: string;
    issuingAuthority?: string;
    licenseNumber?: string;
    issuedDate: string;
    expiryDate?: string;
    certificateUrl?: string;
  };
}

export default function UploadCredentialsModal({
  isOpen,
  onClose,
  ophthalmologistId,
  editingCredential,
}: UploadCredentialsModalProps) {
  const { t } = useSafeTranslation();
  const queryClient = useQueryClient();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isEditMode = !!editingCredential;

  const createDefaultDegree = (): DegreeFormItem => ({
    name: '',
    degreeLevel: 'Bachelor',
    issuingAuthority: '',
    issuedDate: '',
  });

  const createDefaultCertificate = (): CertificateFormItem => ({
    name: '',
    issuingAuthority: '',
    licenseNumber: '',
    issuedDate: '',
    expiryDate: '',
  });

  const { register, control, handleSubmit, reset } =
    useForm<UploadCredentialsFormData>({
      defaultValues: {
        degrees: [createDefaultDegree()],
        certificates: [createDefaultCertificate()],
      },
    });

  useEffect(() => {
    if (editingCredential) {
      if (editingCredential.type === 'Degree') {
        reset({
          degrees: [
            {
              name: editingCredential.name,
              degreeLevel:
                (editingCredential.degreeLevel as DegreeLevel) || 'Bachelor',
              issuingAuthority: editingCredential.issuingAuthority || '',
              issuedDate: editingCredential.issuedDate
                ? editingCredential.issuedDate.split('T')[0]
                : '',
            },
          ],
          certificates: [],
        });
      } else {
        reset({
          degrees: [],
          certificates: [
            {
              name: editingCredential.name,
              issuingAuthority: editingCredential.issuingAuthority ?? '',
              licenseNumber: editingCredential.licenseNumber ?? '',
              issuedDate: editingCredential.issuedDate
                ? new Date(editingCredential.issuedDate)
                    .toISOString()
                    .split('T')[0]
                : '',
              expiryDate: editingCredential.expiryDate
                ? new Date(editingCredential.expiryDate)
                    .toISOString()
                    .split('T')[0]
                : '',
            },
          ],
        });
      }
    } else {
      reset({
        degrees: [createDefaultDegree()],
        certificates: [createDefaultCertificate()],
      });
    }
  }, [editingCredential, reset, isOpen]);

  const {
    fields: degreeFields,
    append: appendDegree,
    remove: removeDegree,
  } = useFieldArray({
    control,
    name: 'degrees',
  });

  const {
    fields: certificateFields,
    append: appendCertificate,
    remove: removeCertificate,
  } = useFieldArray({
    control,
    name: 'certificates',
  });

  const uploadMutation = useMutation({
    mutationFn: async (data: UploadCredentialsFormData) => {
      const formData = new FormData();
      let credentialIndex = 0;

      if (isEditMode && editingCredential) {
        const item = data.degrees[0] || data.certificates[0];
        formData.append('name', item.name);
        if ('degreeLevel' in item && item.degreeLevel) {
          formData.append('degreeLevel', item.degreeLevel as string);
        }
        if (item.issuingAuthority) {
          formData.append('issuingAuthority', item.issuingAuthority);
        }
        if ('licenseNumber' in item && item.licenseNumber) {
          formData.append('licenseNumber', item.licenseNumber as string);
        }
        if (item.issuedDate) {
          formData.append(
            'issuedDate',
            new Date(item.issuedDate as string).toISOString()
          );
        }
        if ('expiryDate' in item && item.expiryDate) {
          formData.append(
            'expiryDate',
            new Date(item.expiryDate as string).toISOString()
          );
        }
        if (item.file && item.file.length > 0) {
          formData.append('file', item.file[0]);
        }

        await api.put(
          `/ophthalmologist/profile/certificates/${editingCredential.id}`,
          formData,
          {
            headers: { 'Content-Type': 'multipart/form-data' },
          }
        );
        return;
      }

      data.degrees.forEach((item) => {
        if (!item.file || item.file.length === 0) return;
        formData.append(`certificates[${credentialIndex}][type]`, 'Degree');
        formData.append(`certificates[${credentialIndex}][name]`, item.name);
        if (item.degreeLevel) {
          formData.append(
            `certificates[${credentialIndex}][degreeLevel]`,
            item.degreeLevel
          );
        }
        if (item.issuingAuthority) {
          formData.append(
            `certificates[${credentialIndex}][issuingAuthority]`,
            item.issuingAuthority
          );
        }
        if (item.issuedDate) {
          formData.append(
            `certificates[${credentialIndex}][issuedDate]`,
            new Date(item.issuedDate).toISOString()
          );
        }
        formData.append(`certificates[${credentialIndex}][file]`, item.file[0]);
        credentialIndex++;
      });

      data.certificates.forEach((item) => {
        if (!item.file || item.file.length === 0) return;
        formData.append(`certificates[${credentialIndex}][type]`, 'License');
        formData.append(`certificates[${credentialIndex}][name]`, item.name);
        if (item.issuingAuthority) {
          formData.append(
            `certificates[${credentialIndex}][issuingAuthority]`,
            item.issuingAuthority
          );
        }
        if (item.licenseNumber) {
          formData.append(
            `certificates[${credentialIndex}][licenseNumber]`,
            item.licenseNumber
          );
        }
        if (item.issuedDate) {
          formData.append(
            `certificates[${credentialIndex}][issuedDate]`,
            new Date(item.issuedDate).toISOString()
          );
        }
        if (item.expiryDate) {
          formData.append(
            `certificates[${credentialIndex}][expiryDate]`,
            new Date(item.expiryDate).toISOString()
          );
        }
        formData.append(`certificates[${credentialIndex}][file]`, item.file[0]);
        credentialIndex++;
      });

      const response = await api.post(
        '/ophthalmologist/profile/certificates',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success(
        isEditMode
          ? t(
              'Ophthalmologist.credentials.toast.updateSuccess',
              'Credential updated successfully.'
            )
          : t(
              'Ophthalmologist.credentials.toast.uploadSuccess',
              'Credentials uploaded successfully.'
            )
      );
      queryClient.invalidateQueries({
        queryKey: ophthalmologistProfileKeys.all,
      });
      onClose();
    },
    onError: (error: unknown) => {
      console.error(error);
      const apiError = error as {
        response?: { data?: { message?: string } };
      };
      setSubmitError(
        apiError?.response?.data?.message ||
          (isEditMode
            ? t(
                'Ophthalmologist.credentials.toast.updateFailed',
                'Failed to update credential'
              )
            : t(
                'Ophthalmologist.credentials.toast.uploadFailed',
                'Failed to upload credentials'
              ))
      );
      toast.error(
        isEditMode
          ? t(
              'Ophthalmologist.credentials.toast.updateFailed',
              'Failed to update credential'
            )
          : t(
              'Ophthalmologist.credentials.toast.uploadFailed',
              'Failed to upload credentials'
            )
      );
    },
  });

  const onSubmit = async (data: UploadCredentialsFormData) => {
    setSubmitError(null);
    let hasOneFile = false;
    for (const d of data.degrees)
      if (d.file && d.file.length > 0) hasOneFile = true;
    for (const c of data.certificates)
      if (c.file && c.file.length > 0) hasOneFile = true;

    if (!isEditMode && !hasOneFile) {
      setSubmitError(
        t(
          'Ophthalmologist.credentials.validation.atLeastOneFile',
          'Please attach at least one file (Degree or License/Certificate).'
        )
      );
      return;
    }

    uploadMutation.mutate(data);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#0a1f44] w-full max-w-2xl rounded-2xl shadow-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-[#1e3a5f]">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {isEditMode
              ? t(
                  'Ophthalmologist.credentials.updateTitle',
                  'Update Credential'
                )
              : t(
                  'Ophthalmologist.credentials.uploadTitle',
                  'Upload Additional Credentials'
                )}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#1e3a5f] rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          <form
            id="credentials-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-8"
          >
            {submitError && (
              <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                {submitError}
              </div>
            )}

            {/* Degrees Section */}
            {(!isEditMode || editingCredential?.type === 'Degree') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-[#1e3a5f] w-full pb-2">
                    {t(
                      'Ophthalmologist.credentials.medicalDegrees',
                      'Medical Degrees'
                    )}
                  </h3>
                </div>
                {degreeFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative bg-gray-50 dark:bg-[#1e3a5f]/30 p-4 rounded-xl border border-gray-200 dark:border-[#2d4a6f] space-y-4"
                  >
                    {!isEditMode && (
                      <div className="absolute right-3 top-3">
                        <button
                          type="button"
                          onClick={() => removeDegree(index)}
                          className="text-red-500 hover:text-red-700 bg-white shadow-xs p-1.5 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(
                            'Ophthalmologist.credentials.degreeName',
                            'Degree Name'
                          )}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register(`degrees.${index}.name`, {
                            required: t('Validation.Required', 'Required'),
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d4a6f] rounded-lg bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(
                            'Ophthalmologist.credentials.degreeLevel',
                            'Degree Level'
                          )}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register(`degrees.${index}.degreeLevel`, {
                            required: t('Validation.Required', 'Required'),
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d4a6f] rounded-lg bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white"
                        >
                          {DEGREE_LEVEL_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(
                            'Ophthalmologist.credentials.issuingAuthority',
                            'Issuing Authority'
                          )}
                        </label>
                        <input
                          type="text"
                          {...register(`degrees.${index}.issuingAuthority`)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d4a6f] rounded-lg bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(
                            'Ophthalmologist.credentials.issuedDate',
                            'Issued Date'
                          )}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          {...register(`degrees.${index}.issuedDate`, {
                            required: t('Validation.Required', 'Required'),
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d4a6f] rounded-lg bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t(
                          'Ophthalmologist.credentials.uploadDocument',
                          'Upload Document'
                        )}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        {...register(`degrees.${index}.file`)}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-cyan-900/30 dark:file:text-cyan-400"
                      />
                    </div>
                  </div>
                ))}
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={() => appendDegree(createDefaultDegree())}
                    className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />{' '}
                    {t(
                      'Ophthalmologist.credentials.addAnotherDegree',
                      'Add Another Degree'
                    )}
                  </button>
                )}
              </section>
            )}

            {/* Certificates Section */}
            {(!isEditMode || editingCredential?.type === 'License') && (
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-[#1e3a5f] w-full pb-2">
                    {t(
                      'Ophthalmologist.credentials.licensesCertificates',
                      'Licenses & Certificates'
                    )}
                  </h3>
                </div>
                {certificateFields.map((field, index) => (
                  <div
                    key={field.id}
                    className="relative bg-gray-50 dark:bg-[#1e3a5f]/30 p-4 rounded-xl border border-gray-200 dark:border-[#2d4a6f] space-y-4"
                  >
                    {!isEditMode && (
                      <div className="absolute right-3 top-3">
                        <button
                          type="button"
                          onClick={() => removeCertificate(index)}
                          className="text-red-500 hover:text-red-700 bg-white shadow-xs p-1.5 rounded-full"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(
                            'Ophthalmologist.credentials.certificateName',
                            'Certificate Name'
                          )}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register(`certificates.${index}.name`, {
                            required: t('Validation.Required', 'Required'),
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d4a6f] rounded-lg bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(
                            'Ophthalmologist.credentials.issuingAuthority',
                            'Issuing Authority'
                          )}
                        </label>
                        <input
                          type="text"
                          {...register(
                            `certificates.${index}.issuingAuthority`
                          )}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d4a6f] rounded-lg bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(
                            'Ophthalmologist.credentials.licenseNumber',
                            'License Number'
                          )}
                        </label>
                        <input
                          type="text"
                          {...register(`certificates.${index}.licenseNumber`)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d4a6f] rounded-lg bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(
                            'Ophthalmologist.credentials.issuedDate',
                            'Issued Date'
                          )}{' '}
                          <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          {...register(`certificates.${index}.issuedDate`, {
                            required: t('Validation.Required', 'Required'),
                          })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d4a6f] rounded-lg bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          {t(
                            'Ophthalmologist.credentials.expiryDate',
                            'Expiry Date'
                          )}
                        </label>
                        <input
                          type="date"
                          {...register(`certificates.${index}.expiryDate`)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-[#2d4a6f] rounded-lg bg-white dark:bg-[#0a1f44] text-gray-900 dark:text-white [color-scheme:light] dark:[color-scheme:dark]"
                        />
                      </div>
                    </div>

                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {t(
                          'Ophthalmologist.credentials.uploadDocument',
                          'Upload Document'
                        )}{' '}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="file"
                        {...register(`certificates.${index}.file`)}
                        accept=".pdf,.jpg,.jpeg,.png,.webp"
                        className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-cyan-50 file:text-cyan-700 hover:file:bg-cyan-100 dark:file:bg-cyan-900/30 dark:file:text-cyan-400"
                      />
                    </div>
                  </div>
                ))}
                {!isEditMode && (
                  <button
                    type="button"
                    onClick={() =>
                      appendCertificate(createDefaultCertificate())
                    }
                    className="flex items-center gap-2 text-cyan-600 hover:text-cyan-700 text-sm font-medium"
                  >
                    <Plus className="w-4 h-4" />{' '}
                    {t(
                      'Ophthalmologist.credentials.addAnotherCertificate',
                      'Add Another Certificate'
                    )}
                  </button>
                )}
              </section>
            )}
          </form>
        </div>

        <div className="p-6 border-t border-gray-200 dark:border-[#1e3a5f] bg-gray-50 dark:bg-[#0a1f44] shrink-0 rounded-b-2xl">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={uploadMutation.isPending}
              className="px-5 py-2.5 bg-white dark:bg-[#1e3a5f] border border-gray-300 dark:border-[#2d4a6f] text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-[#2d4a6f]/80 transition-colors"
            >
              {t('Ophthalmologist.common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              form="credentials-form"
              disabled={uploadMutation.isPending}
              className="flex items-center gap-2 px-5 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg font-medium transition-colors disabled:opacity-70"
            >
              {uploadMutation.isPending && (
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              )}
              {isEditMode
                ? t(
                    'Ophthalmologist.credentials.updateTitle',
                    'Update Credential'
                  )
                : t(
                    'Ophthalmologist.credentials.uploadTitle',
                    'Upload Credentials'
                  )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
