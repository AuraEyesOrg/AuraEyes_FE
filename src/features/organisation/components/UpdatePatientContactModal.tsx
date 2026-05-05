import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  Activity,
  FileText,
  Loader2,
  Lock,
  MapPin,
  Phone,
  User,
  X,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { extractApiErrorMessage } from '@/lib/api-error';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import {
  type ClinicRecentPatientDto,
  type UpdateClinicPatientRequest,
  updateClinicPatient,
} from '../api/patients.api';

interface UpdatePatientModalProps {
  isOpen: boolean;
  patient: ClinicRecentPatientDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

const formatGender = (gender: 'M' | 'F'): string =>
  gender === 'M' ? 'Male' : 'Female';

const formatDate = (date?: string): string => {
  if (!date) return '—';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('vi-VN');
};

const toDateInputValue = (date?: string): string => {
  if (!date) return '';
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return '';
  return parsed.toISOString().split('T')[0];
};

export default function UpdatePatientContactModal({
  isOpen,
  patient,
  onClose,
  onSuccess,
}: UpdatePatientModalProps) {
  const { t } = useSafeTranslation();
  // ── Walk-in admin fields ──
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [citizenId, setCitizenId] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');

  // ── Shared medical fields ──
  const [bmi, setBmi] = useState('');
  const [diseaseHistory, setDiseaseHistory] = useState('');

  useEffect(() => {
    if (!isOpen || !patient) return;

    setFullName(patient.name ?? '');
    setPhoneNumber(patient.phoneNumber ?? '');
    setCitizenId(patient.citizenId ?? '');
    setDateOfBirth(toDateInputValue(patient.dateOfBirth));
    setGender(formatGender(patient.gender));
    setAddress(patient.address ?? '');
    setBmi(patient.bmi != null ? String(patient.bmi) : '');
    setDiseaseHistory(patient.diseaseHistory ?? '');
  }, [isOpen, patient]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!patient)
        throw new Error(
          t(
            'Organisation.updatePatientModal.toast.patientNotFound',
            'Patient not found'
          )
        );

      const body: UpdateClinicPatientRequest = {};

      if (patient.isWalkIn) {
        // Walk-in: send admin fields
        if (fullName.trim() !== (patient.name ?? ''))
          body.fullName = fullName.trim();
        if (phoneNumber.trim() !== (patient.phoneNumber ?? ''))
          body.phoneNumber = phoneNumber.trim();
        if (citizenId.trim() !== (patient.citizenId ?? ''))
          body.citizenId = citizenId.trim();
        if (dateOfBirth !== toDateInputValue(patient.dateOfBirth))
          body.dateOfBirth = new Date(dateOfBirth).toISOString();
        if (gender !== formatGender(patient.gender)) body.gender = gender;
        if (address.trim() !== (patient.address ?? ''))
          body.address = address.trim();
      }

      // Both flows: send medical fields
      const bmiVal = bmi.trim() ? Number.parseFloat(bmi.trim()) : undefined;
      const currentBmi = patient.bmi ?? undefined;
      if (bmiVal !== currentBmi) body.bmi = bmiVal;

      if (diseaseHistory.trim() !== (patient.diseaseHistory ?? ''))
        body.diseaseHistory = diseaseHistory.trim();

      // Only send if there's something to update
      if (Object.keys(body).length === 0) {
        throw new Error(
          t(
            'Organisation.updatePatientModal.toast.noChanges',
            'No changes detected'
          )
        );
      }

      return updateClinicPatient(patient.id, body);
    },
    onSuccess: () => {
      toast.success(
        t(
          'Organisation.updatePatientModal.toast.updateSuccess',
          'Patient updated successfully.'
        )
      );
      onSuccess();
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(
          error,
          t(
            'Organisation.updatePatientModal.toast.updateFailed',
            'Unable to update patient.'
          )
        )
      );
    },
  });

  const hasChanges = useMemo(() => {
    if (!patient) return false;

    if (patient.isWalkIn) {
      if (fullName.trim() !== (patient.name ?? '')) return true;
      if (phoneNumber.trim() !== (patient.phoneNumber ?? '')) return true;
      if (citizenId.trim() !== (patient.citizenId ?? '')) return true;
      if (dateOfBirth !== toDateInputValue(patient.dateOfBirth)) return true;
      if (gender !== formatGender(patient.gender)) return true;
      if (address.trim() !== (patient.address ?? '')) return true;
    }

    const bmiVal = bmi.trim() ? Number.parseFloat(bmi.trim()) : undefined;
    if (bmiVal !== (patient.bmi ?? undefined)) return true;
    if (diseaseHistory.trim() !== (patient.diseaseHistory ?? '')) return true;

    return false;
  }, [
    patient,
    fullName,
    phoneNumber,
    citizenId,
    dateOfBirth,
    gender,
    address,
    bmi,
    diseaseHistory,
  ]);

  if (!isOpen || !patient) return null;

  const isWalkIn = patient.isWalkIn;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-(--bg-primary) shadow-xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-(--border-primary) p-5 sticky top-0 bg-(--bg-primary) z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-(--text-primary)">
                {t(
                  'Organisation.updatePatientModal.header.title',
                  'Edit Patient'
                )}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {isWalkIn ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    {t('Organisation.patients.types.walkIn', 'Walk-in')}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    <Lock className="w-3 h-3" />
                    {t(
                      'Organisation.updatePatientModal.badges.auraAccount',
                      'Aura Account'
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-(--bg-secondary) text-(--text-tertiary) transition hover:bg-(--bg-tertiary) hover:text-(--text-primary)"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form
          className="space-y-5 p-5"
          onSubmit={(e) => {
            e.preventDefault();
            mutation.mutate();
          }}
        >
          {/* ── Administrative Information ── */}
          {isWalkIn ? (
            // Walk-in: editable admin fields
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                {t(
                  'Organisation.updatePatientModal.sections.administrativeInfo',
                  'Administrative Information'
                )}
              </h4>

              <div className="space-y-1">
                <label className="text-sm font-medium text-(--text-secondary)">
                  {t(
                    'Organisation.updatePatientModal.form.fullName',
                    'Full Name *'
                  )}
                </label>
                <input
                  required
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-(--text-secondary)">
                    {t(
                      'Organisation.updatePatientModal.form.dateOfBirth',
                      'Date of Birth'
                    )}
                  </label>
                  <input
                    type="date"
                    max={new Date().toISOString().split('T')[0]}
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-(--text-secondary)">
                    {t('Organisation.updatePatientModal.form.gender', 'Gender')}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
                  >
                    <option value="Male">
                      {t('Organisation.common.gender.male', 'Male')}
                    </option>
                    <option value="Female">
                      {t('Organisation.common.gender.female', 'Female')}
                    </option>
                    <option value="Other">
                      {t(
                        'Organisation.updatePatientModal.form.genderOther',
                        'Other'
                      )}
                    </option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-(--text-secondary)">
                  {t(
                    'Organisation.updatePatientModal.form.citizenId',
                    'Citizen ID (CCCD)'
                  )}
                </label>
                <input
                  type="text"
                  value={citizenId}
                  onChange={(e) => setCitizenId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
                  placeholder={t(
                    'Organisation.updatePatientModal.form.citizenIdPlaceholder',
                    'e.g. 001099000000'
                  )}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-(--text-secondary)">
                  <Phone className="inline h-3.5 w-3.5 mr-1" />
                  {t(
                    'Organisation.updatePatientModal.form.phoneNumber',
                    'Phone Number'
                  )}
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
                  placeholder={t(
                    'Organisation.updatePatientModal.form.phonePlaceholder',
                    'e.g. +84 123 456 789'
                  )}
                />
              </div>

              <div className="space-y-1">
                <label className="text-sm font-medium text-(--text-secondary)">
                  <MapPin className="inline h-3.5 w-3.5 mr-1" />
                  {t('Organisation.updatePatientModal.form.address', 'Address')}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
                  placeholder={t(
                    'Organisation.updatePatientModal.form.addressPlaceholder',
                    'Street, ward, district, city'
                  )}
                />
              </div>
            </div>
          ) : (
            // Registered: read-only admin fields with Aura badge
            <div className="rounded-xl border border-(--border-primary) bg-(--bg-secondary) p-4">
              <h4 className="mb-3 text-sm font-semibold text-(--text-primary) flex items-center gap-2">
                <Lock className="h-4 w-4 text-(--text-tertiary)" />
                {t(
                  'Organisation.updatePatientModal.sections.personalInfo',
                  'Personal Information'
                )}
                <span className="text-xs font-normal text-(--text-tertiary)">
                  {t(
                    'Organisation.updatePatientModal.sections.personalInfoManagedByAura',
                    "- managed by patient's Aura account"
                  )}
                </span>
              </h4>
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs text-(--text-tertiary)">
                    {t(
                      'Organisation.updatePatientModal.readOnly.fullName',
                      'Full Name'
                    )}
                  </p>
                  <p className="font-medium text-(--text-primary)">
                    {patient.name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-(--text-tertiary)">
                    {t(
                      'Organisation.updatePatientModal.readOnly.gender',
                      'Gender'
                    )}
                  </p>
                  <p className="font-medium text-(--text-primary)">
                    {formatGender(patient.gender) === 'Male'
                      ? t('Organisation.common.gender.male', 'Male')
                      : t('Organisation.common.gender.female', 'Female')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-(--text-tertiary)">
                    {t('Organisation.updatePatientModal.readOnly.age', 'Age')}
                  </p>
                  <p className="font-medium text-(--text-primary)">
                    {patient.age ||
                      t('Organisation.common.notAvailable', 'N/A')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-(--text-tertiary)">
                    {t(
                      'Organisation.updatePatientModal.readOnly.dateOfBirth',
                      'Date of Birth'
                    )}
                  </p>
                  <p className="font-medium text-(--text-primary)">
                    {formatDate(patient.dateOfBirth)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-(--text-tertiary)">
                    {t(
                      'Organisation.updatePatientModal.readOnly.citizenId',
                      'Citizen ID'
                    )}
                  </p>
                  <p className="font-medium text-(--text-primary)">
                    {patient.citizenId ||
                      t('Organisation.common.notAvailable', 'N/A')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-(--text-tertiary)">
                    {t(
                      'Organisation.updatePatientModal.readOnly.phone',
                      'Phone'
                    )}
                  </p>
                  <p className="font-medium text-(--text-primary)">
                    {patient.phoneNumber ||
                      t('Organisation.common.notAvailable', 'N/A')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-(--text-tertiary)">
                    {t(
                      'Organisation.updatePatientModal.readOnly.address',
                      'Address'
                    )}
                  </p>
                  <p className="font-medium text-(--text-primary)">
                    {patient.address ||
                      t('Organisation.common.notAvailable', 'N/A')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-(--text-tertiary)">
                    {t(
                      'Organisation.updatePatientModal.readOnly.email',
                      'Email'
                    )}
                  </p>
                  <p className="font-medium text-(--text-primary)">
                    {patient.email ||
                      t('Organisation.common.notAvailable', 'N/A')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Medical Information (editable for both) ── */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-(--text-primary) flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              {t(
                'Organisation.updatePatientModal.sections.medicalInfo',
                'Medical Information'
              )}
            </h4>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-sm font-medium text-(--text-secondary)">
                  {t('Organisation.updatePatientModal.form.bmi', 'BMI')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="10"
                  max="100"
                  value={bmi}
                  onChange={(e) => setBmi(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm"
                  placeholder={t(
                    'Organisation.updatePatientModal.form.bmiPlaceholder',
                    'e.g. 22.5'
                  )}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-(--text-secondary)">
                <FileText className="inline h-3.5 w-3.5 mr-1" />
                {t(
                  'Organisation.updatePatientModal.form.diseaseHistory',
                  'Disease History'
                )}
              </label>
              <textarea
                value={diseaseHistory}
                onChange={(e) => setDiseaseHistory(e.target.value)}
                rows={3}
                maxLength={1000}
                className="w-full px-3 py-2 rounded-xl bg-(--bg-secondary) border border-(--border-primary) focus:border-primary focus:ring-1 focus:ring-primary outline-none transition text-sm resize-none"
                placeholder={t(
                  'Organisation.updatePatientModal.form.diseaseHistoryPlaceholder',
                  'e.g. Type-2 Diabetes, Hypertension, Glaucoma...'
                )}
              />
              <p className="text-xs text-(--text-tertiary) text-right">
                {diseaseHistory.length}/1000
              </p>
            </div>
          </div>

          {/* ── Actions ── */}
          <div className="flex justify-end gap-3 pt-2 sticky bottom-0 bg-(--bg-primary)">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="rounded-xl bg-(--bg-secondary) px-4 py-2 text-sm font-medium text-(--text-secondary) transition hover:bg-(--bg-tertiary) disabled:opacity-60"
            >
              {t('Organisation.common.cancel', 'Cancel')}
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || !hasChanges}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
            >
              {mutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              {t(
                'Organisation.screeningResult.actions.saveRecord',
                'Save record'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
