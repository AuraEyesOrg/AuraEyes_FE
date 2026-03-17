import { Link } from 'react-router-dom';
import { useState, type InputHTMLAttributes, type ReactNode } from 'react';
import { useForm } from 'react-hook-form';
import {
  Building2,
  Mail,
  User,
  Phone,
  MapPin,
  FileText,
  CheckCircle,
  Eye,
} from 'lucide-react';
import { registerOrganisation } from '../api/auth.api';
import { extractApiErrorMessage } from '@/lib/api-error';

interface OrganisationFormData {
  organisationName: string;
  orgType: '1' | '2';
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  licenseNumber: string;
  notes: string;
}

export default function RegisterOrganisationPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrganisationFormData>({
    defaultValues: { orgType: '2' },
  });

  const onSubmit = async (data: OrganisationFormData) => {
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await registerOrganisation({
        organisationName: data.organisationName.trim(),
        orgType: Number(data.orgType),
        contactFullName: data.contactFullName.trim(),
        contactEmail: data.contactEmail.trim(),
        contactPhone: data.contactPhone.trim() || undefined,
        address: data.address.trim() || undefined,
        licenseNumber: data.licenseNumber.trim() || undefined,
        notes: data.notes.trim() || undefined,
      });
      setSubmittedEmail(data.contactEmail.trim());
      setIsSubmitted(true);
    } catch (error) {
      setSubmitError(
        extractApiErrorMessage(
          error,
          'Không thể gửi đăng ký tổ chức. Vui lòng thử lại.'
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen grid lg:grid-cols-[0.9fr_1.1fr] bg-slate-950 text-white">
        <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(0,229,255,0.18),_transparent_32%),linear-gradient(160deg,#06131a_0%,#0f172a_55%,#111827_100%)] p-8 lg:p-14">
          <div className="flex items-center gap-3 text-cyan-300">
            <Eye className="h-9 w-9" />
            <span className="text-2xl font-bold tracking-[0.2em]">AURA</span>
          </div>
          <div className="mt-20 max-w-xl">
            <p className="mb-4 text-sm uppercase tracking-[0.35em] text-cyan-200/70">
              Organisation Onboarding
            </p>
            <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
              Yêu cầu đã được gửi đến System Admin.
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-300">
              Sau khi xác nhận, tổ chức của bạn sẽ nhận tài khoản đăng nhập qua
              email và tiếp tục ký hợp đồng ngay trên hệ thống.
            </p>
          </div>
        </section>
        <section className="flex items-center justify-center bg-white px-6 py-12 text-slate-900 lg:px-16">
          <div className="w-full max-w-xl rounded-3xl border border-emerald-100 bg-emerald-50 p-8 shadow-xl shadow-emerald-100/60">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500 text-white">
              <CheckCircle className="h-8 w-8" />
            </div>
            <h2 className="text-3xl font-bold">Đã ghi nhận đăng ký</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Thông báo đã được gửi đến System Admin. Tài khoản quản trị tổ chức
              sẽ được cấp sau khi hồ sơ được xác nhận.
            </p>
            <div className="mt-6 rounded-2xl bg-white p-5 text-sm text-slate-700 shadow-sm">
              Email liên hệ: <strong>{submittedEmail}</strong>
            </div>
            <div className="mt-8 flex gap-3">
              <Link
                to="/login"
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Về trang đăng nhập
              </Link>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700"
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[0.9fr_1.1fr] bg-slate-950 text-white">
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(0,229,255,0.18),_transparent_32%),linear-gradient(160deg,#06131a_0%,#0f172a_55%,#111827_100%)] p-8 lg:p-14">
        <div className="flex items-center gap-3 text-cyan-300">
          <Eye className="h-9 w-9" />
          <span className="text-2xl font-bold tracking-[0.2em]">AURA</span>
        </div>
        <div className="mt-20 max-w-xl">
          <p className="mb-4 text-sm uppercase tracking-[0.35em] text-cyan-200/70">
            Organisation Onboarding
          </p>
          <h1 className="text-4xl font-semibold leading-tight lg:text-5xl">
            Đăng ký tổ chức để triển khai sàng lọc trên AURA.
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-300">
            Điền thông tin đơn vị, System Admin sẽ xem xét, xác nhận và cấp tài
            khoản quản trị cùng luồng hợp đồng điện tử cho tổ chức của bạn.
          </p>
        </div>
      </section>

      <section className="bg-white px-6 py-10 text-slate-900 lg:px-16 lg:py-14">
        <div className="mx-auto max-w-xl">
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight">
              Đăng ký tổ chức
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Hồ sơ sẽ được gửi trực tiếp tới System Admin qua email cấu hình
              trong hệ thống.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Field label="Tên tổ chức" error={errors.organisationName?.message}>
              <Input
                icon={<Building2 className="h-4 w-4" />}
                placeholder="Aura Eye Clinic"
                {...register('organisationName', {
                  required: 'Tên tổ chức là bắt buộc',
                })}
              />
            </Field>

            <Field label="Loại hình" error={errors.orgType?.message}>
              <select
                {...register('orgType', { required: 'Loại hình là bắt buộc' })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500"
              >
                <option value="2">Clinic</option>
                <option value="1">Hospital</option>
              </select>
            </Field>

            <div className="grid gap-5 md:grid-cols-2">
              <Field
                label="Người liên hệ"
                error={errors.contactFullName?.message}
              >
                <Input
                  icon={<User className="h-4 w-4" />}
                  placeholder="Nguyen Van A"
                  {...register('contactFullName', {
                    required: 'Người liên hệ là bắt buộc',
                  })}
                />
              </Field>
              <Field label="Email liên hệ" error={errors.contactEmail?.message}>
                <Input
                  icon={<Mail className="h-4 w-4" />}
                  placeholder="admin@clinic.vn"
                  {...register('contactEmail', {
                    required: 'Email là bắt buộc',
                  })}
                />
              </Field>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Số điện thoại" error={errors.contactPhone?.message}>
                <Input
                  icon={<Phone className="h-4 w-4" />}
                  placeholder="0909123456"
                  {...register('contactPhone')}
                />
              </Field>
              <Field label="Mã giấy phép" error={errors.licenseNumber?.message}>
                <Input
                  icon={<FileText className="h-4 w-4" />}
                  placeholder="GP-2026-001"
                  {...register('licenseNumber')}
                />
              </Field>
            </div>

            <Field label="Địa chỉ" error={errors.address?.message}>
              <Input
                icon={<MapPin className="h-4 w-4" />}
                placeholder="123 Nguyen Hue, Ho Chi Minh City"
                {...register('address')}
              />
            </Field>

            <Field label="Ghi chú" error={errors.notes?.message}>
              <textarea
                {...register('notes')}
                rows={4}
                placeholder="Nhu cầu triển khai, số lượng bác sĩ, yêu cầu hợp tác..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-cyan-500"
              />
            </Field>

            {submitError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isSubmitting ? 'Đang gửi...' : 'Gửi đăng ký tổ chức'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

type FieldProps = {
  label: string;
  error?: string;
  children: ReactNode;
};

function Field({ label, error, children }: FieldProps) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  icon: ReactNode;
};

function Input({ icon, className, ...props }: InputProps) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
        {icon}
      </span>
      <input
        {...props}
        className={`w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-cyan-500 ${className ?? ''}`}
      />
    </div>
  );
}
