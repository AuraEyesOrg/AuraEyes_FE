type TranslationFn = (
  key: string,
  fallbackOrParams?: string | TranslationParams,
  params?: TranslationParams
) => string;

type TranslationParams = Record<
  string,
  string | number | boolean | null | undefined
>;

const accreditationLabelConfig: Record<
  string,
  { labelKey: string; labelFallback: string }
> = {
  'JCI Accredited': {
    labelKey: 'ProfessionalNetwork.organisation.accreditations.jciAccredited',
    labelFallback: 'JCI Accredited',
  },
  'ISO 9001:2015': {
    labelKey: 'ProfessionalNetwork.organisation.accreditations.iso9001',
    labelFallback: 'ISO 9001:2015',
  },
  'Trung tâm Sàng lọc Võng mạc Quốc gia': {
    labelKey:
      'ProfessionalNetwork.organisation.accreditations.nationalRetinalScreeningCenter',
    labelFallback: 'Trung tâm Sàng lọc Võng mạc Quốc gia',
  },
  'Aura AI Certified Partner': {
    labelKey:
      'ProfessionalNetwork.organisation.accreditations.auraAiCertifiedPartner',
    labelFallback: 'Aura AI Certified Partner',
  },
  'FDA 510(k) Cleared': {
    labelKey: 'ProfessionalNetwork.organisation.accreditations.fda510kCleared',
    labelFallback: 'FDA 510(k) Cleared',
  },
  'CE Mark Class IIa': {
    labelKey: 'ProfessionalNetwork.organisation.accreditations.ceMarkClassIIa',
    labelFallback: 'CE Mark Class IIa',
  },
  'Bộ Y tế VN Approved': {
    labelKey: 'ProfessionalNetwork.organisation.accreditations.mohVnApproved',
    labelFallback: 'Bộ Y tế VN Approved',
  },
  'Aura AI Screening Site': {
    labelKey:
      'ProfessionalNetwork.organisation.accreditations.auraAiScreeningSite',
    labelFallback: 'Aura AI Screening Site',
  },
};

export function getLocalizedAccreditation(
  t: TranslationFn,
  accreditation: string | undefined
): string {
  if (!accreditation) {
    return '';
  }

  const accreditationConfig = accreditationLabelConfig[accreditation];
  if (!accreditationConfig) {
    return accreditation;
  }

  return t(accreditationConfig.labelKey, accreditationConfig.labelFallback);
}
