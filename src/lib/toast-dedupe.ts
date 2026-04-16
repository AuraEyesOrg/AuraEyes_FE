import {
  toast,
  type Id,
  type ToastContent,
  type ToastOptions,
} from 'react-toastify';

type DedupeMethod = 'success' | 'error' | 'info' | 'warning' | 'loading';

type ToastMethod = (content: ToastContent, options?: ToastOptions) => Id;

let isToastDeduplicationInstalled = false;

const resolveAutoToastId = (
  method: DedupeMethod,
  content: ToastContent,
  options?: ToastOptions
): Id | undefined => {
  if (options?.toastId !== undefined) {
    return options.toastId;
  }

  if (typeof content !== 'string') {
    return undefined;
  }

  const normalizedContent = content.trim();
  if (!normalizedContent) {
    return undefined;
  }

  return `auto-toast:${method}:${normalizedContent}`;
};

const wrapToastMethod = (
  method: DedupeMethod,
  original: ToastMethod
): ToastMethod => {
  return (content: ToastContent, options?: ToastOptions): Id => {
    const toastId = resolveAutoToastId(method, content, options);

    if (toastId !== undefined && toast.isActive(toastId)) {
      return toastId;
    }

    if (toastId === undefined) {
      return original(content, options);
    }

    return original(content, { ...options, toastId });
  };
};

export const installToastDeduplication = (): void => {
  if (isToastDeduplicationInstalled) {
    return;
  }

  isToastDeduplicationInstalled = true;

  const toastMutable = toast as unknown as {
    success: ToastMethod;
    error: ToastMethod;
    info: ToastMethod;
    warning: ToastMethod;
    warn: ToastMethod;
    loading: ToastMethod;
  };

  const originalSuccess = toast.success.bind(toast) as ToastMethod;
  const originalError = toast.error.bind(toast) as ToastMethod;
  const originalInfo = toast.info.bind(toast) as ToastMethod;
  const originalWarning = toast.warning.bind(toast) as ToastMethod;
  const originalLoading = toast.loading.bind(toast) as ToastMethod;

  toastMutable.success = wrapToastMethod('success', originalSuccess);
  toastMutable.error = wrapToastMethod('error', originalError);
  toastMutable.info = wrapToastMethod('info', originalInfo);
  toastMutable.warning = wrapToastMethod('warning', originalWarning);
  toastMutable.warn = toastMutable.warning;
  toastMutable.loading = wrapToastMethod('loading', originalLoading);
};
