import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { HelmetProvider } from 'react-helmet-async';
import { queryClient } from './lib/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { useSignalRNotification } from './hooks/useSignalRNotification';
import { useSignalRChat } from './hooks/useSignalRChat';
import { I18nProvider } from '@/i18n/I18nProvider';
import { isSupportedLocale } from '@/i18n/locales';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

/**
 * SignalR provider component to initialize real-time notifications
 */
function SignalRProvider({ children }: { children: ReactNode }) {
  // Dedicated hubs: NotificationHub + ChatHub (auto-connect when authenticated)
  useSignalRNotification();
  useSignalRChat();

  return <>{children}</>;
}

function GoogleI18nProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const resolved = i18n.resolvedLanguage ?? i18n.language;
  const googleLocale = isSupportedLocale(resolved) ? resolved : 'en';

  return (
    <GoogleOAuthProvider
      key={`google-oauth-${googleLocale}`}
      clientId={GOOGLE_CLIENT_ID}
      locale={googleLocale}
    >
      {children}
    </GoogleOAuthProvider>
  );
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <HelmetProvider>
      <I18nProvider>
        <GoogleI18nProvider>
          <QueryClientProvider client={queryClient}>
            <ThemeProvider>
              <SignalRProvider>{children}</SignalRProvider>
            </ThemeProvider>
          </QueryClientProvider>
        </GoogleI18nProvider>
      </I18nProvider>
    </HelmetProvider>
  );
}
