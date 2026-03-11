// @ts-nocheck
// TODO: Remove this file when all pages migrate to real API data
/**
 * Professional Network Mock Data
 * Realistic medical/professional content for Aura retinal screening network
 */

import type {
  Ophthalmologist,
  Organisation,
  ProfessionalPost,
  ProfessionalConnection,
  ProfessionalGroup,
  PostComment,
  SavedCollection,
} from '../types';

// ============================================
// AURA - Hệ thống sàng lọc võng mạc bằng AI
// Mock Data cho Professional Network
// ============================================

// Mock Ophthalmologists
export const mockOphthalmologists: Ophthalmologist[] = [
  {
    id: '1',
    fullName: 'BS.CKII Nguyễn Văn Minh',
    email: 'minh.nguyen@vnio.vn',
    avatarUrl:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=150&h=150&fit=crop&crop=face',
    role: 'ophthalmologist',
    isVerified: true,
    createdAt: '2024-01-15',
    specialty: ['Retinal Diseases', 'Diabetic Retinopathy', 'AI Screening'],
    bio: 'Trưởng khoa Võng mạc - Bệnh viện Mắt Trung ương. 15 năm kinh nghiệm trong chẩn đoán và điều trị bệnh lý võng mạc. Nghiên cứu ứng dụng AI trong sàng lọc bệnh mắt do tiểu đường.',
    yearsOfExperience: 15,
    organisationId: '1',
    organisationName: 'Bệnh viện Mắt Trung ương',
    certificates: [
      {
        id: '1',
        name: 'FEBO - Fellow of European Board of Ophthalmology',
        title: 'FEBO',
        issuingOrganisation: 'European Board of Ophthalmology',
        issuingAuthority: 'European Board of Ophthalmology',
        issuedDate: '2018-05-20',
        year: 2018,
      },
      {
        id: '2',
        name: 'Retina Specialist Certification',
        title: 'Retina Specialist',
        issuingOrganisation: 'American Academy of Ophthalmology',
        issuingAuthority: 'American Academy of Ophthalmology',
        issuedDate: '2016-03-15',
        year: 2016,
      },
      {
        id: '3',
        name: 'Chứng chỉ Sàng lọc Võng mạc AI',
        title: 'AI Screening Certified',
        issuingOrganisation: 'Aura Medical AI',
        issuingAuthority: 'Aura Medical AI',
        issuedDate: '2025-06-10',
        year: 2025,
      },
    ],
    connectionCount: 1250,
    followerCount: 1250,
    postCount: 89,
    rating: 4.9,
    totalReviews: 328,
  },
  {
    id: '2',
    fullName: 'BS.CKI Trần Thị Hương',
    email: 'huong.tran@eyeclinic.vn',
    avatarUrl:
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face',
    role: 'ophthalmologist',
    isVerified: true,
    createdAt: '2023-06-20',
    specialty: ['Glaucoma', 'Optic Nerve Imaging', 'OCT Analysis'],
    bio: 'Chuyên gia Glaucoma và phân tích hình ảnh thần kinh thị giác. Ứng dụng OCT trong theo dõi tiến triển bệnh Glaucoma và đánh giá lớp sợi thần kinh võng mạc.',
    yearsOfExperience: 12,
    organisationId: '2',
    organisationName: 'Phòng khám Mắt Sài Gòn',
    certificates: [
      {
        id: '4',
        name: 'Glaucoma Specialist',
        title: 'Glaucoma Specialist',
        issuingOrganisation: 'World Glaucoma Association',
        issuingAuthority: 'World Glaucoma Association',
        issuedDate: '2019-08-10',
        year: 2019,
      },
      {
        id: '5',
        name: 'Chứng chỉ Phân tích OCT nâng cao',
        title: 'Advanced OCT Analysis',
        issuingOrganisation: 'Carl Zeiss Meditec',
        issuingAuthority: 'Carl Zeiss Meditec',
        issuedDate: '2021-04-15',
        year: 2021,
      },
    ],
    connectionCount: 890,
    followerCount: 890,
    postCount: 56,
    rating: 4.8,
    totalReviews: 245,
  },
  {
    id: '3',
    fullName: 'ThS.BS Lê Hoàng Nam',
    email: 'nam.le@hmu.edu.vn',
    avatarUrl:
      'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&h=150&fit=crop&crop=face',
    role: 'ophthalmologist',
    isVerified: true,
    createdAt: '2022-11-05',
    specialty: [
      'Retinopathy of Prematurity',
      'Pediatric Retina',
      'Telemedicine',
    ],
    bio: 'Nghiên cứu sinh tiến sĩ tại ĐH Y Hà Nội. Chuyên sâu về bệnh võng mạc trẻ sinh non (ROP) và ứng dụng Telemedicine trong sàng lọc ROP tại tuyến cơ sở.',
    yearsOfExperience: 8,
    organisationName: 'Đại học Y Hà Nội',
    certificates: [
      {
        id: '6',
        name: 'ROP Screening Certification',
        title: 'ROP Screening',
        issuingOrganisation: 'American Academy of Pediatrics',
        issuingAuthority: 'American Academy of Pediatrics',
        issuedDate: '2023-02-20',
        year: 2023,
      },
    ],
    connectionCount: 456,
    followerCount: 456,
    postCount: 34,
    rating: 4.7,
    totalReviews: 89,
  },
  {
    id: '4',
    fullName: 'TS.BS Phạm Quốc Bảo',
    email: 'bao.pham@aura-ai.vn',
    avatarUrl:
      'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&h=150&fit=crop&crop=face',
    role: 'ophthalmologist',
    isVerified: true,
    createdAt: '2023-03-12',
    specialty: ['AI Medical Imaging', 'Deep Learning', 'Retinal Analysis'],
    bio: 'Co-founder & Medical Director - Aura AI Screening. Tiến sĩ Y học chuyên ngành Hình ảnh y khoa. Phát triển thuật toán AI phát hiện 6 bệnh lý võng mạc phổ biến.',
    yearsOfExperience: 10,
    organisationId: '3',
    organisationName: 'Aura AI Medical',
    certificates: [
      {
        id: '7',
        name: 'Medical AI Specialist',
        title: 'Medical AI Specialist',
        issuingOrganisation: 'Stanford AI in Medicine',
        issuingAuthority: 'Stanford AI in Medicine',
        issuedDate: '2022-01-20',
        year: 2022,
      },
      {
        id: '8',
        name: 'FDA Reviewer - AI/ML Medical Devices',
        title: 'FDA AI/ML Reviewer',
        issuingOrganisation: 'U.S. FDA',
        issuingAuthority: 'U.S. FDA',
        issuedDate: '2023-09-15',
        year: 2023,
      },
    ],
    connectionCount: 2100,
    followerCount: 2100,
    postCount: 145,
    rating: 4.95,
    totalReviews: 512,
  },
  {
    id: '5',
    fullName: 'BS Võ Thanh Mai',
    email: 'mai.vo@district-hospital.vn',
    avatarUrl:
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=150&h=150&fit=crop&crop=face',
    role: 'ophthalmologist',
    isVerified: false,
    createdAt: '2024-06-01',
    specialty: ['Primary Eye Care', 'DR Screening', 'Community Ophthalmology'],
    bio: 'Bác sĩ nhãn khoa tuyến huyện. Triển khai chương trình sàng lọc võng mạc đái tháo đường cho 5,000+ bệnh nhân vùng nông thôn sử dụng Aura AI.',
    yearsOfExperience: 6,
    organisationId: '4',
    organisationName: 'Bệnh viện Đa khoa huyện Bình Chánh',
    certificates: [],
    connectionCount: 234,
    followerCount: 234,
    postCount: 18,
    rating: 4.6,
    totalReviews: 67,
  },
];

// Mock Organisations
export const mockOrganisations: Organisation[] = [
  {
    id: '1',
    name: 'Bệnh viện Mắt Trung ương',
    type: 'hospital',
    address: '85 Bà Triệu, Hoàn Kiếm, Hà Nội',
    licenseNumber: 'BV-001-2020',
    description:
      'Bệnh viện chuyên khoa mắt hàng đầu Việt Nam. Trung tâm sàng lọc võng mạc quốc gia với hệ thống Aura AI phân tích hơn 50,000 ca/năm. Tiên phong trong chẩn đoán sớm DR, AMD và Glaucoma bằng AI.',
    logoUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=100&h=100&fit=crop',
    coverUrl:
      'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1200&h=400&fit=crop',
    followerCount: 15600,
    memberCount: 245,
    isVerified: true,
    accreditations: [
      'JCI Accredited',
      'ISO 9001:2015',
      'Trung tâm Sàng lọc Võng mạc Quốc gia',
    ],
  },
  {
    id: '2',
    name: 'Phòng khám Mắt Sài Gòn',
    type: 'clinic',
    address: '123 Nguyễn Du, Quận 1, TP.HCM',
    licenseNumber: 'PK-SGN-2021',
    description:
      'Phòng khám mắt cao cấp tích hợp hệ thống sàng lọc AI. Chuyên về Glaucoma, OCT Angiography và theo dõi tiến triển bệnh võng mạc.',
    logoUrl:
      'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=100&h=100&fit=crop',
    coverUrl:
      'https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&h=400&fit=crop',
    followerCount: 8900,
    memberCount: 45,
    isVerified: true,
    accreditations: ['ISO 9001:2015', 'Aura AI Certified Partner'],
  },
  {
    id: '3',
    name: 'Aura AI Medical',
    type: 'research_center',
    address: '1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội',
    licenseNumber: 'RC-AI-2023',
    description:
      'Công ty phát triển hệ thống sàng lọc võng mạc bằng AI. Thuật toán phát hiện 6 bệnh lý: DR, AMD, Glaucoma, Hypertensive Retinopathy, RVO, ROP với độ chính xác >95%.',
    logoUrl:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=100&h=100&fit=crop',
    coverUrl:
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=400&fit=crop',
    followerCount: 5600,
    memberCount: 28,
    isVerified: true,
    accreditations: [
      'FDA 510(k) Cleared',
      'CE Mark Class IIa',
      'Bộ Y tế VN Approved',
    ],
  },
  {
    id: '4',
    name: 'Bệnh viện Đa khoa huyện Bình Chánh',
    type: 'hospital',
    address: '15 Quốc lộ 1A, Bình Chánh, TP.HCM',
    licenseNumber: 'BV-BC-2019',
    description:
      'Bệnh viện tuyến huyện triển khai chương trình sàng lọc võng mạc cộng đồng. Phối hợp Aura AI sàng lọc 5,000+ bệnh nhân tiểu đường trong vùng nông thôn.',
    logoUrl:
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=100&h=100&fit=crop',
    coverUrl:
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1200&h=400&fit=crop',
    followerCount: 2100,
    memberCount: 18,
    isVerified: true,
    accreditations: ['Aura AI Screening Site'],
  },
];

// Mock Posts - Case Studies và thảo luận về sàng lọc võng mạc
export const mockPosts: ProfessionalPost[] = [
  {
    id: '1',
    authorId: '1',
    author: mockOphthalmologists[0],
    content: `🚨 **CASE CẢNH BÁO: Bệnh nhân chủ quan - Phát hiện muộn DR nặng**

Nam, 52 tuổi, tiểu đường type 2 được 8 năm. BN khẳng định "mắt vẫn nhìn rõ, không cần khám".

**Kết quả sàng lọc Aura AI:**
- OD: Proliferative DR + Vitreous Hemorrhage ⚠️
- OS: Severe NPDR + Clinically Significant Macular Edema

**Vấn đề:**
- BN chưa từng đi khám mắt dù biết có tiểu đường
- HbA1c = 11.2% (không kiểm soát)
- Chỉ đến viện khi thị lực OD giảm đột ngột do xuất huyết dịch kính

**Bài học:**
1. "Nhìn rõ" ≠ không có bệnh võng mạc
2. Sàng lọc định kỳ là BẮT BUỘC cho mọi bệnh nhân tiểu đường
3. AI screening giúp phát hiện sớm trước khi có triệu chứng

Đã chuyển BN điều trị laser PRP khẩn cấp. Case này là reminder cho tất cả chúng ta về tầm quan trọng của sàng lọc chủ động.

#DiabeticRetinopathy #CaseStudy #AuraAI #ScreeningMatters`,
    type: 'case_study',
    visibility: 'public',
    mediaUrls: [
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800',
    ],
    attachments: [],
    totalReactions: 456,
    totalComments: 89,
    totalShares: 134,
    isEdited: false,
    isPinned: true,
    createdAt: '2026-01-30T10:30:00Z',
  },
  {
    id: '2',
    authorId: '2',
    author: mockOphthalmologists[1],
    content: `⚠️ **CASE CHẨN ĐOÁN SAI: Glaucoma bị bỏ sót vì chỉ đo nhãn áp**

Nữ, 45 tuổi, đến khám vì đau đầu. Đã khám nhiều nơi, được kết luận "nhãn áp bình thường".

**Kết quả kiểm tra chi tiết:**
- IOP: 18 mmHg (bình thường)
- CCT: 485 μm (mỏng!)
- IOP hiệu chỉnh: ~23-24 mmHg
- OCT RNFL: teo nặng cả 2 mắt
- VF: Tunnel vision, chỉ còn 10° trung tâm

**Chẩn đoán:** Normal Tension Glaucoma giai đoạn cuối

**Sai lầm thường gặp:**
1. Chỉ đo IOP mà không đo CCT
2. Không làm OCT hoặc thị trường
3. Nhãn áp "bình thường" ≠ không có Glaucoma

**Khuyến cáo:**
- Luôn đo CCT để hiệu chỉnh IOP
- OCT RNFL là tiêu chuẩn vàng để phát hiện sớm
- AI-assisted analysis giúp phát hiện thay đổi subtle

Case này đáng tiếc đã mất cơ hội điều trị sớm. Chia sẻ để đồng nghiệp tham khảo.

#Glaucoma #NormalTensionGlaucoma #Misdiagnosis #OCT`,
    type: 'case_study',
    visibility: 'public',
    mediaUrls: [],
    attachments: [],
    totalReactions: 342,
    totalComments: 67,
    totalShares: 89,
    userReaction: 'insightful',
    isEdited: false,
    isPinned: false,
    createdAt: '2026-01-29T14:15:00Z',
  },
  {
    id: '3',
    authorId: '4',
    author: mockOphthalmologists[3],
    organisationId: '3',
    organisation: mockOrganisations[2],
    content: `📊 **CẬP NHẬT: Aura AI Screening - Thống kê 6 tháng đầu 2026**

Tổng hợp dữ liệu từ 45 cơ sở y tế đang sử dụng hệ thống:

**Số liệu sàng lọc:**
- Tổng số ca: 127,500 bệnh nhân
- Phát hiện bất thường: 18,200 (14.3%)
- Referral cần thiết: 4,560 (3.6%)

**Phân bố bệnh lý phát hiện:**
🔴 Diabetic Retinopathy: 45%
🟠 Hypertensive Retinopathy: 22%
🟡 AMD (nghi ngờ): 15%
🟢 Glaucoma (nghi ngờ): 12%
🔵 RVO: 4%
⚪ Khác: 2%

**Highlight:**
- 312 ca DR nặng được phát hiện sớm → điều trị kịp thời
- 89 ca Wet AMD được refer ngay → tiêm anti-VEGF
- Giảm 67% thời gian chờ so với khám thủ công

Cảm ơn tất cả các bác sĩ và cơ sở y tế đã tin tưởng sử dụng Aura!

#AuraAI #RetinalScreening #AIinMedicine #Statistics`,
    type: 'news',
    visibility: 'public',
    mediaUrls: [
      'https://images.unsplash.com/photo-1551076805-e1869033e561?w=800',
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800',
    ],
    attachments: [],
    totalReactions: 567,
    totalComments: 123,
    totalShares: 234,
    isEdited: false,
    isPinned: false,
    createdAt: '2026-01-28T09:00:00Z',
  },
  {
    id: '4',
    authorId: '3',
    author: mockOphthalmologists[2],
    content: `👶 **CASE ROP: Sàng lọc cứu thị lực trẻ sinh non**

Bé trai sinh non 27 tuần, 980g. Sàng lọc ROP tuần thứ 4 bằng camera Aura + AI analysis.

**Kết quả:**
- Zone II, Stage 3 ROP với Plus disease OD
- Zone II, Stage 2 OS

**Xử trí:**
- Tiêm anti-VEGF OD ngay trong 48h
- Theo dõi sát OS

**Kết quả sau 2 tuần:**
- ROP thoái triển hoàn toàn OD ✅
- OS ổn định, không tiến triển

**Lợi ích của AI-assisted ROP screening:**
1. Telemedicine: chụp ảnh ở NICU, chuyên gia đọc từ xa
2. Không bỏ sót: AI flag những vùng nghi ngờ
3. Lưu trữ hình ảnh: so sánh tiến triển chính xác
4. Giảm stress cho bé: chụp nhanh hơn

Đã có 23/25 tỉnh triển khai ROP telemedicine. Mục tiêu 2026: phủ sóng toàn quốc!

#ROP #PediatricOphthalmology #Telemedicine #PreemieHealth`,
    type: 'case_study',
    visibility: 'public',
    mediaUrls: [],
    attachments: [],
    totalReactions: 289,
    totalComments: 45,
    totalShares: 67,
    isEdited: false,
    isPinned: false,
    createdAt: '2026-01-27T16:45:00Z',
  },
  {
    id: '5',
    authorId: '5',
    author: mockOphthalmologists[4],
    content: `🏥 **Chia sẻ: Triển khai sàng lọc võng mạc tuyến huyện**

Sau 6 tháng vận hành Aura AI tại BV huyện, xin chia sẻ kinh nghiệm:

**Thách thức ban đầu:**
- Nhân lực: Chỉ có 1 BS mắt
- Lượng BN tiểu đường: 2,500+ người
- Không thể khám hết bằng soi đáy mắt thủ công

**Giải pháp:**
- Đào tạo điều dưỡng chụp ảnh fundus
- AI sàng lọc tự động, BS chỉ review bất thường
- Tích hợp với hồ sơ bệnh án điện tử

**Kết quả 6 tháng:**
- Sàng lọc: 1,850 bệnh nhân (74% coverage)
- Phát hiện DR: 245 ca (13.2%)
- Refer tuyến trên: 45 ca nặng
- Thời gian/ca: 5 phút (vs 20 phút trước đây)

**Case ấn tượng:**
Phát hiện 3 ca DR proliferative ở BN "không có triệu chứng gì", chuyển laser kịp thời!

Khuyến khích các đồng nghiệp tuyến cơ sở thử triển khai. Inbox nếu cần hỗ trợ!

#CommunityOphthalmology #RuralHealthcare #AIScreening #DRScreening`,
    type: 'article',
    visibility: 'public',
    mediaUrls: [
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800',
    ],
    attachments: [],
    totalReactions: 356,
    totalComments: 78,
    totalShares: 45,
    isEdited: false,
    isPinned: false,
    createdAt: '2026-01-26T11:20:00Z',
  },
  {
    id: '6',
    authorId: '1',
    author: mockOphthalmologists[0],
    content: `🤔 **Câu hỏi thảo luận: AI phát hiện, bác sĩ bỏ sót - Bạn nghĩ sao?**

Case thú vị từ tuần trước:

**Tình huống:**
- BN nam 60t, khám sức khỏe định kỳ
- Bác sĩ soi đáy mắt: "Bình thường, không có vấn đề"
- Chụp fundus photo → AI flag: "Suspicious for early AMD"
- Review lại ảnh: Đúng là có drusen mềm vùng hoàng điểm!

**Câu hỏi:**
1. AI đang thay thế hay hỗ trợ bác sĩ?
2. Có nên luôn kết hợp AI trong sàng lọc?
3. Làm sao để tránh "automation bias"?

Mình nghĩ AI là công cụ tuyệt vời để double-check, nhưng quyết định cuối vẫn cần bác sĩ.

Các đồng nghiệp có ý kiến gì không?

#AIvsDoctor #MedicalAI #Discussion #AMD`,
    type: 'question',
    visibility: 'public',
    mediaUrls: [],
    attachments: [],
    totalReactions: 189,
    totalComments: 67,
    totalShares: 23,
    isEdited: false,
    isPinned: false,
    createdAt: '2026-01-25T09:30:00Z',
  },
  {
    id: '7',
    authorId: '2',
    author: mockOphthalmologists[1],
    content: `📚 **GUIDELINE MỚI: Sàng lọc Glaucoma bằng AI - Khuyến cáo 2026**

Hội Nhãn khoa Việt Nam vừa ban hành hướng dẫn mới:

**Đối tượng sàng lọc:**
- ≥40 tuổi có yếu tố nguy cơ
- Tiền sử gia đình có Glaucoma
- Cận thị nặng (>-6D)
- Tiểu đường, tăng huyết áp

**Công cụ sàng lọc AI:**
1. Fundus photo + AI analysis (độ nhạy >92%)
2. OCT RNFL + AI segmentation
3. Visual Field + AI pattern recognition

**Quy trình khuyến cáo:**
• Fundus Photo → AI Analysis
  ├ Normal → Theo dõi 1 năm
  ├ Borderline → OCT + VF
  └ Abnormal → Khám chuyên khoa ngay

**Lưu ý quan trọng:**
- AI screening KHÔNG thay thế chẩn đoán bác sĩ
- Kết quả âm tính không loại trừ hoàn toàn Glaucoma
- Cần kết hợp lâm sàng để đưa ra quyết định

Link full guideline trong comment!

#Glaucoma #Guideline #AIScreening #VNOphthalmology`,
    type: 'article',
    visibility: 'public',
    mediaUrls: [],
    attachments: [
      {
        type: 'research_paper',
        title: 'Hướng dẫn Sàng lọc Glaucoma bằng AI - HNK VN 2026',
        url: '#',
        doi: '10.1234/vnoph.2026.gl',
      },
    ],
    totalReactions: 412,
    totalComments: 56,
    totalShares: 178,
    isEdited: false,
    isPinned: false,
    createdAt: '2026-01-24T14:00:00Z',
  },
  {
    id: '8',
    authorId: '4',
    author: mockOphthalmologists[3],
    content: `⚠️ **CASE HIẾM: AI phát hiện Choroidal Melanoma từ ảnh sàng lọc**

Nữ 48t, đến sàng lọc định kỳ vì tiểu đường. Không có triệu chứng gì về mắt.

**Kết quả AI:**
- DR: Negative ✅
- Bất thường khác: "Suspicious pigmented lesion, temporal to macula OD" ⚠️

**Khám chi tiết:**
- Tổn thương sắc tố 3.5mm, elevation 1.8mm
- B-scan: Acoustic hollowing
- FAF: Ring pattern

**Chẩn đoán:** Choroidal Melanoma T1b

**Xử trí:** Chuyển BV Mắt TW → Brachytherapy thành công

**Bài học:**
1. AI không chỉ tìm những gì được train, còn flag bất thường khác
2. Sàng lọc DR vô tình cứu mạng BN
3. Mọi bất thường đều cần review cẩn thận

Case này thực sự là may mắn. AI giúp chúng ta không bỏ sót!

#ChoroidalMelanoma #RareCase #AIDetection #IncidentalFinding`,
    type: 'case_study',
    visibility: 'public',
    mediaUrls: [],
    attachments: [],
    totalReactions: 523,
    totalComments: 89,
    totalShares: 156,
    isEdited: false,
    isPinned: false,
    createdAt: '2026-01-23T10:15:00Z',
  },
];

// Mock Comments
export const mockComments: PostComment[] = [
  {
    id: '1',
    postId: '1',
    authorId: '2',
    author: mockOphthalmologists[1],
    content:
      'Case này rất điển hình! Nhiều BN tiểu đường nghĩ rằng "còn nhìn được = không có vấn đề". Thực tế DR có thể tiến triển âm thầm đến giai đoạn nặng mà không có triệu chứng. Sàng lọc định kỳ là chìa khóa!',
    totalReactions: 45,
    replyCount: 2,
    isEdited: false,
    createdAt: '2026-01-30T11:30:00Z',
    replies: [
      {
        id: '2',
        postId: '1',
        authorId: '5',
        author: mockOphthalmologists[4],
        parentCommentId: '1',
        content:
          'Đúng vậy chị Hương. Ở tuyến huyện em gặp rất nhiều case tương tự. Nhiều BN chỉ đến khi đã mù 1 mắt. AI screening giúp chúng em cover được nhiều BN hơn.',
        totalReactions: 12,
        replyCount: 0,
        isEdited: false,
        createdAt: '2026-01-30T12:00:00Z',
      },
    ],
  },
  {
    id: '3',
    postId: '2',
    authorId: '4',
    author: mockOphthalmologists[3],
    content:
      'Đây là lý do Aura AI mới tích hợp thêm module phân tích CCT và dự đoán IOP hiệu chỉnh. Hy vọng giúp giảm thiểu các case bỏ sót như thế này. CCT mỏng là red flag cần lưu ý!',
    totalReactions: 67,
    replyCount: 1,
    userReaction: 'insightful',
    isEdited: false,
    createdAt: '2026-01-29T17:15:00Z',
  },
  {
    id: '4',
    postId: '6',
    authorId: '3',
    author: mockOphthalmologists[2],
    content:
      'Theo em, AI là second pair of eyes tuyệt vời. Trong ROP screening, AI giúp em không bỏ sót các vùng nghi ngờ, đặc biệt khi phải đọc nhiều ảnh trong ngày. Nhưng quyết định cuối cùng vẫn cần kinh nghiệm lâm sàng.',
    totalReactions: 34,
    replyCount: 3,
    isEdited: false,
    createdAt: '2026-01-25T10:45:00Z',
  },
  {
    id: '5',
    postId: '8',
    authorId: '1',
    author: mockOphthalmologists[0],
    content:
      'Case cực kỳ ấn tượng! Điều này chứng minh giá trị của fundus photo + AI analysis. Nhiều bệnh lý có thể được phát hiện "tình cờ" khi sàng lọc routine. BN này thực sự may mắn!',
    totalReactions: 89,
    replyCount: 0,
    isEdited: false,
    createdAt: '2026-01-23T11:30:00Z',
  },
];

// Mock Connections
export const mockConnections: ProfessionalConnection[] = [
  {
    id: '1',
    requesterId: '5',
    requester: mockOphthalmologists[4],
    addresseeId: '1',
    addressee: mockOphthalmologists[0],
    status: 'pending',
    message:
      'Chào anh Minh, em là Mai ở BV huyện Bình Chánh. Em đang triển khai Aura AI và muốn kết nối để học hỏi kinh nghiệm xử trí các case DR phức tạp ạ.',
    createdAt: '2026-01-30T08:00:00Z',
  },
  {
    id: '2',
    requesterId: '3',
    requester: mockOphthalmologists[2],
    addresseeId: '1',
    addressee: mockOphthalmologists[0],
    status: 'pending',
    message:
      'Xin chào bác sĩ Minh, em đang nghiên cứu về ROP telemedicine và biết anh có nhiều kinh nghiệm với AI screening. Mong được kết nối để trao đổi ạ.',
    createdAt: '2026-01-29T14:30:00Z',
  },
  {
    id: '3',
    requesterId: '4',
    requester: mockOphthalmologists[3],
    addresseeId: '1',
    addressee: mockOphthalmologists[0],
    status: 'accepted',
    message:
      'Chào anh Minh, em là Bảo từ Aura AI. Rất vui được kết nối với anh - một trong những early adopters của hệ thống!',
    createdAt: '2025-06-20T10:00:00Z',
    acceptedAt: '2025-06-21T09:00:00Z',
  },
  {
    id: '4',
    requesterId: '2',
    requester: mockOphthalmologists[1],
    addresseeId: '1',
    addressee: mockOphthalmologists[0],
    status: 'accepted',
    createdAt: '2025-03-15T10:00:00Z',
    acceptedAt: '2025-03-16T11:00:00Z',
  },
];

// Mock Groups
export const mockGroups: ProfessionalGroup[] = [
  {
    id: '1',
    ownerId: '4',
    owner: mockOphthalmologists[3],
    name: 'Aura AI Screening Community',
    description:
      'Cộng đồng các bác sĩ và cơ sở y tế sử dụng hệ thống Aura AI. Chia sẻ case study, thảo luận kỹ thuật, cập nhật tính năng mới và feedback để cải thiện hệ thống.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&h=400&fit=crop',
    avatarUrl:
      'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=100&h=100&fit=crop',
    type: 'specialty',
    privacy: 'public',
    rules: [
      'Tôn trọng ý kiến đồng nghiệp',
      'Bảo mật thông tin bệnh nhân',
      'Không spam quảng cáo',
    ],
    topics: [
      'AI Screening',
      'Diabetic Retinopathy',
      'Glaucoma Detection',
      'Case Discussion',
    ],
    memberCount: 2450,
    postCount: 856,
    isActive: true,
    isMember: true,
    createdAt: '2024-06-15',
  },
  {
    id: '2',
    ownerId: '1',
    owner: mockOphthalmologists[0],
    name: 'Diabetic Retinopathy Specialists Vietnam',
    description:
      'Nhóm thảo luận chuyên sâu về chẩn đoán và điều trị bệnh võng mạc đái tháo đường. Cập nhật guidelines, laser therapy, anti-VEGF và các phương pháp điều trị mới.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&h=400&fit=crop',
    avatarUrl:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&h=100&fit=crop',
    type: 'specialty',
    privacy: 'public',
    rules: [
      'Evidence-based discussion',
      'Deidentify patient data',
      'Cite sources when possible',
    ],
    topics: ['DR Staging', 'PRP Laser', 'Anti-VEGF', 'Screening Protocols'],
    memberCount: 1890,
    postCount: 567,
    isActive: true,
    isMember: true,
    createdAt: '2024-03-20',
  },
  {
    id: '3',
    ownerId: '2',
    owner: mockOphthalmologists[1],
    name: 'Glaucoma & OCT Analysis',
    description:
      'Thảo luận về ứng dụng OCT trong chẩn đoán và theo dõi Glaucoma. Phân tích RNFL, GCC, optic nerve head và các chỉ số tiến triển bệnh.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=1200&h=400&fit=crop',
    avatarUrl:
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=100&h=100&fit=crop',
    type: 'specialty',
    privacy: 'private',
    rules: ['Chỉ thảo luận về Glaucoma', 'Chia sẻ OCT images khi có thể'],
    topics: ['Glaucoma', 'OCT RNFL', 'Visual Field', 'AI Glaucoma Detection'],
    memberCount: 756,
    postCount: 234,
    isActive: true,
    isMember: false,
    createdAt: '2024-09-01',
  },
  {
    id: '4',
    ownerId: '3',
    owner: mockOphthalmologists[2],
    name: 'ROP Telemedicine Network',
    description:
      'Mạng lưới telemedicine sàng lọc ROP cho trẻ sinh non. Kết nối các đơn vị NICU với chuyên gia võng mạc nhi để hội chẩn và xử trí kịp thời.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=1200&h=400&fit=crop',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop',
    type: 'specialty',
    privacy: 'private',
    rules: [
      'Chỉ dành cho BS/điều dưỡng NICU và nhãn khoa',
      'Case khẩn cấp ưu tiên',
    ],
    topics: ['ROP', 'Telemedicine', 'Neonatal Care', 'Anti-VEGF Therapy'],
    memberCount: 345,
    postCount: 189,
    isActive: true,
    isMember: true,
    createdAt: '2025-01-01',
  },
  {
    id: '5',
    ownerId: '5',
    owner: mockOphthalmologists[4],
    name: 'Sàng lọc Võng mạc Tuyến Cơ sở',
    description:
      'Chia sẻ kinh nghiệm triển khai sàng lọc võng mạc tại các bệnh viện tuyến huyện, trạm y tế. Hỗ trợ kỹ thuật, đào tạo, và giải quyết khó khăn thực tế.',
    coverImageUrl:
      'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1200&h=400&fit=crop',
    avatarUrl:
      'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=100&h=100&fit=crop',
    type: 'regional',
    privacy: 'public',
    rules: ['Hỗ trợ lẫn nhau', 'Chia sẻ tài nguyên đào tạo'],
    topics: [
      'Community Screening',
      'Training',
      'Rural Healthcare',
      'Resource Sharing',
    ],
    memberCount: 567,
    postCount: 123,
    isActive: true,
    isMember: true,
    createdAt: '2025-06-15',
  },
];

// Mock Saved Collections
export const mockCollections: SavedCollection[] = [
  {
    id: '1',
    userId: '1',
    name: 'Case DR Phức tạp',
    description: 'Các case DR khó chẩn đoán hoặc điều trị phức tạp để học hỏi',
    isPrivate: false,
    postCount: 34,
    createdAt: '2025-06-15',
  },
  {
    id: '2',
    userId: '1',
    name: 'Chẩn đoán Sai - Bài học',
    description: 'Tổng hợp các case bị misdiagnosis để rút kinh nghiệm',
    isPrivate: true,
    postCount: 18,
    createdAt: '2025-08-20',
  },
  {
    id: '3',
    userId: '1',
    name: 'AI vs Human - Case Studies',
    description: 'So sánh kết quả AI và bác sĩ trong các case thú vị',
    isPrivate: false,
    postCount: 45,
    createdAt: '2025-11-10',
  },
  {
    id: '4',
    userId: '1',
    name: 'Guidelines & Protocols',
    description: 'Hướng dẫn và protocol sàng lọc mới nhất',
    isPrivate: false,
    postCount: 12,
    createdAt: '2025-12-01',
  },
];

// Current user (logged in) - Trưởng khoa Võng mạc
export const currentUser = mockOphthalmologists[0];

// Trending topics for right panel
export const trendingTopics = [
  { tag: 'AI Screening', posts: 234 },
  { tag: 'Diabetic Retinopathy', posts: 189 },
  { tag: 'Glaucoma Guidelines 2026', posts: 156 },
  { tag: 'SMILE Surgery', posts: 98 },
  { tag: 'Pediatric Vision', posts: 76 },
];
