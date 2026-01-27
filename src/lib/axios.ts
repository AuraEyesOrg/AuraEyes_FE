import axios from 'axios';

/**
 * AI Core client for ML/Python service
 * Used for AI inference and model-related operations
 */
const aiCoreClient = axios.create({
  baseURL:
    (import.meta.env.VITE_AI_CORE_ENDPOINT as string) ||
    'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // AI operations may take longer
});

export default aiCoreClient;
export { aiCoreClient };
