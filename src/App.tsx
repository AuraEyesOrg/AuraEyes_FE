import { ToastContainer } from 'react-toastify';
import Router from './routes';
import { AppProvider } from './provider';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorFallback } from './components/ui/errorfallback';
import { ErrorInfo } from 'react';

function App() {
  const isTelemetryEnabled =
    import.meta.env.PROD && import.meta.env.VITE_ENABLE_TELEMETRY !== 'false';

  // Hàm ghi log lỗi ra dịch vụ bên ngoài hoặc console
  const logErrorToService = (error: unknown, info: ErrorInfo) => {
    if (error instanceof Error) {
      console.error('Lỗi:', error.message);
      console.error('Stack:', info.componentStack);
    } else {
      console.error('Lỗi không xác định:', error);
    }
  };

  return (
    <>
      <AppProvider>
        <ErrorBoundary
          FallbackComponent={ErrorFallback}
          onError={logErrorToService}
          onReset={() => {
            window.location.reload();
          }}
        >
          <Router />
        </ErrorBoundary>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          limit={3}
        />
      </AppProvider>

      {/* Vercel Analytics & Speed Insights */}
      {isTelemetryEnabled && <Analytics />}
      {isTelemetryEnabled && <SpeedInsights />}
    </>
  );
}

export default App;
