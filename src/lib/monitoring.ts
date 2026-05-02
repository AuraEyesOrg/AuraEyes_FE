import { getWebInstrumentations, initializeFaro } from '@grafana/faro-web-sdk';

export function initMonitoring() {
  const faroUrl =
    import.meta.env.VITE_FARO_URL || 'http://localhost:12347/collect'; // Replace with actual collector URL

  if (!faroUrl) {
    console.warn('Faro URL not configured, monitoring disabled');
    return;
  }

  initializeFaro({
    url: faroUrl,
    app: {
      name: 'auraeyes-frontend',
      version: '1.0.0',
      environment: import.meta.env.MODE,
    },
    instrumentations: [...getWebInstrumentations()],
  });

  console.log('Grafana Faro monitoring initialized');
}
