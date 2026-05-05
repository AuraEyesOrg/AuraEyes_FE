
import axios from 'axios';

const baseURL = 'https://localhost:5001/api';
const url = '/system-admin/dashboard/transaction-stats';

console.log('Testing Axios URL concatenation:');
console.log('baseURL:', baseURL);
console.log('url:', url);

const instance = axios.create({ baseURL });

// Axios doesn't expose a simple way to get the final URL without making a request,
// but we can look at the config in a request interceptor.
instance.interceptors.request.use((config) => {
  const finalURL = config.baseURL + config.url; // This is a simplification
  console.log('Simple concatenation:', finalURL);
  
  // Real axios behavior:
  // if url starts with /, it might replace the path in baseURL depending on implementation
  return config;
});

// We won't actually make the request, just testing logic.
