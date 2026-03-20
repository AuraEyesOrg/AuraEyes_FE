import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AuthLayout } from '@/components/layouts';
import {
  Mail,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { confirmEmail, resendConfirmation } from '../api';

type PageState = 'verifying' | 'success' | 'error' | 'resend';

const ConfirmEmailPage = () => {
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const token = searchParams.get('token');

  const [state, setState] = useState<PageState>(
    userId && token ? 'verifying' : 'resend'
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  const didVerify = useRef(false);

  useEffect(() => {
    if (!userId || !token || didVerify.current) return;
    didVerify.current = true;

    confirmEmail({ userId, token })
      .then(() => setState('success'))
      .catch((err) => {
        const msg =
          err?.response?.data?.message ||
          err?.response?.data?.errors?.[0] ||
          'Xác nhận email thất bại. Liên kết có thể đã hết hạn.';
        setErrorMessage(msg);
        setState('error');
      });
  }, [userId, token]);

  const handleResend = async () => {
    if (!resendEmail) return;
    setResendLoading(true);
    try {
      await resendConfirmation({ email: resendEmail });
      setResendSent(true);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthLayout>
      {state === 'verifying' && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Đang xác nhận email...
          </h2>
          <p className="text-gray-500 text-sm">Vui lòng đợi trong giây lát.</p>
        </div>
      )}

      {state === 'success' && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-green-100 text-green-600 mb-6">
            <CheckCircle className="h-9 w-9" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Email đã xác nhận!
          </h2>
          <p className="text-gray-500 text-sm mb-8">
            Tài khoản của bạn đã được kích hoạt thành công. Đăng nhập để tiếp
            tục.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-background-dark font-semibold py-3 px-8 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(19,236,236,0.39)] hover:shadow-[0_6px_20px_rgba(19,236,236,0.23)] hover:-translate-y-0.5"
          >
            Đăng nhập ngay
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {state === 'error' && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-red-100 text-red-600 mb-6">
            <XCircle className="h-9 w-9" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Xác nhận thất bại
          </h2>
          <p className="text-gray-500 text-sm mb-6">{errorMessage}</p>
          <button
            type="button"
            onClick={() => setState('resend')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <RefreshCw className="h-4 w-4" />
            Gửi lại email xác nhận
          </button>
          <div className="mt-6 border-t border-gray-100 pt-6 w-full">
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-gray-900"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      )}

      {state === 'resend' && (
        <>
          <div className="mb-8 text-center sm:text-left">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary/10 text-primary mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Kiểm tra hộp thư
            </h2>
            <p className="text-gray-500 text-sm">
              Chúng tôi đã gửi link xác nhận đến email của bạn. Nếu chưa nhận
              được, hãy gửi lại bên dưới.
            </p>
          </div>

          {resendSent ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircle className="h-10 w-10 text-green-500 mb-3" />
              <p className="text-gray-700 font-medium">
                Email xác nhận đã được gửi lại!
              </p>
              <p className="text-gray-500 text-sm mt-1">
                Vui lòng kiểm tra hộp thư của bạn.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="block text-sm font-semibold text-gray-700">
                  Địa chỉ Email
                </label>
                <input
                  type="email"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="block w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors text-gray-900 placeholder-gray-400 text-sm"
                />
              </div>
              <button
                type="button"
                onClick={handleResend}
                disabled={resendLoading || !resendEmail}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-background-dark font-semibold py-3 px-4 rounded-xl transition-all shadow-[0_4px_14px_0_rgba(19,236,236,0.39)] hover:shadow-[0_6px_20px_rgba(19,236,236,0.23)] hover:-translate-y-0.5"
              >
                {resendLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>
                    Gửi lại email xác nhận
                    <RefreshCw className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          )}

          <div className="text-center border-t border-gray-100 pt-6 mt-6">
            <Link
              to="/login"
              className="text-sm text-gray-500 hover:text-gray-900 flex items-center justify-center gap-2"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </>
      )}
    </AuthLayout>
  );
};

export default ConfirmEmailPage;
