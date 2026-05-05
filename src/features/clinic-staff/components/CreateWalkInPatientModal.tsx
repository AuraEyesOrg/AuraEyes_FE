import { useState, useEffect, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, UserPlus, Loader2, QrCode } from 'lucide-react';
import { toast } from 'react-toastify';
import { mapWalkInPatientErrorMessage } from '@/lib/api-error';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import {
  createClinicWalkInPatient,
  type CreateWalkInPatientRequest,
  type CreateWalkInPatientResponse,
} from '../api/patients.api';
import QrScannerModal from './QrScannerModal';

interface CreateWalkInPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (patientId: string) => void;
}

export default function CreateWalkInPatientModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateWalkInPatientModalProps) {
  const queryClient = useQueryClient();
  const { t } = useSafeTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [formData, setFormData] = useState({
    citizenId: '',
    email: '',
    fullName: '',
    gender: 'Male',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
  });

  const mutation = useMutation<
    CreateWalkInPatientResponse,
    Error,
    CreateWalkInPatientRequest
  >({
    mutationFn: createClinicWalkInPatient,
    onSuccess: (data) => {
      void queryClient.invalidateQueries({
        queryKey: ['clinic-patients', 'recent'],
      });
      toast.success(
        t(
          'ClinicStaff.walkInPatientModal.toast.createSuccess',
          'Walk-in patient created successfully!'
        )
      );
      onSuccess(data.patientId);
    },
    onError: (error) => {
      console.error('Failed to create walk-in patient', error);
      toast.error(mapWalkInPatientErrorMessage(error));
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setIsScanning(false);
      setFormData({
        citizenId: '',
        email: '',
        fullName: '',
        gender: 'Male',
        dateOfBirth: '',
        address: '',
        phoneNumber: '',
      });
    }
  }, [isOpen]);

  const handleScanResult = useCallback(
    (decodedText: string) => {
      setIsScanning(false);
      // VNeID format: CCCD|CMND|FullName|DOB(DDMMYYYY)|Gender|Address|Date of Issue
      const parts = decodedText.split('|');
      if (parts.length < 6) {
        toast.error(
          t(
            'ClinicStaff.walkInPatientModal.toast.invalidQr',
            'Invalid QR code or unsupported CCCD/VNeID format.'
          )
        );
        return;
      }

      const cccd = parts[0]?.trim() ?? '';
      const fullName = parts[2]?.trim() ?? '';
      const dobRaw = parts[3]?.trim() ?? '';
      let dob = '';
      if (/^\d{8}$/.test(dobRaw)) {
        const day = dobRaw.substring(0, 2);
        const month = dobRaw.substring(2, 4);
        const year = dobRaw.substring(4, 8);
        dob = `${year}-${month}-${day}`;
      }
      const genderRaw = parts[4]?.toLowerCase() ?? '';
      const gender = genderRaw.includes('nữ') ? 'Female' : 'Male';
      const address = parts[5]?.trim() ?? '';

      setFormData((prev) => ({
        ...prev,
        citizenId: cccd,
        fullName,
        dateOfBirth: dob,
        gender,
        address,
      }));
      toast.success(
        t(
          'ClinicStaff.walkInPatientModal.toast.qrExtractSuccess',
          'Citizen profile extracted successfully!'
        )
      );
    },
    [t]
  );

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.citizenId && formData.citizenId.length !== 12) {
      toast.error(
        t(
          'ClinicStaff.walkInPatientModal.toast.invalidCitizenId',
          'Citizen ID must be exactly 12 digits.'
        )
      );
      return;
    }
    mutation.mutate({
      ...formData,
      email: formData.email.trim() || undefined,
      address: formData.address.trim() || undefined,
      dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-slate-200 bg-white shadow-[0_16px_34px_-20px_rgba(15,23,42,0.4)] animate-in fade-in zoom-in-95 duration-200 dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-white/85 dark:border-slate-800 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/85">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 dark:border-emerald-900/70 dark:bg-emerald-950/40">
              <UserPlus className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {t(
                  'ClinicStaff.walkInPatientModal.header.title',
                  'Create Walk-in Patient'
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  'ClinicStaff.walkInPatientModal.header.subtitle',
                  'Quickly register a new patient for this clinic'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 p-6">
          {/* QR scanner toggle */}
          {!isScanning ? (
            <button
              type="button"
              onClick={() => setIsScanning(true)}
              className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-4 py-3 text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50/70 hover:text-emerald-700 dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-emerald-700 dark:hover:bg-emerald-950/30 dark:hover:text-emerald-300"
            >
              <QrCode className="h-6 w-6" />
              <span className="font-medium text-sm">
                {t(
                  'ClinicStaff.walkInPatientModal.scan.action',
                  'Scan VNeID / CCCD QR Code'
                )}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {t(
                  'ClinicStaff.walkInPatientModal.scan.hint',
                  'Autofill patient details accurately'
                )}
              </span>
            </button>
          ) : (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center dark:border-emerald-900/60 dark:bg-emerald-950/30">
              <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                {t(
                  'ClinicStaff.walkInPatientModal.scan.opening',
                  'Opening camera scanner...'
                )}
              </p>
              <button
                type="button"
                onClick={() => setIsScanning(false)}
                className="mt-2 text-xs font-medium text-slate-500 underline-offset-2 hover:underline dark:text-slate-400"
              >
                {t(
                  'ClinicStaff.walkInPatientModal.scan.cancel',
                  'Cancel Scanning'
                )}
              </button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t(
                'ClinicStaff.walkInPatientModal.form.citizenId',
                'Citizen ID (CCCD)'
              )}
            </label>
            <input
              type="text"
              maxLength={12}
              value={formData.citizenId}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                setFormData({ ...formData, citizenId: val });
              }}
              className={[
                'w-full rounded-xl border px-3 py-2.5 text-sm outline-none transition focus:ring-2',
                formData.citizenId && formData.citizenId.length !== 12
                  ? 'border-rose-400 bg-rose-50/50 text-rose-900 focus:border-rose-500 focus:ring-rose-100 dark:border-rose-800 dark:bg-rose-950/20 dark:text-rose-200 dark:focus:ring-rose-900/50'
                  : 'border-slate-300 bg-white text-slate-900 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-600 dark:focus:ring-emerald-900/50',
              ].join(' ')}
              placeholder={t(
                'ClinicStaff.walkInPatientModal.form.citizenIdPlaceholder',
                'e.g. 001099000000'
              )}
            />
            {formData.citizenId && formData.citizenId.length !== 12 && (
              <p className="text-[10px] font-bold text-rose-500 uppercase tracking-tight">
                {t(
                  'ClinicStaff.walkInPatientModal.form.citizenIdInvalid',
                  'Citizen ID must be exactly 12 digits'
                )}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('ClinicStaff.walkInPatientModal.form.email', 'Email *')}
            </label>
            <input
              required
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-600 dark:focus:ring-emerald-900/50"
              placeholder={t(
                'ClinicStaff.walkInPatientModal.form.emailPlaceholder',
                'patient@example.com'
              )}
            />
          </div>

          {/* Full Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('ClinicStaff.walkInPatientModal.form.fullName', 'Full Name *')}
            </label>
            <input
              required
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-600 dark:focus:ring-emerald-900/50"
              placeholder={t(
                'ClinicStaff.walkInPatientModal.form.fullNamePlaceholder',
                'e.g. Nguyen Van A'
              )}
            />
          </div>

          {/* DOB + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t(
                  'ClinicStaff.walkInPatientModal.form.dateOfBirth',
                  'Date of Birth *'
                )}
              </label>
              <input
                required
                type="date"
                max={new Date().toISOString().split('T')[0]}
                value={formData.dateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, dateOfBirth: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-600 dark:focus:ring-emerald-900/50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('ClinicStaff.walkInPatientModal.form.gender', 'Gender *')}
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-600 dark:focus:ring-emerald-900/50"
              >
                <option value="Male">
                  {t('ClinicStaff.common.gender.male', 'Male')}
                </option>
                <option value="Female">
                  {t('ClinicStaff.common.gender.female', 'Female')}
                </option>
                <option value="Other">
                  {t(
                    'ClinicStaff.walkInPatientModal.form.genderOther',
                    'Other'
                  )}
                </option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('ClinicStaff.walkInPatientModal.form.address', 'Address')}
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-600 dark:focus:ring-emerald-900/50"
              placeholder={t(
                'ClinicStaff.walkInPatientModal.form.addressPlaceholder',
                'Street, ward, district, city'
              )}
            />
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t(
                'ClinicStaff.walkInPatientModal.form.phoneNumber',
                'Phone Number'
              )}
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData({ ...formData, phoneNumber: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-emerald-600 dark:focus:ring-emerald-900/50"
              placeholder={t(
                'ClinicStaff.walkInPatientModal.form.phonePlaceholder',
                '+84 xxx xxx xxx'
              )}
            />
          </div>

          {/* Actions */}
          <div className="sticky bottom-0 -mx-6 flex justify-end gap-3 border-t border-slate-200 bg-white/95 px-6 pt-4 backdrop-blur supports-[backdrop-filter]:bg-white/90 dark:border-slate-800 dark:bg-slate-900/95 dark:supports-[backdrop-filter]:bg-slate-900/90">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50 hover:text-slate-800 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-slate-100"
            >
              {t('ClinicStaff.common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-50 dark:bg-emerald-500 dark:hover:bg-emerald-600"
            >
              {mutation.isPending && (
                <Loader2 className="w-4 h-4 animate-spin" />
              )}
              {t(
                'ClinicStaff.walkInPatientModal.actions.createPatient',
                'Create Patient'
              )}
            </button>
          </div>
        </form>
      </div>
      {isScanning && (
        <QrScannerModal
          onClose={() => setIsScanning(false)}
          onScan={handleScanResult}
        />
      )}
    </div>
  );
}
