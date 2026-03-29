/**
 * Disease Reference Database
 *
 * Provides metadata for all 39 retinal diseases. Lesion locations
 * come from API responses, not from this database.
 */

// Export disease mapping utilities and urgency levels
export {
  DISEASE_URGENCY_LEVELS,
  DISEASE_DESCRIPTIONS,
  getDiseaseUrgency,
  getDiseaseDescription,
  getCriticalDiseases,
  getWarningDiseases,
  isEmergency,
  countDiseasesByUrgency,
  getDiseaseInfo,
  getAllDiseases,
  getDiseaseCount,
} from './disease-mapping';

// Export disease database
export { default as diseaseDatabase } from './disease-database.json';
