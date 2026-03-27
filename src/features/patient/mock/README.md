# Disease Reference Database

## 📋 Overview

This module provides a **39-disease reference database** for retinal analysis feature development.

**Key Point:** This database contains disease **metadata only** (name, description, severity, findings, recommendations). **Lesion locations come from API responses**, not mocked.

## 📁 Files

| File                    | Purpose                                                  |
| ----------------------- | -------------------------------------------------------- |
| `disease-database.json` | Complete 39-disease reference with metadata              |
| `disease-mapping.ts`    | Utility functions for disease lookups and urgency levels |
| `index.ts`              | Public exports                                           |

## 🎯 39 Diseases Covered

All diseases organized by clinical category:

| Category                   | Count | Examples                                                                          |
| -------------------------- | ----- | --------------------------------------------------------------------------------- |
| Normal                     | 1     | Normal                                                                            |
| Diabetic Retinopathy       | 3     | DR1, DR2, DR3                                                                     |
| Retinal Vascular Occlusion | 3     | BRVO, CRVO, RAO                                                                   |
| Retinal Detachment         | 1     | Rhegmatogenous RD                                                                 |
| Macular Disorders          | 4     | Maculopathy, CSCR, ERM, MH                                                        |
| Optic Nerve                | 4     | Possible Glaucoma, Large Optic Cup, Optic Atrophy, Disc Swelling                  |
| Retinal Dystrophy          | 4     | Retinitis Pigmentosa, Tessellated Fundus, Bietti Crystalline, Pathological Myopia |
| And more...                | 19    | Retinal Breaks, Findings, Hemorrhage, Inflammatory, Neoplasm, Post-Surgical, etc. |

## 📊 Database Entry Structure

```json
{
  "id": 0,
  "code": "0.0",
  "name": "Normal",
  "category": "Normal",
  "description": "Normal retinal condition without any pathological findings",
  "severity": "Low|Medium|High",
  "riskLevel": "Low|Medium|High",
  "symptoms": ["Clear vision", "No visual symptoms"],
  "findings": ["Clear optic disc", "Normal macula", "Normal vessels"],
  "recommendations": [
    "Annual checkups",
    "Maintain lifestyle",
    "Protect from UV"
  ]
}
```

## 🔗 Integration Pattern

```
┌─────────────────────────────────────────┐
│  API Response (Real Backend Service)    │
│  /api/v1/diagnosis/analyze/frontend     │
├─────────────────────────────────────────┤
│ lesions[]                               │
│  ├─ id: string                          │
│  ├─ name: "DR2"                         │
│  ├─ confidence: 92                      │
│  └─ location: {x, y, width, height}     │
│                                         │
│ summary                                 │
│  └─ primary_diagnosis: "DR2"            │
└─────────────────────────────────────────┘
                  ↓
        Component fetches:
                  ↓
┌─────────────────────────────────────────┐
│  Disease Database (This Mock)           │
│  disease-database.json                  │
├─────────────────────────────────────────┤
│ getDiseaseInfo("DR2")                   │
│  ├─ description: "Moderate changes..."  │
│  ├─ findings: [...]                     │
│  ├─ recommendations: [...]              │
│  └─ severity: "Medium"                  │
└─────────────────────────────────────────┘
```

## 💻 Usage Examples

### Import functions:

```typescript
import {
  getDiseaseInfo,
  getDiseaseUrgency,
  getDiseaseDescription,
  getAllDiseases,
  getCriticalDiseases,
} from '@/features/patient/mock';
```

### Get disease metadata:

```typescript
// Single disease info
const drInfo = getDiseaseInfo('DR2 (Moderate Diabetic Retinopathy)');
console.log(drInfo.severity); // "Medium"
console.log(drInfo.findings); // ["Multiple microaneurysms", ...]

// All diseases
const allDiseases = getAllDiseases(); // Array of 39 diseases

// Get urgency level
const urgency = getDiseaseUrgency('CRVO (Central Retinal Vein Occlusion)');
// Returns: 'critical'
```

### In retinal-analysis component:

```typescript
const { data: analysisResult } = useQuery({
  queryKey: ['retinal-analysis'],
  queryFn: () => api.analyzeRetina(imageFile),
});

if (analysisResult?.lesions) {
  analysisResult.lesions.forEach((lesion) => {
    // Get metadata from database
    const diseaseInfo = getDiseaseInfo(lesion.name);
    const urgency = getDiseaseUrgency(lesion.name);

    // Use location from API response
    const { location, confidence } = lesion;

    // Combine for display
    displayFinding({
      name: lesion.name,
      location, // FROM: API response
      confidence, // FROM: API response
      severity: diseaseInfo.severity, // FROM: database
      recommendations: diseaseInfo.recommendations, // FROM: database
      urgencyLevel: urgency,
    });
  });
}
```

### Query functions:

```typescript
// Get all critical diseases (for emergency routing)
const critical = getCriticalDiseases();
// Returns 7 diseases

// Get diseases by warning level
const warnings = getWarningDiseases();
// Returns 12 diseases

// Check if emergency
const isEmergency = isEmergency('CRVO (Central Retinal Vein Occlusion)');
// Returns: true

// Count by urgency
const counts = countDiseasesByUrgency();
// {critical: 7, warning: 12, caution: 11, info: 2, normal: 1}
```

## 🎨 Urgency Levels

| Level             | Count | Meaning                                   |
| ----------------- | ----- | ----------------------------------------- |
| **critical** (🔴) | 7     | Emergency - immediate intervention needed |
| **warning** (🟠)  | 12    | Urgent - specialist evaluation required   |
| **caution** (🟡)  | 11    | Monitor - regular evaluation needed       |
| **info** (🔵)     | 2     | Information only                          |
| **normal** (⚪)   | 7     | Normal findings                           |

### Critical Diseases (Emergency):

- CRVO (Central Retinal Vein Occlusion)
- Rhegmatogenous RD (Retinal Detachment)
- Severe Hypertensive Retinopathy
- DR3 (Severe Diabetic Retinopathy)
- RAO (Retinal Artery Occlusion)
- VKH Disease (Inflammatory)
- Blur Fundus With Suspected PDR

## ⚠️ Important Principles

1. **No Location Data**: Lesion coordinates come ONLY from API responses
2. **Metadata Only**: Database provides disease context, not synthetic test cases
3. **Real Backend**: Lesion detection and location performed by AURA AI service
4. **Classification System**: Supports all 39 disease codes from AURA_AI backend
5. **Integration Focus**: Database supplements real API data, doesn't replace it

## 🛠️ Development Notes

- Database is **static JSON** - no network calls needed
- All 39 diseases included with complete information
- Urgency levels pre-mapped for quick UI decisions
- Recommendations based on clinical guidelines
- Ready for i18n (internationalization) integration

## 📞 Related Files

- [Retinal Analysis Component](../pages/retinal-analysis.tsx)
- [Screening API](../api/screening.api.ts)
- [Disease Types from Backend](https://github.com/your-repo/AURA_AI/src/core/config.py)
