import axios from 'axios';

const aiCoreClient = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
});

export default aiCoreClient;
export { aiCoreClient };
