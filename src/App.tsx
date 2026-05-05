import { ErrorInfo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import { ErrorFallback } from './components/ui/errorfallback';
import { AppProvider } from './provider';
import Router from './routes';

function App() {
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
    </>
  );
}

export default App;
