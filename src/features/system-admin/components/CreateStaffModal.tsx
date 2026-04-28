import { useState } from 'react';
import { X, Mail, Phone, User, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { useSafeTranslation } from '@/i18n/useSafeTranslation';
import type { UserRole } from '../types/system-admin.types';
import { userApi } from '../api/user.api';
import { formatCurrency, vndCurrencyOptions } from '@/lib/helper';

const AURA_LOGO = '/logo.png';

interface CreateStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface FormValues {
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  consultationFee?: number;
  subRoles: string[];
}

const schema = yup.object().shape({
  fullName: yup
    .string()
    .required('Full name is required')
    .min(2, 'Name is too short'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  phone: yup
    .string()
    .required('Phone number is required')
    .matches(/^[0-9+() -]+$/, 'Invalid phone format'),
  role: yup
    .string()
    .oneOf(['Ophthalmologist', 'ClinicStaff'])
    .required('Role is required') as yup.Schema<UserRole>,
  consultationFee: yup.number().when('role', {
    is: 'Ophthalmologist',
    then: (schema) =>
      schema
        .min(0, 'Fee cannot be negative')
        .required('Consultation fee is required'),
    otherwise: (schema) => schema.optional(),
  }),
  subRoles: yup
    .array()
    .of(yup.string())
    .when('role', {
      is: 'ClinicStaff',
      then: (schema) =>
        schema.min(1, 'At least one sub-role is required').required(),
      otherwise: (schema) => schema.optional(),
    }) as any,
});

export default function CreateStaffModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateStaffModalProps) {
  const { t } = useSafeTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      role: 'ClinicStaff',
      consultationFee: 0,
      subRoles: ['Receptionist'],
    },
  });

  const selectedRole = watch('role');
  const selectedSubRoles = watch('subRoles') || [];

  if (!isOpen) return null;

  const toggleSubRole = (subRole: string) => {
    const current = [...selectedSubRoles];
    const index = current.indexOf(subRole);
    if (index > -1) {
      if (current.length > 1) current.splice(index, 1);
    } else {
      current.push(subRole);
    }
    setValue('subRoles', current);
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await userApi.onboardStaff(data);

      toast.success(
        t(
          'SystemAdmin.staff.toasts.createSuccess',
          'Staff created successfully. Temporary password sent.'
        )
      );
      reset();
      onSuccess();
      onClose();
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        t('SystemAdmin.staff.toasts.createError', 'Failed to create staff');
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <img
                src={AURA_LOGO}
                alt="Aura"
                className="w-6 h-6 object-contain"
              />
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              {t('SystemAdmin.staff.modal.title', 'Add New Staff')}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('SystemAdmin.staff.fields.fullName', 'Full Name')}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...register('fullName')}
                type="text"
                placeholder="John Doe"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all ${
                  errors.fullName
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
            </div>
            {errors.fullName && (
              <p className="text-sm text-red-500">{errors.fullName.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('SystemAdmin.staff.fields.email', 'Email Address')}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...register('email')}
                type="email"
                placeholder="john.doe@auraeyes.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all ${
                  errors.email
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
            </div>
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('SystemAdmin.staff.fields.phone', 'Phone Number')}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                {...register('phone')}
                type="text"
                placeholder="+84 123 456 789"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all ${
                  errors.phone
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              />
            </div>
            {errors.phone && (
              <p className="text-sm text-red-500">{errors.phone.message}</p>
            )}
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {t('SystemAdmin.staff.fields.role', 'Staff Role')}{' '}
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <select
                {...register('role')}
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white dark:bg-slate-950 text-slate-900 dark:text-white outline-none transition-all appearance-none ${
                  errors.role
                    ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                    : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20'
                }`}
              >
                <option value="ClinicStaff">Clinic Staff</option>
                <option value="Ophthalmologist">Ophthalmologist</option>
              </select>
            </div>
            {errors.role && (
              <p className="text-sm text-red-500">{errors.role.message}</p>
            )}
          </div>

          {/* Sub Roles (Conditional) */}
          {selectedRole === 'ClinicStaff' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t('SystemAdmin.staff.fields.subRoles', 'Functional Roles')}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Receptionist', 'Coordinator', 'Cashier'].map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => toggleSubRole(sub)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                      selectedSubRoles.includes(sub)
                        ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/10'
                        : 'border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-200 dark:hover:border-slate-700'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
              {errors.subRoles && (
                <p className="text-sm text-red-500">
                  {errors.subRoles.message as string}
                </p>
              )}
            </div>
          )}

          {/* Consultation Fee (Conditional) */}
          {selectedRole === 'Ophthalmologist' && (
            <div className="space-y-1.5 animate-in slide-in-from-top-2 duration-200">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {t(
                  'SystemAdmin.staff.fields.consultationFee',
                  'Consultation Fee (VND)'
                )}{' '}
                <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ₫
                  </span>
                  <input
                    {...register('consultationFee')}
                    type="number"
                    placeholder="500000"
                    className={`w-full pl-8 pr-4 py-2.5 rounded-lg border bg-white dark:bg-slate-950 text-slate-900 dark:text-white placeholder:text-slate-400 outline-none transition-all font-medium ${
                      errors.consultationFee
                        ? 'border-red-500 focus:ring-2 focus:ring-red-500/20'
                        : 'border-slate-200 dark:border-slate-700 focus:border-primary focus:ring-2 focus:ring-primary/20'
                    }`}
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex justify-between items-center px-1">
                  <span>Preview:</span>
                  <span className="text-primary">
                    {formatCurrency(
                      watch('consultationFee') || 0,
                      vndCurrencyOptions
                    )}
                  </span>
                </p>
              </div>
              {errors.consultationFee && (
                <p className="text-sm text-red-500">
                  {errors.consultationFee.message}
                </p>
              )}
            </div>
          )}

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-lg bg-primary hover:opacity-90 text-slate-900 font-bold transition-all shadow-lg shadow-primary/20 disabled:opacity-70 flex items-center gap-2"
            >
              {isSubmitting && (
                <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
              )}
              {t('SystemAdmin.staff.actions.create', 'Create Staff')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
