type TranslationFn = (
  key: string,
  fallbackOrParams?: string | TranslationParams,
  params?: TranslationParams
) => string;

type TranslationParams = Record<
  string,
  string | number | boolean | null | undefined
>;

const specialtyLabelConfig: Record<
  string,
  { labelKey: string; labelFallback: string }
> = {
  'AI Medical Imaging': {
    labelKey: 'ProfessionalNetwork.specialties.aiMedicalImaging',
    labelFallback: 'AI Medical Imaging',
  },
  'AI Screening': {
    labelKey: 'ProfessionalNetwork.specialties.aiScreening',
    labelFallback: 'AI Screening',
  },
  'Community Ophthalmology': {
    labelKey: 'ProfessionalNetwork.specialties.communityOphthalmology',
    labelFallback: 'Community Ophthalmology',
  },
  'Deep Learning': {
    labelKey: 'ProfessionalNetwork.specialties.deepLearning',
    labelFallback: 'Deep Learning',
  },
  'Diabetic Retinopathy': {
    labelKey: 'ProfessionalNetwork.specialties.diabeticRetinopathy',
    labelFallback: 'Diabetic Retinopathy',
  },
  'DR Screening': {
    labelKey: 'ProfessionalNetwork.specialties.drScreening',
    labelFallback: 'DR Screening',
  },
  Glaucoma: {
    labelKey: 'ProfessionalNetwork.specialties.glaucoma',
    labelFallback: 'Glaucoma',
  },
  'OCT Analysis': {
    labelKey: 'ProfessionalNetwork.specialties.octAnalysis',
    labelFallback: 'OCT Analysis',
  },
  'Optic Nerve Imaging': {
    labelKey: 'ProfessionalNetwork.specialties.opticNerveImaging',
    labelFallback: 'Optic Nerve Imaging',
  },
  'Pediatric Retina': {
    labelKey: 'ProfessionalNetwork.specialties.pediatricRetina',
    labelFallback: 'Pediatric Retina',
  },
  'Primary Eye Care': {
    labelKey: 'ProfessionalNetwork.specialties.primaryEyeCare',
    labelFallback: 'Primary Eye Care',
  },
  'Retinal Analysis': {
    labelKey: 'ProfessionalNetwork.specialties.retinalAnalysis',
    labelFallback: 'Retinal Analysis',
  },
  'Retinal Diseases': {
    labelKey: 'ProfessionalNetwork.specialties.retinalDiseases',
    labelFallback: 'Retinal Diseases',
  },
  'Retinopathy of Prematurity': {
    labelKey: 'ProfessionalNetwork.specialties.retinopathyOfPrematurity',
    labelFallback: 'Retinopathy of Prematurity',
  },
  Telemedicine: {
    labelKey: 'ProfessionalNetwork.specialties.telemedicine',
    labelFallback: 'Telemedicine',
  },
};

export function getLocalizedSpecialty(
  t: TranslationFn,
  specialty: string | undefined
): string {
  if (!specialty) {
    return '';
  }

  const specialtyConfig = specialtyLabelConfig[specialty];
  if (!specialtyConfig) {
    return specialty;
  }

  return t(specialtyConfig.labelKey, specialtyConfig.labelFallback);
}
