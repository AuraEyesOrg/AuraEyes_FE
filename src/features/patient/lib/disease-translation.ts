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
};

const DISEASE_NAME_VI_BY_LOWER = Object.fromEntries(
  Object.entries(DISEASE_NAME_VI).map(([key, value]) => [
    key.toLowerCase().trim(),
    value,
  ])
);

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
  const isVietnamese = language.toLowerCase().startsWith('vi');
  if (!isVietnamese) return diseaseName;

  return (
    DISEASE_NAME_VI[diseaseName] ??
    DISEASE_NAME_VI_BY_LOWER[diseaseName.toLowerCase().trim()] ??
    diseaseName
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
