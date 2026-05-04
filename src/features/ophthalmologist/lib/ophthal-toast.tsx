import type { ReactNode } from 'react';
import { CheckCircle2, CircleX, Info, TriangleAlert } from 'lucide-react';
import i18n from '@/i18n/i18n';
import {
  toast,
  type ToastContent,
  type ToastOptions,
  type Id,
} from 'react-toastify';

const BASE_TOAST_OPTIONS: ToastOptions = {
  position: 'top-right',
  autoClose: 4000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

const createIcon =
  (icon: ReactNode): ToastOptions['icon'] =>
  () =>
    icon;

const SUCCESS_ICON = <CheckCircle2 className="h-4 w-4" />;
const ERROR_ICON = <CircleX className="h-4 w-4" />;
const WARNING_ICON = <TriangleAlert className="h-4 w-4" />;
const INFO_ICON = <Info className="h-4 w-4" />;

type ConfirmOptions = {
  confirmLabel?: string;
  cancelLabel?: string;
};

const confirm = (
  message: string,
  options: ConfirmOptions = {}
): Promise<boolean> =>
  new Promise((resolve) => {
    let settled = false;
    const settle = (value: boolean) => {
      if (settled) return;
      settled = true;
      resolve(value);
    };

    toast.info(
      ({ closeToast }) => (
        <div className="space-y-3">
          <p className="text-sm leading-5 text-slate-900">{message}</p>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                settle(false);
                closeToast?.();
              }}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
            >
              {options.cancelLabel ??
                i18n.t('Ophthalmologist.common.cancel', 'Cancel')}
            </button>
            <button
              onClick={() => {
                settle(true);
                closeToast?.();
              }}
              className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white"
            >
              {options.confirmLabel ??
                i18n.t('Ophthalmologist.common.confirm', 'Confirm')}
            </button>
          </div>
        </div>
      ),
      {
        ...BASE_TOAST_OPTIONS,
        icon: createIcon(INFO_ICON),
        autoClose: false,
        closeOnClick: false,
        closeButton: false,
        draggable: false,
        onClose: () => settle(false),
      }
    );
  });

const success = (content: ToastContent, options?: ToastOptions): Id =>
  toast.success(content, {
    ...BASE_TOAST_OPTIONS,
    icon: createIcon(SUCCESS_ICON),
    ...options,
  });

const error = (content: ToastContent, options?: ToastOptions): Id =>
  toast.error(content, {
    ...BASE_TOAST_OPTIONS,
    icon: createIcon(ERROR_ICON),
    ...options,
  });

const warning = (content: ToastContent, options?: ToastOptions): Id =>
  toast.warning(content, {
    ...BASE_TOAST_OPTIONS,
    icon: createIcon(WARNING_ICON),
    ...options,
  });

const info = (content: ToastContent, options?: ToastOptions): Id =>
  toast.info(content, {
    ...BASE_TOAST_OPTIONS,
    icon: createIcon(INFO_ICON),
    ...options,
  });

export const ophthalToast = {
  success,
  error,
  warning,
  info,
  confirm,
};
