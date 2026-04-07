import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Loader2, Mail, MapPin, Phone, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { extractApiErrorMessage } from '@/lib/api-error';
import {
  type OrganisationRecentPatientDto,
  updateOrganisationPatientContact,
} from '../api/patients.api';

interface UpdatePatientContactModalProps {
  isOpen: boolean;
  patient: OrganisationRecentPatientDto | null;
  onClose: () => void;
  onSuccess: () => void;
}

const formatGender = (
  gender: OrganisationRecentPatientDto['gender']
): string => {
  return gender === 'M' ? 'Male' : 'Female';
};

const formatDate = (date?: string): string => {
  if (!date) {
    return '—';
  }

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }

  return parsed.toLocaleDateString('vi-VN');
};

export default function UpdatePatientContactModal({
  isOpen,
  patient,
  onClose,
  onSuccess,
}: UpdatePatientContactModalProps) {
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (!isOpen || !patient) {
      return;
    }

    setAddress(patient.address ?? '');
    setPhoneNumber(patient.phoneNumber ?? '');
    setEmail(patient.email ?? '');
  }, [isOpen, patient]);

  const mutation = useMutation({
    mutationFn: async () => {
      if (!patient) {
        throw new Error('Patient not found');
      }

      return updateOrganisationPatientContact(patient.id, {
        address,
        phoneNumber,
        email,
      });
    },
    onSuccess: () => {
      toast.success('Patient contact updated successfully.');
      onSuccess();
    },
    onError: (error) => {
      toast.error(
        extractApiErrorMessage(error, 'Unable to update patient contact.')
      );
    },
  });

  const isSaveDisabled = useMemo(() => {
    if (!patient) {
      return true;
    }

    const normalizedCurrentPhone = (patient.phoneNumber ?? '').trim();
    const normalizedIncomingPhone = phoneNumber.trim();
    const normalizedCurrentAddress = (patient.address ?? '').trim();
    const normalizedIncomingAddress = address.trim();
    const normalizedCurrentEmail = (patient.email ?? '').trim();
    const normalizedIncomingEmail = email.trim();

    return (
      normalizedCurrentAddress === normalizedIncomingAddress &&
      normalizedCurrentPhone === normalizedIncomingPhone &&
      normalizedCurrentEmail === normalizedIncomingEmail
    );
  }, [patient, address, phoneNumber, email]);

  if (!isOpen || !patient) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl overflow-hidden rounded-2xl bg-(--bg-primary) shadow-xl">
        <div className="flex items-center justify-between border-b border-(--border-primary) p-5">
          <div>
            <h3 className="text-lg font-bold text-(--text-primary)">
              Patient Profile
            </h3>
            <p className="mt-0.5 text-xs text-(--text-tertiary)">
              You can edit only Address, Phone number, and Email
            </p>
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
          <div className="rounded-xl border border-(--border-primary) bg-(--bg-secondary) p-4">
            <h4 className="mb-3 text-sm font-semibold text-(--text-primary)">
              Read-only Information
            </h4>
            <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs text-(--text-tertiary)">Patient ID</p>
                <p className="font-medium text-(--text-primary)">
                  Aura-{patient.id.slice(0, 8)}
                </p>
              </div>
              <div>
                <p className="text-xs text-(--text-tertiary)">Full Name</p>
                <p className="font-medium text-(--text-primary)">
                  {patient.name}
                </p>
              </div>
              <div>
                <p className="text-xs text-(--text-tertiary)">Gender</p>
                <p className="font-medium text-(--text-primary)">
                  {formatGender(patient.gender)}
                </p>
              </div>
              <div>
                <p className="text-xs text-(--text-tertiary)">Age</p>
                <p className="font-medium text-(--text-primary)">
                  {patient.age || '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-(--text-tertiary)">Date of Birth</p>
                <p className="font-medium text-(--text-primary)">
                  {formatDate(patient.dateOfBirth)}
                </p>
              </div>
              <div>
                <p className="text-xs text-(--text-tertiary)">Citizen ID</p>
                <p className="font-medium text-(--text-primary)">
                  {patient.citizenId || '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-(--text-secondary)">
              Address
            </label>
            <div className="relative">
              <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-tertiary)" />
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-(--border-primary) bg-(--bg-secondary) py-2 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Street, ward, district, city"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-(--text-secondary)">
              Phone Number
            </label>
            <div className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-tertiary)" />
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full rounded-xl border border-(--border-primary) bg-(--bg-secondary) py-2 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="e.g. +84 123 456 789"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-(--text-secondary)">
              Email
            </label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-(--text-tertiary)" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-(--border-primary) bg-(--bg-secondary) py-2 pl-10 pr-3 text-sm outline-none transition focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="Optional email for reports"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={mutation.isPending}
              className="rounded-xl bg-(--bg-secondary) px-4 py-2 text-sm font-medium text-(--text-secondary) transition hover:bg-(--bg-tertiary) disabled:opacity-60"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={mutation.isPending || isSaveDisabled}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-primary/20 transition hover:bg-primary/90 disabled:opacity-50"
            >
              {mutation.isPending && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
