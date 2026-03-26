# Retinal Analysis Mock Data Guide

## 📋 Overview

This mock data module provides **11 representative cases** from the **39-disease classification system** for testing the retinal analysis feature without requiring the actual AI inference API.

## 📁 Files

- **`retinal-analysis-mock.json`** - Mock API responses matching the actual API format
- **`retinal-analysis-mock.service.ts`** - Service class with helper methods for accessing mock data
- **`index.ts`** - Exports for easy importing

## 🎯 Mock Cases Included

| Case ID               | Diagnosis            | Type         | Lesions | Note                   |
| --------------------- | -------------------- | ------------ | ------- | ---------------------- |
| mock-normal-001       | Normal               | normal       | 0       | Healthy retina         |
| mock-dr1-001          | DR1 (Mild)           | info         | 2       | Microaneurysms         |
| mock-dr2-001          | DR2 (Moderate)       | warning      | 3       | Hemorrhages + exudates |
| mock-dr3-001          | DR3 (Severe)         | critical     | 3       | Extensive changes      |
| mock-crvo-001         | CRVO                 | **critical** | 3       | **EMERGENCY**          |
| mock-glaucoma-001     | Possible Glaucoma    | warning      | 1       | Optic cup enlargement  |
| mock-rd-001           | Rhegmatogenous RD    | **critical** | 2       | **EMERGENCY**          |
| mock-rp-001           | Retinitis Pigmentosa | warning      | 1       | Progressive dystrophy  |
| mock-hypertensive-001 | Severe Hypertensive  | **critical** | 3       | **EMERGENCY**          |
| mock-cscr-001         | CSCR                 | caution      | 1       | Serous detachment      |
| mock-maculopathy-001  | Maculopathy          | caution      | 2       | Macular edema          |

## 🔗 API Response Format

All mock responses match the actual `/api/v1/diagnosis/analyze/frontend` response structure:

```json
{
  "image_id": "IMG-XXX",
  "filename": "image.jpg",
  "lesions": [
    {
      "id": "lesion_1",
      "name": "Disease Name",
      "confidence": 91,
      "description": "Human-readable description",
      "color": "bg-red-600",
      "type": "critical|warning|caution|info|normal",
      "location": {
        "x": 45,
        "y": 35,
        "width": 15,
        "height": 15
      }
    }
  ],
  "summary": {
    "total_lesions": 2,
    "primary_diagnosis": "Disease Name",
    "confidence": 91,
    "multi_disease": false
  }
}
```

## 💻 Usage Examples

### Import the service:

```typescript
import { RetinalAnalysisMockService } from '@/features/patient/mock';
```

### Get a specific mock case:

```typescript
const mockResponse = RetinalAnalysisMockService.getCaseById('mock-crvo-001');
setAnalysisResult(mockResponse);
```

### Get a random case for testing:

```typescript
const randomCase = RetinalAnalysisMockService.getRandomCase();
setAnalysisResult(randomCase);
```

### Get critical cases (for emergency testing):

```typescript
const criticalCases = RetinalAnalysisMockService.getCriticalCases();
// Use for testing urgent intervention flows
```

### Get cases by diagnosis:

```typescript
const diabeticCases = RetinalAnalysisMockService.getCasesByDiagnosis('DR');
```

### Get cases by urgency type:

```typescript
const warningCases = RetinalAnalysisMockService.getCasesByUrgency('warning');
const criticalCases = RetinalAnalysisMockService.getCasesByUrgency('critical');
```

### Get simple vs complex cases:

```typescript
// For basic UI testing
const simpleCase = RetinalAnalysisMockService.getSimpleCase();

// For complex rendering testing
const complexCase = RetinalAnalysisMockService.getComplexCase();
```

### Get all available diagnoses:

```typescript
const diagnoses = RetinalAnalysisMockService.getDiagnoses();
// Returns: ["Normal", "DR1 (Mild...)", "DR2 (Moderate...)", ...]
```

## 🔄 Integration with retinal-analysis.tsx

### Before (using real API):

```typescript
// In retinal-analysis.tsx
const { data: analysisResult, isLoading } = useQuery({
  queryKey: ['diagnosis', imageId],
  queryFn: async () => {
    const response = await aiCoreClient.post(
      '/api/v1/diagnosis/analyze/frontend',
      {
        image: imageData,
      }
    );
    return response.data;
  },
});
```

### After (using mock data for testing):

```typescript
import { RetinalAnalysisMockService } from '../mock';

// For development/testing
const [analysisResult, setAnalysisResult] = useState(null);
const [isLoading, setIsLoading] = useState(false);

// Simulate API call delay
const loadMockAnalysis = async () => {
  setIsLoading(true);
  await new Promise((resolve) => setTimeout(resolve, 800)); // 800ms delay

  // Get mock case
  const mockCase = RetinalAnalysisMockService.getRandomCase();
  setAnalysisResult(RetinalAnalysisMockService.formatResponse(mockCase));
  setIsLoading(false);
};

// Or use specific mock for testing
const loadSpecificMock = async (caseId: string) => {
  setIsLoading(true);
  await new Promise((resolve) => setTimeout(resolve, 500));

  const mockCase = RetinalAnalysisMockService.getCaseById(caseId);
  if (mockCase) {
    setAnalysisResult(RetinalAnalysisMockService.formatResponse(mockCase));
  }
  setIsLoading(false);
};
```

## 🎨 Color Mapping

Mock data uses Tailwind CSS color classes:

- **`bg-red-600`** - Critical severity (EMERGENCY)
- **`bg-red-500`** - Warning severity (HIGH priority)
- **`bg-orange-500`** - Caution severity (MEDIUM priority)
- **`bg-yellow-500`** - Info severity (LOW priority)
- **`bg-green-500`** - Normal (OK)

## 🗺️ Disease Type Mapping

All 39 diseases are mapped to one of 5 urgency types:

```json
{
  "critical": "Requires immediate intervention (RD, severe DR, CRVO, etc.)",
  "warning": "Requires urgent evaluation (moderate DR, glaucoma, etc.)",
  "caution": "Requires monitoring (CSCR, maculopathy, etc.)",
  "info": "Borderline findings (microaneurysms, etc.)",
  "normal": "No pathology detected"
}
```

## 📊 Statistics

- **Total mock cases**: 11
- **Critical cases**: 3 (CRVO, RD, Hypertensive)
- **Warning cases**: 4 (DR1/2, Glaucoma, RP)
- **Caution cases**: 2 (CSCR, Maculopathy)
- **Info cases**: 1 (DR1)
- **Normal cases**: 1

## 🧪 Testing Tips

### Testing UI rendering:

```typescript
// Simple case with no lesions
const simple = RetinalAnalysisMockService.getSimpleCase();

// Complex case with multiple lesions
const complex = RetinalAnalysisMockService.getComplexCase();
```

### Testing urgency flows:

```typescript
// Emergency cases
const emergencies = RetinalAnalysisMockService.getCriticalCases();

// Routine cases
const routine = RetinalAnalysisMockService.getSimpleCase();
```

### Testing disease-specific handling:

```typescript
// Get all diabetic cases
const drCases = RetinalAnalysisMockService.getCasesByDiagnosis('DR');

// Get all vascular occlusion cases
const occlusions =
  RetinalAnalysisMockService.getCasesByDiagnosis('CRVO|BRVO|RAO');
```

## 🔄 Switching to Real API

When ready to switch from mock to real API:

1. Remove the mock data loading logic
2. Keep the same response format (service will format it identically)
3. Real API will return the same structure, so components need no changes

## 📝 Notes

- Mock data uses **percentage-based coordinates** (0-100) for lesion locations
- Confidence scores are **0-100** (not decimal 0-1)
- All responses include `multi_disease` flag for handling co-occurring conditions
- Lesion types used: `critical`, `warning`, `caution`, `info`, `normal`
