/**
 * Mapping of 39 Disease Classes to Mock Data Cases
 *
 * This file maps all 39 retinal diseases from the classification system
 * to their corresponding mock API response cases for testing and development.
 */

export const DISEASE_TO_MOCK_CASE_MAP: Record<string, string> = {
  // 0. Normal
  Normal: 'mock-normal-001',

  // Diabetic Retinopathy (3 stages)
  'DR1 (Mild Diabetic Retinopathy)': 'mock-dr1-001',
  'DR2 (Moderate Diabetic Retinopathy)': 'mock-dr2-001',
  'DR3 (Severe Diabetic Retinopathy)': 'mock-dr3-001',

  // Retinal Vascular Occlusion
  'BRVO (Branch Retinal Vein Occlusion)': 'mock-dr2-001', // Similar lesion pattern
  'CRVO (Central Retinal Vein Occlusion)': 'mock-crvo-001',
  'RAO (Retinal Artery Occlusion)': 'mock-dr2-001', // Similar pattern

  // Retinal Detachment
  'Rhegmatogenous RD (Rhegmatogenous Retinal Detachment)': 'mock-rd-001',

  // Macular Disorders
  Maculopathy: 'mock-maculopathy-001',
  'CSCR (Central Serous Chorioretinopathy)': 'mock-cscr-001',
  'ERM (Epiretinal Membrane)': 'mock-maculopathy-001', // Similar location
  'MH (Macular Hole)': 'mock-maculopathy-001', // Macula-involved

  // Optic Nerve
  'Possible Glaucoma': 'mock-glaucoma-001',
  'Large Optic Cup': 'mock-glaucoma-001',
  'Optic Atrophy': 'mock-glaucoma-001', // Similar optic appearance
  'Disc Swelling and Elevation': 'mock-hypertensive-001', // Uses disc findings

  // Retinal Dystrophies
  'Retinitis Pigmentosa': 'mock-rp-001',
  'Tessellated Fundus': 'mock-normal-001', // Usually benign
  'Bietti Crystalline Dystrophy': 'mock-rp-001', // Similar progressive pattern
  'Pathological Myopia': 'mock-rd-001', // Risk factor for RD

  // Retinal Breaks & Degeneration
  'Peripheral Retinal Degeneration and Break': 'mock-rd-001',

  // Findings/Symptoms
  'Cotton-Wool Spots': 'mock-dr2-001',
  'Preretinal Hemorrhage': 'mock-dr2-001',
  'Yellow-White Spots-Flecks': 'mock-dr2-001',
  'Massive Hard Exudates': 'mock-dr2-001',
  'Vessel Tortuosity': 'mock-dr1-001',
  'Vitreous Particles': 'mock-normal-001', // Often benign

  // Congenital/Developmental
  'Myelinated Nerve Fiber': 'mock-normal-001', // Usually benign
  'Congenital Disc Abnormality': 'mock-normal-001', // Stable finding
  'Dragged Disc': 'mock-normal-001', // Structural finding
  'Chorioretinal Atrophy-Coloboma': 'mock-rp-001', // Atrophic changes

  // Hypertensive
  'Severe Hypertensive Retinopathy': 'mock-hypertensive-001',

  // Inflammatory
  'VKH Disease (Vogt-Koyanagi-Harada)': 'mock-cscr-001', // Serous detachment

  // Neoplasm
  'Fundus Neoplasm': 'mock-rd-001', // Large lesion-like

  // Post-Surgical
  'Laser Spots': 'mock-normal-001', // Treatment artifact
  'Silicon Oil in Eye': 'mock-normal-001', // Post-surgical finding

  // Media Opacities
  'Blur Fundus Without PDR': 'mock-normal-001', // Clear lesions when visible
  'Blur Fundus With Suspected PDR': 'mock-dr3-001', // Suggest serious pathology
};

export const DISEASE_URGENCY_LEVELS: Record<
  string,
  'critical' | 'warning' | 'caution' | 'info' | 'normal'
> = {
  // Critical - Emergency intervention required
  'CRVO (Central Retinal Vein Occlusion)': 'critical',
  'Rhegmatogenous RD (Rhegmatogenous Retinal Detachment)': 'critical',
  'Severe Hypertensive Retinopathy': 'critical',
  'DR3 (Severe Diabetic Retinopathy)': 'critical',
  'RAO (Retinal Artery Occlusion)': 'critical',
  'Blur Fundus With Suspected PDR': 'critical',
  'VKH Disease (Vogt-Koyanagi-Harada)': 'critical',

  // Warning - Urgent evaluation needed
  'DR2 (Moderate Diabetic Retinopathy)': 'warning',
  'BRVO (Branch Retinal Vein Occlusion)': 'warning',
  'Possible Glaucoma': 'warning',
  'Retinitis Pigmentosa': 'warning',
  'Large Optic Cup': 'warning',
  'Pathological Myopia': 'warning',
  'Optic Atrophy': 'warning',
  'Disc Swelling and Elevation': 'warning',
  'Massive Hard Exudates': 'warning',
  'Preretinal Hemorrhage': 'warning',
  'Peripheral Retinal Degeneration and Break': 'warning',
  'Fundus Neoplasm': 'warning',

  // Caution - Monitoring required
  'DR1 (Mild Diabetic Retinopathy)': 'caution',
  'CSCR (Central Serous Chorioretinopathy)': 'caution',
  Maculopathy: 'caution',
  'ERM (Epiretinal Membrane)': 'caution',
  'MH (Macular Hole)': 'caution',
  'Bietti Crystalline Dystrophy': 'caution',
  'Chorioretinal Atrophy-Coloboma': 'caution',
  'Cotton-Wool Spots': 'caution',
  'Yellow-White Spots-Flecks': 'caution',
  'Vessel Tortuosity': 'caution',
  'Blur Fundus Without PDR': 'caution',

  // Info - Minor findings
  'Tessellated Fundus': 'info',
  'Myelinated Nerve Fiber': 'info',

  // Normal - No pathology
  Normal: 'normal',
  'Congenital Disc Abnormality': 'normal',
  'Dragged Disc': 'normal',
  'Vitreous Particles': 'normal',
  'Laser Spots': 'normal',
  'Silicon Oil in Eye': 'normal',
};

export const DISEASE_DESCRIPTIONS: Record<string, string> = {
  Normal: 'No pathological findings. Continue regular eye screenings.',

  'DR1 (Mild Diabetic Retinopathy)':
    'Mild changes from diabetes detected. Requires glucose control and monitoring.',
  'DR2 (Moderate Diabetic Retinopathy)':
    'Moderate changes from diabetes. Specialist evaluation and treatment may be needed.',
  'DR3 (Severe Diabetic Retinopathy)':
    'Severe changes from diabetes. Urgent specialist consultation required.',

  'BRVO (Branch Retinal Vein Occlusion)':
    'Branch vessel blockage detected. May require anti-VEGF treatment.',
  'CRVO (Central Retinal Vein Occlusion)':
    'Central vein blockage - EMERGENCY. Immediate specialist intervention needed.',
  'RAO (Retinal Artery Occlusion)':
    'Artery blockage - EMERGENCY. Requires immediate comprehensive evaluation.',

  'Rhegmatogenous RD (Rhegmatogenous Retinal Detachment)':
    'Retinal detachment - EMERGENCY. Requires urgent surgery.',

  Maculopathy:
    'Central vision area affected. Monitoring and possible treatment needed.',
  'CSCR (Central Serous Chorioretinopathy)':
    'Fluid under macula detected. Often improves with observation.',
  'ERM (Epiretinal Membrane)':
    'Membrane on retina surface. Monitor for vision changes.',
  'MH (Macular Hole)':
    'Full-thickness hole in central retina. Surgical repair may be needed.',

  'Possible Glaucoma':
    'Optic nerve changes suspicious for glaucoma. Complete evaluation recommended.',
  'Large Optic Cup': 'Enlarged optic cup. Glaucoma screening tests needed.',
  'Optic Atrophy': 'Optic nerve damage detected. Identify underlying cause.',
  'Disc Swelling and Elevation':
    'Disc edema detected. Neuroimaging may be indicated.',

  'Retinitis Pigmentosa':
    'Inherited progressive dystrophy. Genetic counseling and supportive care recommended.',
  'Tessellated Fundus': 'Choroidal pattern visible. Usually benign finding.',
  'Bietti Crystalline Dystrophy':
    'Progressive inherited condition. Vitamin A supplementation and monitoring needed.',
  'Pathological Myopia':
    'High myopia with degenerative changes. Risk for retinal complications.',

  'Peripheral Retinal Degeneration and Break':
    'Peripheral thinning with possible break. Monitor for detachment risk.',

  'Cotton-Wool Spots':
    'Nerve fiber infarcts detected. Evaluate for systemic disease.',
  'Preretinal Hemorrhage':
    'Bleeding on retinal surface. Address underlying cause.',
  'Yellow-White Spots-Flecks':
    'White spots detected. Identify underlying etiology.',
  'Massive Hard Exudates':
    'Large lipid deposits. Usually associated with leaking vessels.',
  'Vessel Tortuosity': 'Serpentine vessels. Evaluate for systemic conditions.',
  'Vitreous Particles': 'Floaters from vitreous opacity. Usually benign.',

  'Myelinated Nerve Fiber':
    'Myelinated nerve fibers visible. Usually asymptomatic.',
  'Congenital Disc Abnormality':
    'Developmental disc variation. Typically stable.',
  'Dragged Disc': 'Disc displaced by membranes. Monitor for changes.',
  'Chorioretinal Atrophy-Coloboma':
    'Areas of thinning with sclera visible. Identify cause.',

  'Severe Hypertensive Retinopathy':
    'Severe vascular changes from hypertension - EMERGENCY. Urgent BP management needed.',

  'VKH Disease (Vogt-Koyanagi-Harada)':
    'Inflammatory disease with serous detachment. Immunosuppressive therapy indicated.',

  'Fundus Neoplasm':
    'Retinal or choroidal tumor detected. Oncology consultation urgently needed.',

  'Laser Spots': 'Previous laser treatment artifacts. No intervention needed.',
  'Silicon Oil in Eye': 'Post-surgical oil. Plan removal when retina stable.',

  'Blur Fundus Without PDR':
    'Media haze without proliferative changes. Identify cause of opacity.',
  'Blur Fundus With Suspected PDR':
    'Media opacity with concern for proliferative DR. Urgent B-scan and evaluation needed.',
};

/**
 * Get the most appropriate mock case for a given disease
 */
export function getMockCaseForDisease(diseaseName: string): string {
  return DISEASE_TO_MOCK_CASE_MAP[diseaseName] || 'mock-normal-001';
}

/**
 * Get urgency level for a disease
 */
export function getDiseaseUrgency(
  diseaseName: string
): 'critical' | 'warning' | 'caution' | 'info' | 'normal' {
  return DISEASE_URGENCY_LEVELS[diseaseName] || 'info';
}

/**
 * Get description for a disease
 */
export function getDiseaseDescription(diseaseName: string): string {
  return (
    DISEASE_DESCRIPTIONS[diseaseName] ||
    'Please refer to an eye specialist for evaluation.'
  );
}

/**
 * Get all critical diseases that need emergency intervention
 */
export function getCriticalDiseases(): string[] {
  return Object.entries(DISEASE_URGENCY_LEVELS)
    .filter(([, level]) => level === 'critical')
    .map(([disease]) => disease);
}

/**
 * Get all warning-level diseases
 */
export function getWarningDiseases(): string[] {
  return Object.entries(DISEASE_URGENCY_LEVELS)
    .filter(([, level]) => level === 'warning')
    .map(([disease]) => disease);
}

/**
 * Check if disease requires emergency intervention
 */
export function isEmergency(diseaseName: string): boolean {
  return getDiseaseUrgency(diseaseName) === 'critical';
}

/**
 * Count diseases by urgency level
 */
export function countDiseasesByUrgency(): Record<string, number> {
  const counts: Record<string, number> = {
    critical: 0,
    warning: 0,
    caution: 0,
    info: 0,
    normal: 0,
  };

  Object.values(DISEASE_URGENCY_LEVELS).forEach((level) => {
    counts[level]++;
  });

  return counts;
}

export default {
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
};
