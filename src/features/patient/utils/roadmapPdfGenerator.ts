import { HealthRoadmap } from '../types';
import { formatShortDate } from '@/lib/date-utils';

const riskLevelLabels: Record<HealthRoadmap['riskLevel'], string> = {
  LOW: 'Low Risk',
  MEDIUM: 'Medium Risk',
  HIGH: 'High Risk',
  CRITICAL: 'Critical Risk',
};

export const generateHealthRoadmapPdf = async (
  roadmap: HealthRoadmap
): Promise<void> => {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const marginX = 48;
  const maxTextWidth = pageWidth - marginX * 2;
  const sectionGap = 14;
  const itemGap = 8;
  const lineHeight = 16;
  const bottomLimit = pageHeight - 56;

  let cursorY = 56;

  // Helper: Ensure space before adding content
  const ensureSpace = (requiredHeight: number): void => {
    if (cursorY + requiredHeight <= bottomLimit) {
      return;
    }
    doc.addPage();
    cursorY = 56;
  };

  // Helper: Add text block with proper font handling
  const addTextBlock = (
    text: string,
    size = 11,
    weight: 'normal' | 'bold' = 'normal'
  ): void => {
    doc.setFont('Helvetica', weight === 'bold' ? 'bold' : 'normal');
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, maxTextWidth) as string[];
    const blockHeight = lines.length * lineHeight;
    ensureSpace(blockHeight + 2);
    doc.text(lines, marginX, cursorY);
    cursorY += blockHeight;
  };

  // Helper: Add section title
  const addSectionTitle = (title: string): void => {
    ensureSpace(26);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(13);
    doc.text(title, marginX, cursorY);
    cursorY += 20;
  };

  // Helper: Add bullet list with proper text handling
  const addBulletList = (items: string[], fallback: string): void => {
    const values = items.length > 0 ? items : [fallback];

    values.forEach((item) => {
      const lines = doc.splitTextToSize(item, maxTextWidth - 14) as string[];
      const blockHeight = lines.length * lineHeight;
      ensureSpace(blockHeight + itemGap + 4);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(11);
      doc.text('•', marginX, cursorY); // Use bullet character instead of unicode
      doc.text(lines, marginX + 14, cursorY);
      cursorY += blockHeight + itemGap;
    });
  };

  // Document title
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(19);
  doc.text('Health Roadmap', marginX, cursorY);
  cursorY += 28;

  // Risk level and metadata
  addTextBlock(`Risk Level: ${riskLevelLabels[roadmap.riskLevel]}`, 11, 'bold');
  addTextBlock(`Generated On: ${formatShortDate(roadmap.generatedAt)}`);
  addTextBlock(
    `Source: ${roadmap.source === 'DOCTOR_OVERRIDE' ? 'Doctor Reviewed' : 'AI Generated'}`
  );

  cursorY += sectionGap;

  // Summary section
  addSectionTitle('Summary');
  addTextBlock(roadmap.summary || 'No summary available.');

  cursorY += sectionGap;

  // Next steps section
  addSectionTitle('Next Steps');
  addBulletList(
    roadmap.nextSteps,
    'Review your roadmap summary and monitor symptoms closely.'
  );

  cursorY += sectionGap;

  // Lifestyle advice section
  addSectionTitle('Lifestyle Advice');
  addBulletList(
    roadmap.lifestyleAdvice,
    'Continue healthy eye-care habits and regular rest.'
  );

  cursorY += sectionGap;

  // Warning signs section
  addSectionTitle('Warning Signs');
  addBulletList(
    roadmap.warningSigns,
    'No warning signs were listed in this roadmap.'
  );

  cursorY += sectionGap;

  // Follow-up recommendation section
  addSectionTitle('Follow-up Recommendation');
  addTextBlock(
    roadmap.followUp.needed
      ? `Follow-up is recommended: ${roadmap.followUp.timeframe || 'Please contact your doctor for schedule details.'}`
      : 'No immediate follow-up is required.'
  );

  cursorY += sectionGap;

  // Care timeline section
  addSectionTitle('Care Timeline');

  const timelineData = [
    {
      phase: 'TODAY',
      title: 'Immediate Actions',
      bullets:
        roadmap.nextSteps.length > 0
          ? roadmap.nextSteps.slice(0, 2)
          : ['Review your roadmap summary and monitor symptoms closely.'],
    },
    {
      phase: roadmap.followUp.needed
        ? roadmap.followUp.timeframe || 'IN 2 WEEKS'
        : 'FOLLOW-UP OPTIONAL',
      title: 'Follow-up Plan',
      bullets: roadmap.followUp.needed
        ? [
            roadmap.followUp.timeframe ||
              'Schedule follow-up based on your doctor instructions.',
          ]
        : ['No urgent follow-up required unless symptoms worsen.'],
    },
    {
      phase: 'ONGOING',
      title: 'Lifestyle Routine',
      bullets:
        roadmap.lifestyleAdvice.length > 0
          ? roadmap.lifestyleAdvice.slice(0, 2)
          : ['Continue healthy eye-care habits and regular rest.'],
    },
  ];

  timelineData.forEach((item) => {
    addTextBlock(`${item.phase} - ${item.title}`, 11, 'bold');
    addBulletList(item.bullets, 'No details provided.');
  });

  // Disclaimer
  cursorY += 8;
  addTextBlock(
    'Clinical diagnosis and treatment decisions remain under doctor responsibility. This roadmap is patient-facing guidance.',
    10
  );

  // Save the PDF
  doc.save(`health-roadmap-${roadmap.id}.pdf`);
};
