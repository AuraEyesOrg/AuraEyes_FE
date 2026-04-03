import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Facebook, Linkedin, Mail, MapPin, Phone, Twitter } from 'lucide-react';
import { AuraLogo } from '@/components/ui/aura-logo';
import {
  DEFAULT_LOCALE,
  getLocaleFromPathname,
  withLocalePathname,
} from '@/i18n/locales';

export const Footer = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const locale = getLocaleFromPathname(location.pathname) ?? DEFAULT_LOCALE;
  const isVietnamese = locale === 'vi';

  const footerLabels = isVietnamese
    ? {
        platform: 'Khóa học',
        services: 'Dịch vụ',
        reserved: 'Tất cả quyền được bảo lưu',
        privacy: 'Chính sách bảo mật',
        terms: 'Điều khoản sử dụng',
      }
    : {
        platform: 'Platform',
        services: 'Services',
        reserved: 'All rights reserved',
        privacy: 'Privacy policy',
        terms: 'Terms of use',
      };

  return (
    <footer className="border-t border-[#D8E0EA] bg-[#EEF2F7]">
      <div className="mx-auto max-w-7xl px-4 pb-8 pt-14 sm:px-6 lg:px-8">
        <div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="max-w-sm">
            <div className="mb-5">
              <AuraLogo
                variant="dark"
                size="sm"
                to={withLocalePathname(locale)}
              />
            </div>
            <p className="text-[15px] leading-8 text-[#4A5568]">
              {t('GuestHome.description')}
            </p>
            <div className="mt-6 flex items-center gap-5">
              <a
                aria-label="Facebook"
                className="text-[#64748B] transition-colors hover:text-[#2B6CB0]"
                href="https://www.facebook.com/profile.php?id=61582143393953"
                rel="noreferrer"
                target="_blank"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                aria-label="Twitter"
                className="text-[#64748B] transition-colors hover:text-[#2B6CB0]"
                href="https://x.com"
                rel="noreferrer"
                target="_blank"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                aria-label="LinkedIn"
                className="text-[#64748B] transition-colors hover:text-[#2B6CB0]"
                href="https://www.linkedin.com"
                rel="noreferrer"
                target="_blank"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="mb-4 text-xl font-semibold leading-tight text-[#1A202C]">
              {t('Navigation.contact')}
            </h4>
            <ul className="space-y-3 text-sm leading-9 text-[#334E68]">
              <li>
                <a
                  className="flex items-start gap-3 transition-colors hover:text-[#2B6CB0]"
                  href="tel:19002115"
                >
                  <Phone className="mt-2 h-5 w-5 shrink-0 text-[#4299E1]" />
                  <span>1900 2115</span>
                </a>
              </li>
              <li>
                <a
                  className="flex items-start gap-3 transition-colors hover:text-[#2B6CB0]"
                  href="mailto:auraeyes4se@gmail.com"
                >
                  <Mail className="mt-2 h-5 w-5 shrink-0 text-[#4299E1]" />
                  <span>auraeyes4se@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-start gap-3">
                  <MapPin className="mt-2 h-5 w-5 shrink-0 text-[#4299E1]" />
                  <span>FPT University, HCM, VN</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-4 text-xl font-semibold leading-tight text-[#1A202C]">
              {footerLabels.services}
            </h4>
            <ul className="space-y-2 text-sm leading-9 text-[#334E68]">
              <li>
                <Link
                  className="transition-colors hover:text-[#2B6CB0]"
                  to={withLocalePathname(locale, '/about')}
                >
                  {t('Navigation.about')}
                </Link>
              </li>
              <li>
                <Link
                  className="transition-colors hover:text-[#2B6CB0]"
                  to={withLocalePathname(locale, '/ethics')}
                >
                  {t('Navigation.ethicsPrivacy')}
                </Link>
              </li>
              <li>
                <Link
                  className="transition-colors hover:text-[#2B6CB0]"
                  to={withLocalePathname(locale, '/contact')}
                >
                  {t('Navigation.contact')}
                </Link>
              </li>
              <li>
                <Link
                  className="transition-colors hover:text-[#2B6CB0]"
                  to={withLocalePathname(locale, '/compliance')}
                >
                  {t('Navigation.compliance')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform */}
          <div>
            <h4 className="mb-4 text-xl font-semibold leading-tight text-[#1A202C]">
              {footerLabels.platform}
            </h4>
            <ul className="space-y-2 text-sm leading-9 text-[#334E68]">
              <li>
                <Link
                  className="transition-colors hover:text-[#2B6CB0]"
                  to={withLocalePathname(locale, '/how-it-works')}
                >
                  {t('Navigation.howItWorks')}
                </Link>
              </li>
              <li>
                <Link
                  className="transition-colors hover:text-[#2B6CB0]"
                  to={withLocalePathname(locale, '/status')}
                >
                  {t('Navigation.status')}
                </Link>
              </li>
              <li>
                <Link
                  className="transition-colors hover:text-[#2B6CB0]"
                  to={withLocalePathname(locale, '/compliance')}
                >
                  {t('Navigation.compliance')}
                </Link>
              </li>
              <li>{t('MedicalTerms.retinalScreening')}</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col gap-4 border-t border-[#D8E0EA] pt-8 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-[#5E7290]">
            2026 © AURA Health. {footerLabels.reserved}
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-[#5E7290]">
            <Link
              className="transition-colors hover:text-[#2B6CB0]"
              to={withLocalePathname(locale, '/ethics')}
            >
              {footerLabels.privacy}
            </Link>
            <Link
              className="transition-colors hover:text-[#2B6CB0]"
              to={withLocalePathname(locale, '/compliance')}
            >
              {footerLabels.terms}
            </Link>
            <Link
              className="transition-colors hover:text-[#2B6CB0]"
              to={withLocalePathname(locale, '/about')}
            >
              {t('Navigation.about')}
            </Link>
            <Link
              className="inline-flex items-center gap-2 transition-colors hover:text-[#2B6CB0]"
              to="https://status.auraeyes.site"
            >
              <span className="h-2.5 w-2.5 rounded-full bg-[#12B76A]" />
              {t('Navigation.status')}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
