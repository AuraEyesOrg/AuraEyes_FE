/**
 * Retinal Analysis Mock Data
 *
 * Contains 11 mock cases representing different retinal diseases
 * and conditions from the 39-disease classification system
 */

export { default as retinalAnalysisMockData } from './retinal-analysis-mock.json';
export {
  RetinalAnalysisMockService,
  type MockAnalysisResponse,
} from './retinal-analysis-mock.service';
export {
  DISEASE_TO_MOCK_CASE_MAP,
  DISEASE_URGENCY_LEVELS,
  DISEASE_DESCRIPTIONS,
  getMockCaseForDisease,
  getDiseaseUrgency,
  getDiseaseDescription,
  getCriticalDiseases,
  getWarningDiseases,
  isEmergency,
  countDiseasesByUrgency,
} from './disease-mapping';
