import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useChangePassword } from '@/features/patient/hooks/useProfile';
import { extractApiErrorMessage } from '@/lib/api-error';
import useAuthStore from '@/store/auth-store';
import { getCurrentUser } from '../api/auth.api';
import { resolvePathWithLocale } from '@/i18n/middleware';

export default function ForceChangePasswordPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const changePasswordMutation = useChangePassword();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number | null>(
    null
  );

  useEffect(() => {
    const isOrgAdmin =
      user?.roles?.includes('OrgAdmin') ||
      user?.roles?.includes('Organization');

    if (!isOrgAdmin) {
      navigate(resolvePathWithLocale('/'), { replace: true });
      return;
    }

    if (!user?.mustChangePassword) {
      navigate(resolvePathWithLocale('/organisation/dashboard'), {
        replace: true,
      });
    }
  }, [navigate, user]);

  useEffect(() => {
    if (redirectCountdown === null) {
      return;
    }

    if (redirectCountdown <= 0) {
      navigate(resolvePathWithLocale('/organisation/dashboard'), {
        replace: true,
      });
      return;
    }

    const timer = window.setTimeout(() => {
      setRedirectCountdown((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [navigate, redirectCountdown]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (newPassword !== confirmNewPassword) {
      toast.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
        confirmNewPassword,
      });

      const refreshedUser = await getCurrentUser();
      setUser({
        ...user,
        ...refreshedUser,
        mustChangePassword: false,
      });

      toast.success('Đổi mật khẩu thành công.');
      setRedirectCountdown(5);
    } catch (error) {
      toast.error(
        extractApiErrorMessage(
          error,
          'Không thể đổi mật khẩu. Vui lòng kiểm tra lại mật khẩu hiện tại.'
        )
      );
    }
  };

  if (redirectCountdown !== null) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-900/20">
          <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-300">
            <CheckCircle className="h-7 w-7" />
          </div>
          <h1 className="text-2xl font-bold">Đổi mật khẩu thành công</h1>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Mật khẩu mới đã được cập nhật. Hệ thống sẽ chuyển bạn về trang tổng
            quan tổ chức.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
            <Loader2 className="h-4 w-4 animate-spin" />
            Chuyển hướng sau {redirectCountdown}s...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto w-full max-w-xl rounded-3xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-cyan-900/20">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-300">
          <ShieldCheck className="h-7 w-7" />
        </div>

        <h1 className="text-2xl font-bold">Đổi mật khẩu lần đầu</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Bạn đang đăng nhập bằng mật khẩu tạm. Hãy cập nhật mật khẩu mới để
          tiếp tục sử dụng tài khoản tổ chức.
        </p>

        <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
          <PasswordInput
            label="Mật khẩu hiện tại"
            value={currentPassword}
            onChange={setCurrentPassword}
            show={showCurrentPassword}
            onToggleShow={() => setShowCurrentPassword((prev) => !prev)}
            disabled={changePasswordMutation.isPending}
          />

          <PasswordInput
            label="Mật khẩu mới"
            value={newPassword}
            onChange={setNewPassword}
            show={showNewPassword}
            onToggleShow={() => setShowNewPassword((prev) => !prev)}
            disabled={changePasswordMutation.isPending}
          />

          <PasswordInput
            label="Xác nhận mật khẩu mới"
            value={confirmNewPassword}
            onChange={setConfirmNewPassword}
            show={showConfirmPassword}
            onToggleShow={() => setShowConfirmPassword((prev) => !prev)}
            disabled={changePasswordMutation.isPending}
          />

          <button
            type="submit"
            disabled={changePasswordMutation.isPending}
            className="mt-2 inline-flex w-full items-center justify-center rounded-xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {changePasswordMutation.isPending
              ? 'Đang cập nhật...'
              : 'Cập nhật mật khẩu'}
          </button>
        </form>
      </div>
    </div>
  );
}

type PasswordInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  show: boolean;
  onToggleShow: () => void;
  disabled: boolean;
};

function PasswordInput({
  label,
  value,
  onChange,
  show,
  onToggleShow,
  disabled,
}: PasswordInputProps) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-300">
        {label}
      </span>
      <div className="relative">
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          required
          disabled={disabled}
          className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 pr-12 text-sm text-white outline-none transition focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <button
          type="button"
          onClick={onToggleShow}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-200"
          disabled={disabled}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}
