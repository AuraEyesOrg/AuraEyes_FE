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
  'Within Normal Limits': 'Bình thường',
  'Central Serous Retinopathy': 'Bong thanh dịch hắc võng mạc trung tâm',
  'Central Serous Chorioretinopathy': 'Hắc võng mạc trung tâm thanh dịch',
  'Macular Edema': 'Phù hoàng điểm',
  'Macular Degeneration': 'Thoái hóa hoàng điểm',
  'Macular Hole': 'Lỗ hoàng điểm',
  'Macular Star': 'Hình sao hoàng điểm',
  'Hemorrhagic PED': 'Bong biểu mô sắc tố xuất huyết',
  'Central Retinal Artery Occlusion': 'Tắc động mạch võng mạc trung tâm',
  'Branch Retinal Artery Occlusion': 'Tắc động mạch võng mạc nhánh',
  'Branch Retinal Vein Occlusion': 'Tắc nhánh tĩnh mạch võng mạc',
  'Central Retinal Vein Occlusion': 'Tắc tĩnh mạch trung tâm võng mạc',
  'Giant Retinal Tear': 'Vết rách võng mạc lớn',
  'Vitreous Hemorrhage': 'Xuất huyết dịch kính',
  'Tortuous Vessels': 'Mạch máu ngoằn ngoèo',
  Microaneurysm: 'Vi phình mạch',
  Plaque: 'Mảng xơ vữa',
  'Arcuate Hemorrhage': 'Xuất huyết hình cung',
  'Anterior Ischemic Optic Neuropathy':
    'Bệnh lý thần kinh thị do thiếu máu trước',
  'Ischemic Optic Neuropathy': 'Bệnh thần kinh thị giác thiếu máu',
  'Idiopathic Intracranial Hypertension': 'Tăng áp lực nội sọ vô căn',
  'Optic Neuritis': 'Viêm dây thần kinh thị giác',
  'Cystoid Macular Edema': 'Phù hoàng điểm dạng nang',
  'Retinal Hemorrhage': 'Xuất huyết võng mạc',
  'Hypertensive Retinopathy': 'Bệnh võng mạc cao huyết áp',
  'Optic Disc Cupping': 'Lõm đĩa thị',
  'Optic Disc Edema': 'Phù đĩa thị (Gai thị)',
  'Optic Disc Pallor / Atrophy': 'Bạc màu / Teo đĩa thị',
  Drusen: 'Lắng đọng Drusen',
  'Drusen / Yellow Spots': 'Drusen / Đốm trắng vàng',
  'Vogt-Koyanagi-Harada Disease': 'Bệnh Vogt-Koyanagi-Harada',
  'Retinal Detachment': 'Bong võng mạc',
  'Retinal Tear': 'Vết rách võng mạc',
  'Posterior Vitreous Detachment': 'Bong dịch kính sau',
  'Vitreous Syneresis': 'Hóa lỏng dịch kính',
  'White Matter Lesion': 'Tổn thương đốm trắng',
  'Hard Exudates': 'Xuất tiết cứng',
  Exudates: 'Xuất tiết',
  Photocoagulation: 'Quang đông',
  'Soft Exudates': 'Xuất tiết mềm',
  'Cotton Wool Spots': 'Đốm xuất tiết bông',
  'Intraretinal Microvascular Abnormality': 'Bất thường vi mạch trong võng mạc',
  'Neovascularization of the Disc': 'Tân mạch đĩa thị',
  'Neovascularization Elsewhere': 'Tân mạch vị trí khác',
  'Polypoidal Choroidal Vasculopathy': 'Bệnh mạch máu hắc mạc dạng polyp',
  'Choroidal Neovascularization': 'Tân mạch hắc mạc',
  'Choroidal Fold': 'Nếp gấp hắc mạc',
  'Cilioretinal Artery': 'Động mạch mi võng mạc',
  'RPE Changes': 'Thay đổi biểu mô sắc tố',
  'Age-related Macular Degeneration': 'Thoái hóa hoàng điểm tuổi già',
  'Cytomegalovirus Retinitis': 'Viêm võng mạc do CMV',
  Retinoschisis: 'Tách lớp võng mạc',
  Myopia: 'Cận thị bệnh lý',
  'Peripheral Retinal Degen.': 'Thoái hóa võng mạc chu biên',
  'Other Disc Modification': 'Bất thường khác quanh đĩa thị',
  'Tilted Disc': 'Đĩa thị nghiêng',
  'Peripapillary Atrophy': 'Thoái hóa quanh gai thị',
  'Laser Scars / Spots': 'Sẹo Laser',
  'Chorioretinal Scar': 'Sẹo hắc võng mạc',
  Staphyloma: 'Giãn lồi củng mạc',
  Coloboma: 'Khuyết mô mắt',
  'Epiretinal Membrane': 'Màng trước võng mạc',
  'Silicon Oil': 'Dầu Silicon trong mắt',
  'Blur Fundus': 'Đáy mắt mờ',
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
  if (!name) return '';
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
  const isVietnamese = (language || 'vi').toLowerCase().startsWith('vi');
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
  const isVietnamese = (language || 'vi').toLowerCase().startsWith('vi');
  if (!isVietnamese) return findings;

  const normalizedFindings = findings
    .replace(/\bRelated Findings\s*:/gi, ', Related Findings: ')
    .replace(/\s+/g, ' ')
    .trim();

  const localizeLabel = (label: string): string => {
    return label
      .replace(/primary finding/gi, 'Phát hiện chính')
      .replace(/related findings?/gi, 'Phát hiện liên quan')
      .replace(/^findings?$/gi, 'Phát hiện');
  };

  const localizeSegment = (segment: string): string => {
    const trimmed = segment.trim();
    if (!trimmed) return '';

    const confidenceMatch = trimmed.match(/\([^)]*\)\s*$/);
    const confidenceSuffix = confidenceMatch?.[0] ?? '';
    const withoutConfidence = trimmed
      .slice(0, trimmed.length - confidenceSuffix.length)
      .trim();

    const colonIndex = withoutConfidence.indexOf(':');
    if (colonIndex === -1) {
      const translated = toDisplayDiseaseName(
        normalizeDiseaseName(withoutConfidence),
        language
      );
      return `${translated}${confidenceSuffix}`.trim();
    }

    const rawLabel = withoutConfidence.slice(0, colonIndex).trim();
    const rawValue = withoutConfidence.slice(colonIndex + 1).trim();
    const translatedLabel = localizeLabel(rawLabel);
    const translatedValue = rawValue
      .split('/')
      .map((item) => toDisplayDiseaseName(normalizeDiseaseName(item), language))
      .filter(Boolean)
      .join(' / ');

    return `${translatedLabel}: ${translatedValue}${confidenceSuffix}`.trim();
  };

  return normalizedFindings
    .split(',')
    .map(localizeSegment)
    .filter(Boolean)
    .join(', ');
}
