import { GoogleOAuthProvider } from '@react-oauth/google';
import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { queryClient } from './lib/react-query';
import { ThemeProvider } from './contexts/ThemeContext';
import { useSignalRNotification } from './hooks/useSignalRNotification';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

/**
 * SignalR provider component to initialize real-time notifications
 */
function SignalRProvider({ children }: { children: ReactNode }) {
  // Initialize SignalR connection (will auto-connect when authenticated)
  useSignalRNotification();

  return <>{children}</>;
}

export function AppProvider({ children }: { children: ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID} locale="en">
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SignalRProvider>{children}</SignalRProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}
