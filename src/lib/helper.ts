interface FormatCurrencyOptions {
  locale?: string;
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  currencyDisplay?: Intl.NumberFormatOptions['currencyDisplay'];
  absolute?: boolean;
  useCurrencyStyle?: boolean;
  suffix?: string;
}

export const formatCurrency = (
  value: number,
  options: FormatCurrencyOptions = {}
) => {
  const {
    locale = 'vi-VN',
    currency = 'VND',
    minimumFractionDigits,
    maximumFractionDigits,
    currencyDisplay,
    absolute = false,
    useCurrencyStyle = true,
    suffix = '',
  } = options;

  const amount = absolute ? Math.abs(value) : value;
  const formatterOptions: Intl.NumberFormatOptions = {
    ...(useCurrencyStyle ? { style: 'currency', currency } : {}),
    ...(minimumFractionDigits !== undefined ? { minimumFractionDigits } : {}),
    ...(maximumFractionDigits !== undefined ? { maximumFractionDigits } : {}),
    ...(currencyDisplay ? { currencyDisplay } : {}),
  };

  const formatted = new Intl.NumberFormat(locale, formatterOptions).format(
    amount
  );

  return suffix ? `${formatted}${suffix}` : formatted;
};
