import { ToastContainer } from 'react-toastify';
import Header from '@/components/ui/header';
import Router from './routes';
import { AppProvider } from './provider';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <AppProvider>
      <div className="min-h-screen bg-gradient-to-b from-dark via-[#0d223f] to-dark text-white">
        <Header />
        <main className="mx-auto max-w-6xl px-6 pb-12 pt-8">
          <Router />
        </main>
      </div>
      <ToastContainer position="bottom-right" />
    </AppProvider>
  );
}

export default App;
