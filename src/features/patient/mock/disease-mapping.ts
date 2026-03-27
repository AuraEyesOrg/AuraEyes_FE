/**
 * Disease Mapping and Metadata
 *
 * This file provides urgency levels, descriptions, and utility functions
 * for all 39 retinal diseases. Disease database is in disease-database.json.
 * Lesion locations come from API responses.
 */

// Import disease database
import diseaseDatabase from './disease-database.json';

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
  Fibrosis: 'normal',
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
  Fibrosis:
    'Scar tissue detected. Monitor and manage underlying retinal condition.',
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

/**
 * Get disease info from database
 */
export function getDiseaseInfo(diseaseName: string) {
  return diseaseDatabase.diseases.find(
    (d) => d.name === diseaseName || d.code === diseaseName
  );
}

/**
 * Get all diseases from database
 */
export function getAllDiseases() {
  return diseaseDatabase.diseases;
}

/**
 * Get disease count
 */
export function getDiseaseCount(): number {
  return diseaseDatabase.diseases.length;
}

export default {
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
};
