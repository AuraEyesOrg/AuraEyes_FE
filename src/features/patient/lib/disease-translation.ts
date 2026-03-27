const DISEASE_NAME_VI: Record<string, string> = {
  Normal: 'Binh thuong',
  'Tessellated Fundus': 'Day mach hac mac dang luoi',
  'Large Optic Cup': 'Dia thi lon',
  'DR1 (Mild Diabetic Retinopathy)': 'Benh vong mac tieu duong do 1',
  'DR2 (Moderate Diabetic Retinopathy)': 'Benh vong mac tieu duong do 2',
  'DR3 (Severe Diabetic Retinopathy)': 'Benh vong mac tieu duong do 3',
  'BRVO (Branch Retinal Vein Occlusion)': 'Tac tinh mach vong mac nhanh',
  'CRVO (Central Retinal Vein Occlusion)': 'Tac tinh mach vong mac trung tam',
  'RAO (Retinal Artery Occlusion)': 'Tac dong mach vong mac',
  'VKH Disease (Vogt-Koyanagi-Harada)': 'Benh VKH',
  'Macular hole': 'Lo hoang diem',
  'MH (Macular Hole)': 'Lo hoang diem',
  'ERM (Epiretinal Membrane)': 'Mang truoc vong mac',
  'CSCR (Central Serous Chorioretinopathy)':
    'Bong thanh dich hinh thanh trung tam',
  Maculopathy: 'Ton thuong hoang diem',
  'Pathological Myopia': 'Can thi benh ly',
  'Possible Glaucoma': 'Nghi ngo glaucoma',
  Glaucoma: 'Nghi ngo glaucoma',
  'Optic Atrophy': 'Teo than kinh thi',
  'Disc Swelling and Elevation': 'Phu gai thi',
  'Congenital Disc Abnormality': 'Bat thuong gai thi bam sinh',
  'Dragged Disc': 'Lech gai thi',
  'Myelinated Nerve Fiber': 'Soi than kinh co bao myelin',
  'Retinitis Pigmentosa': 'Viem vong mac sac to',
  'Bietti Crystalline Dystrophy': 'Thoai hoa tinh the Bietti',
  'Peripheral Retinal Degeneration and Break':
    'Thoai hoa va vet rach vong mac ngoai bien',
  'Vitreous Particles': 'Vat duc dich kinh',
  'Fundus Neoplasm': 'Khoi u day mat',
  Fibrosis: 'Xo hoa',
  'Massive Hard Exudates': 'Xuat tiet cung nhieu',
  'Cotton-Wool Spots': 'Dom bong gon',
  'Yellow-White Spots-Flecks': 'Dom vang trang',
  'Vessel Tortuosity': 'Mach mau ngoan ngo eo',
  'Preretinal Hemorrhage': 'Xuat huyet truoc vong mac',
  'Severe Hypertensive Retinopathy': 'Benh vong mac tang huyet ap nang',
  'Rhegmatogenous RD (Rhegmatogenous Retinal Detachment)':
    'Bong vong mac do vet rach',
  'Chorioretinal Atrophy-Coloboma': 'Teo hac vong mac - coloboma',
  'Laser Spots': 'Seo laser day mat',
  'Silicon Oil in Eye': 'Dau silicone trong mat',
  'Blur Fundus Without PDR': 'Mo day mat khong co PDR',
  'Blur Fundus With Suspected PDR': 'Mo day mat nghi ngo PDR',
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
  return name.trim().toLowerCase() === 'normal';
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
