import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, UserPlus, Loader2, QrCode } from 'lucide-react';
import { toast } from 'react-toastify';
import { mapWalkInPatientErrorMessage } from '@/lib/api-error';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import {
  createClinicWalkInPatient,
  type CreateWalkInPatientRequest,
} from '../api/patients.api';

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
    fullName: '',
    gender: 'Male',
    dateOfBirth: '',
    address: '',
    phoneNumber: '',
  });

  const mutation = useMutation<string, Error, CreateWalkInPatientRequest>({
    mutationFn: createClinicWalkInPatient,
    onSuccess: (data: string) => {
      void queryClient.invalidateQueries({
        queryKey: ['clinic-staff', 'patients'],
      });
      toast.success(
        t(
          'ClinicStaff.walkInPatientModal.toast.createSuccess',
          'Walk-in patient created successfully!'
        )
      );
      onSuccess(data);
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
        fullName: '',
        gender: 'Male',
        dateOfBirth: '',
        address: '',
        phoneNumber: '',
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (isScanning) {
      const scanner = new Html5QrcodeScanner(
        'clinic-staff-reader',
        {
          qrbox: { width: 250, height: 250 },
          fps: 5,
        },
        false
      );

      scanner.render(
        (result) => {
          scanner.clear();
          setIsScanning(false);
          // VNeID format: CCCD|CMND|FullName|DOB(DDMMYYYY)|Gender|Address|Date of Issue
          const parts = result.split('|');
          if (parts.length >= 6) {
            const cccd = parts[0];
            const fullName = parts[2];
            const dobRaw = parts[3];
            let dob = '';
            if (dobRaw.length === 8) {
              const day = dobRaw.substring(0, 2);
              const month = dobRaw.substring(2, 4);
              const year = dobRaw.substring(4, 8);
              dob = `${year}-${month}-${day}`;
            }
            const genderRaw = parts[4];
            const gender = genderRaw.toLowerCase().includes('nữ')
              ? 'Female'
              : 'Male';
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
          } else {
            toast.error(
              t(
                'ClinicStaff.walkInPatientModal.toast.invalidQr',
                'Invalid QR code or unsupported CCCD/VNeID format.'
              )
            );
          }
        },
        () => {
          // ignore per-frame scan errors
        }
      );

      return () => {
        scanner
          .clear()
          .catch((e) => console.error('Failed to clear scanner', e));
      };
    }
  }, [isScanning, t]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      address: formData.address.trim() || undefined,
      dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-(--bg-primary) w-full max-w-md rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-(--border-primary) sticky top-0 bg-(--bg-primary) z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-(--text-primary)">
                {t(
                  'ClinicStaff.walkInPatientModal.header.title',
                  'Create Walk-in Patient'
                )}
              </h2>
              <p className="text-xs text-(--text-tertiary)">
                {t(
                  'ClinicStaff.walkInPatientModal.header.subtitle',
                  'Quickly register a new patient for this clinic'
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-(--bg-secondary) flex items-center justify-center text-(--text-tertiary) hover:text-(--text-primary) hover:bg-(--bg-tertiary) transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* QR scanner toggle */}
          {!isScanning ? (
            <button
              type="button"
              onClick={() => setIsScanning(true)}
              className="w-full py-3 px-4 rounded-xl border-2 border-dashed border-(--border-primary) text-(--text-secondary) hover:text-primary hover:border-primary hover:bg-primary/5 transition flex flex-col items-center justify-center gap-2"
            >
              <QrCode className="w-6 h-6" />
              <span className="font-medium text-sm">
                {t(
                  'ClinicStaff.walkInPatientModal.scan.action',
                  'Scan VNeID / CCCD QR Code'
                )}
              </span>
              <span className="text-xs text-(--text-tertiary)">
                {t(
                  'ClinicStaff.walkInPatientModal.scan.hint',
                  'Autofill patient details accurately'
                )}
              </span>
            </button>
          ) : (
            <div className="rounded-xl overflow-hidden border border-(--border-primary) bg-black">
              <div id="clinic-staff-reader" className="w-full" />
              <button
                type="button"
                onClick={() => setIsScanning(false)}
                className="w-full py-2 bg-(--bg-secondary) text-sm font-medium hover:bg-(--bg-tertiary)"
              >
                {t(
                  'ClinicStaff.walkInPatientModal.scan.cancel',
                  'Cancel Scanning'
                )}
              </button>
            </div>
          )}

          {/* Citizen ID */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-(--text-secondary)">
              {t(
                'ClinicStaff.walkInPatientModal.form.citizenId',
                'Citizen ID (CCCD)'
              )}
            </label>
            <input
              type="text"
              value={formData.citizenId}
              onChange={(e) =>
                setFormData({ ...formData, citizenId: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              placeholder={t(
                'ClinicStaff.walkInPatientModal.form.citizenIdPlaceholder',
                'e.g. 001099000000'
              )}
            />
          </div>

          {/* Full Name */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-(--text-secondary)">
              {t('ClinicStaff.walkInPatientModal.form.fullName', 'Full Name *')}
            </label>
            <input
              required
              type="text"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              placeholder={t(
                'ClinicStaff.walkInPatientModal.form.fullNamePlaceholder',
                'e.g. Nguyen Van A'
              )}
            />
          </div>

          {/* DOB + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-(--text-secondary)">
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
                className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-(--text-secondary)">
                {t('ClinicStaff.walkInPatientModal.form.gender', 'Gender *')}
              </label>
              <select
                required
                value={formData.gender}
                onChange={(e) =>
                  setFormData({ ...formData, gender: e.target.value })
                }
                className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
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
          <div className="space-y-1">
            <label className="text-sm font-medium text-(--text-secondary)">
              {t('ClinicStaff.walkInPatientModal.form.address', 'Address')}
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              placeholder={t(
                'ClinicStaff.walkInPatientModal.form.addressPlaceholder',
                'Street, ward, district, city'
              )}
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-(--text-secondary)">
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
              className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary focus:ring-1 focus:ring-primary outline-none transition"
              placeholder={t(
                'ClinicStaff.walkInPatientModal.form.phonePlaceholder',
                '+84 xxx xxx xxx'
              )}
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex justify-end gap-3 sticky bottom-0 bg-(--bg-primary)">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="px-4 py-2 rounded-xl text-sm font-medium text-(--text-secondary) bg-(--bg-secondary) hover:bg-(--bg-tertiary)"
            >
              {t('ClinicStaff.common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-primary text-white hover:bg-primary/90 transition shadow-lg shadow-primary/20 flex items-center gap-2 disabled:opacity-50"
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
    </div>
  );
}
