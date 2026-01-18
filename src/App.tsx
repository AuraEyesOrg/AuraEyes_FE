import { ToastContainer } from 'react-toastify';
import Router from './routes';
import { AppProvider } from './provider';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <AppProvider>
      <Router />
      <ToastContainer position="bottom-right" />
    </AppProvider>
  );
}

export default App;
