const DISEASE_NAME_VI: Record<string, string> = {
  Normal: 'Bình thường',
  'Tessellated Fundus': 'Đáy mắt hắc mạc dạng lưới',
  'Large Optic Cup': 'Đĩa thị lớn',
  'DR1 (Mild Diabetic Retinopathy)': 'Bệnh võng mạc đái tháo đường độ 1',
  'DR2 (Moderate Diabetic Retinopathy)': 'Bệnh võng mạc đái tháo đường độ 2',
  'DR3 (Severe Diabetic Retinopathy)': 'Bệnh võng mạc đái tháo đường độ 3',
  'BRVO (Branch Retinal Vein Occlusion)': 'Tắc tĩnh mạch võng mạc nhánh',
  'CRVO (Central Retinal Vein Occlusion)': 'Tắc tĩnh mạch võng mạc trung tâm',
  'RAO (Retinal Artery Occlusion)': 'Tắc động mạch võng mạc',
  'VKH Disease (Vogt-Koyanagi-Harada)': 'Bệnh VKH',
  'Macular hole': 'Lỗ hoàng điểm',
  'MH (Macular Hole)': 'Lỗ hoàng điểm',
  'ERM (Epiretinal Membrane)': 'Màng trước võng mạc',
  'CSCR (Central Serous Chorioretinopathy)':
    'Bong thanh dịch hắc võng mạc trung tâm',
  Maculopathy: 'Tổn thương hoàng điểm',
  'Pathological Myopia': 'Cận thị bệnh lý',
  'Possible Glaucoma': 'Nghi ngờ glôcôm',
  Glaucoma: 'Nghi ngờ glôcôm',
  'Optic Atrophy': 'Teo thần kinh thị',
  'Disc Swelling and Elevation': 'Phù gai thị',
  'Congenital Disc Abnormality': 'Bất thường gai thị bẩm sinh',
  'Dragged Disc': 'Lệch gai thị',
  'Myelinated Nerve Fiber': 'Sợi thần kinh có bao myelin',
  'Retinitis Pigmentosa': 'Viêm võng mạc sắc tố',
  'Bietti Crystalline Dystrophy': 'Thoái hóa tinh thể Bietti',
  'Peripheral Retinal Degeneration and Break':
    'Thoái hóa và vết rách võng mạc ngoại biên',
  'Vitreous Particles': 'Vật đục dịch kính',
  'Fundus Neoplasm': 'Khối u đáy mắt',
  Fibrosis: 'Xơ hóa',
  'Massive Hard Exudates': 'Xuất tiết cứng diện rộng',
  'Cotton-Wool Spots': 'Đốm bông gòn',
  'Yellow-White Spots-Flecks': 'Đốm vàng trắng',
  'Vessel Tortuosity': 'Mạch máu ngoằn ngoèo',
  'Preretinal Hemorrhage': 'Xuất huyết trước võng mạc',
  'Severe Hypertensive Retinopathy': 'Bệnh võng mạc tăng huyết áp nặng',
  'Rhegmatogenous RD (Rhegmatogenous Retinal Detachment)':
    'Bong võng mạc do vết rách',
  'Chorioretinal Atrophy-Coloboma': 'Teo hắc võng mạc - coloboma',
  'Laser Spots': 'Sẹo laser đáy mắt',
  'Silicon Oil in Eye': 'Dầu silicone trong mắt',
  'Blur Fundus Without PDR': 'Đáy mắt mờ, chưa ghi nhận PDR',
  'Blur Fundus With Suspected PDR': 'Đáy mắt mờ, nghi ngờ PDR',
  'Proliferative Diabetic Retinopathy':
    'Bệnh võng mạc đái tháo đường tăng sinh',
  'Diabetic Retinopathy': 'Bệnh võng mạc đái tháo đường',
  'Central Serous Retinopathy': 'Bong thanh dịch hắc võng mạc trung tâm',
  'Macular Edema': 'Phù hoàng điểm',
  'Central Retinal Artery Occlusion': 'Tắc động mạch võng mạc trung tâm',
  'Branch Retinal Artery Occlusion': 'Tắc động mạch võng mạc nhánh',
  'Giant Retinal Tear': 'Vết rách võng mạc lớn',
  'Vitreous Hemorrhage': 'Xuất huyết dịch kính',
  'Anterior Ischemic Optic Neuropathy':
    'Bệnh lý thần kinh thị do thiếu máu trước',
  'Idiopathic Intracranial Hypertension': 'Tăng áp lực nội sọ vô căn',
};

const DISEASE_NAME_VI_BY_LOWER = Object.fromEntries(
  Object.entries(DISEASE_NAME_VI).map(([key, value]) => [
    key.toLowerCase().trim(),
    value,
  ])
);

/** Expand common abbreviations used by the AI model to full disease names. */
const ABBREVIATION_MAP: Record<string, string> = {
  CME: 'Cystoid Macular Edema',
  HR: 'Retinal Hemorrhage',
  ODC: 'Optic Disc Cupping',
  DN: 'Drusen',
  ERM: 'Epiretinal Membrane',
  MH: 'Macular Hole',
  BRVO: 'Branch Retinal Vein Occlusion',
  CRVO: 'Central Retinal Vein Occlusion',
  RAO: 'Retinal Artery Occlusion',
  VKH: 'Vogt-Koyanagi-Harada Disease',
  CSCR: 'Central Serous Chorioretinopathy',
  RD: 'Retinal Detachment',
  PDR: 'Proliferative Diabetic Retinopathy',
  PVD: 'Posterior Vitreous Detachment',
  WML: 'White Matter Lesion',
  CWS: 'Cotton-Wool Spots',
  HE: 'Hard Exudates',
  SE: 'Soft Exudates',
  IRMA: 'Intraretinal Microvascular Abnormality',
  NVD: 'Neovascularization of the Disc',
  NVE: 'Neovascularization Elsewhere',
  PCV: 'Polypoidal Choroidal Vasculopathy',
  CNV: 'Choroidal Neovascularization',
  ARMD: 'Age-related Macular Degeneration',
  AMD: 'Age-related Macular Degeneration',
  RP: 'Retinitis Pigmentosa',
  CMV: 'Cytomegalovirus Retinitis',
  PRDB: 'Proliferative Diabetic Retinopathy',
  DR: 'Diabetic Retinopathy',
  CSR: 'Central Serous Retinopathy',
  ME: 'Macular Edema',
  GLC: 'Glaucoma',
  CRAO: 'Central Retinal Artery Occlusion',
  BRAO: 'Branch Retinal Artery Occlusion',
  GRT: 'Giant Retinal Tear',
  PRH: 'Preretinal Hemorrhage',
  VH: 'Vitreous Hemorrhage',
  MHE: 'Massive Hard Exudates',
  FN: 'Fundus Neoplasm',
  AION: 'Anterior Ischemic Optic Neuropathy',
  IIH: 'Idiopathic Intracranial Hypertension',
  LS: 'Laser Spots',
  CDA: 'Congenital Disc Abnormality',
  DD: 'Dragged Disc',
  FIB: 'Fibrosis',
  BCD: 'Bietti Crystalline Dystrophy',
};

function expandAbbreviations(name: string): string {
  const trimmed = name.trim();
  const upper = trimmed.toUpperCase();
  return ABBREVIATION_MAP[upper] ?? ABBREVIATION_MAP[trimmed] ?? name;
}

function normalizeDiseaseName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*$/, '').trim();
}

export function isNormalDisease(name: string): boolean {
  const n = name.trim().toLowerCase();
  return n === 'normal' || n === 'wnl';
}

export function toDisplayDiseaseName(
  diseaseName: string,
  language: string
): string {
  const expanded = expandAbbreviations(diseaseName);
  const isVietnamese = language.toLowerCase().startsWith('vi');
  if (!isVietnamese) return expanded;

  return (
    DISEASE_NAME_VI[expanded] ??
    DISEASE_NAME_VI_BY_LOWER[expanded.toLowerCase().trim()] ??
    expanded
  );
}

export function localizeFindingsText(
  findings: string,
  language: string
): string {
  const isVietnamese = language.toLowerCase().startsWith('vi');
  if (!isVietnamese) return findings;

  return findings
    .split(',')
    .map((segment) => {
      const trimmed = segment.trim();
      if (!trimmed) return trimmed;

      const confidenceMatch = trimmed.match(/\([^)]*\)\s*$/);
      const confidenceSuffix = confidenceMatch?.[0] ?? '';
      const diseasePart = normalizeDiseaseName(trimmed);
      const translated = toDisplayDiseaseName(diseasePart, language);
      return `${translated}${confidenceSuffix}`.trim();
    })
    .filter(Boolean)
    .join(', ');
}
