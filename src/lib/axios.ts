import axios from 'axios';

/**
 * AI Core client for ML/Python service
 * Used for AI inference and model-related operations
 */
const aiCoreClient = axios.create({
  baseURL:
    (import.meta.env.VITE_API_END_AI_POINT as string) ||
    'http://localhost:8000',
  timeout: 120000,
});

export default aiCoreClient;
export { aiCoreClient };
