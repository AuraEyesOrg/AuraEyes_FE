/**
 * Mock data for retinal analysis API responses
 * Maps 39 disease types with real-like analysis results
 * Used for testing retinal-analysis.tsx page without real API
 */

import mockData from './retinal-analysis-mock.json';

export interface MockAnalysisResponse {
  caseId: string;
  description: string;
  image_id: string;
  filename: string;
  lesions: Array<{
    id: string;
    name: string;
    confidence: number; // 0-100
    description: string;
    color: string; // Tailwind color class
    type: 'info' | 'caution' | 'warning' | 'critical' | 'normal';
    location: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  summary: {
    total_lesions: number;
    primary_diagnosis: string;
    confidence: number; // 0-100
    multi_disease: boolean;
  };
}

export class RetinalAnalysisMockService {
  /**
   * Get all mock cases
   */
  static getAllCases(): MockAnalysisResponse[] {
    return mockData.mockResponses;
  }

  /**
   * Get a specific mock case by ID
   */
  static getCaseById(caseId: string): MockAnalysisResponse | undefined {
    return mockData.mockResponses.find((c) => c.caseId === caseId);
  }

  /**
   * Get random mock case for testing
   */
  static getRandomCase(): MockAnalysisResponse {
    const cases = mockData.mockResponses;
    return cases[Math.floor(Math.random() * cases.length)];
  }

  /**
   * Get cases by primary diagnosis
   */
  static getCasesByDiagnosis(diagnosis: string): MockAnalysisResponse[] {
    return mockData.mockResponses.filter((c) =>
      c.summary.primary_diagnosis.includes(diagnosis)
    );
  }

  /**
   * Get cases with specific urgency level
   */
  static getCasesByUrgency(
    type: 'critical' | 'warning' | 'caution' | 'info' | 'normal'
  ): MockAnalysisResponse[] {
    return mockData.mockResponses.filter(
      (c) =>
        c.lesions.some((lesion) => lesion.type === type) ||
        (type === 'normal' && c.lesions.length === 0)
    );
  }

  /**
   * Get case with most lesions (for complex testing)
   */
  static getComplexCase(): MockAnalysisResponse {
    return mockData.mockResponses.reduce((prev, current) =>
      current.lesions.length > prev.lesions.length ? current : prev
    );
  }

  /**
   * Get case with least lesions (for simple testing)
   */
  static getSimpleCase(): MockAnalysisResponse {
    return mockData.mockResponses.reduce((prev, current) =>
      current.lesions.length < prev.lesions.length ? current : prev
    );
  }

  /**
   * Get critical cases requiring immediate intervention
   */
  static getCriticalCases(): MockAnalysisResponse[] {
    return mockData.mockResponses.filter((c) =>
      c.lesions.some((lesion) => lesion.type === 'critical')
    );
  }

  /**
   * Map disease name to color type
   */
  static getDiseaseColorType(diagnosis: string): string {
    return (
      (mockData.diseaseToLesionType as Record<string, string>)[diagnosis] ||
      'info'
    );
  }

  /**
   * Get all unique diagnoses from mock data
   */
  static getDiagnoses(): string[] {
    return Array.from(
      new Set(mockData.mockResponses.map((c) => c.summary.primary_diagnosis))
    );
  }

  /**
   * Format response for component consumption
   * Mirrors actual API response structure
   */
  static formatResponse(mockCase: MockAnalysisResponse): MockAnalysisResponse {
    return {
      ...mockCase,
      // Ensure all needed fields are present
      lesions: mockCase.lesions.map((lesion) => ({
        ...lesion,
        confidence: Math.max(0, Math.min(100, lesion.confidence)), // Ensure 0-100
      })),
    };
  }
}

/**
 * Usage example in retinal-analysis.tsx:
 *
 * import { RetinalAnalysisMockService } from './mock/retinal-analysis-mock.service';
 *
 * const mockCase = RetinalAnalysisMockService.getRandomCase();
 * // or
 * const mockCase = RetinalAnalysisMockService.getCaseById('mock-crvo-001');
 *
 * // Then use mockCase as your analysis response
 * const formattedResponse = RetinalAnalysisMockService.formatResponse(mockCase);
 */

export default RetinalAnalysisMockService;
