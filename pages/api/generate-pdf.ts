import { NextApiRequest, NextApiResponse } from 'next';
import PDFDocument from 'pdfkit';
import { getBoothConfig } from '@/config/booths';

interface ConsultationData {
  age?: string;
  snack_menu?: string;
  bmi?: string;
  ideal_weight?: string;
  medical_history?: string;
  bmi_status?: string;
  exercise?: string;
  goal?: string;
  name?: string;
  height?: string;
  breakfast_menu?: string;
  recommendation?: string;
  lunch_menu?: string;
  gender?: string;
  calorie_recommendation?: string;
  dinner_menu?: string;
  weight?: string;
}

/**
 * Generate PDF Report for HealthyGo Consultation
 * 
 * This function creates a professional PDF report with:
 * - Patient Information
 * - Health Metrics (BMI, BMI Status, Ideal Weight, Calorie Recommendation)
 * - Medical History
 * - Health Goals
 * - Exercise Plan
 * - Meal Plan (Breakfast, Lunch, Dinner, Snack)
 * - Recommendations
 * 
 * Note: PDF is generated on-demand and NOT stored permanently.
 * PDF is sent directly to webhook and print endpoint, then discarded.
 * 
 * @param data - Consultation data from the conversation
 * @param boothConfig - Booth configuration (for theming)
 * @returns Promise<Buffer> - PDF file as buffer
 */
function generatePDF(data: ConsultationData, boothConfig: ReturnType<typeof getBoothConfig>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document (A4 size)
      const doc = new PDFDocument({
        size: 'A4',
        margins: {
          top: 50,
          bottom: 50,
          left: 50,
          right: 50,
        },
        info: {
          Title: 'HealthyGo Health Consultation Report',
          Author: 'HealthyGo',
          Subject: 'Health Consultation Report',
          Creator: 'HealthyGo Experience Booth',
          Producer: 'HealthyGo PDF Generator',
        },
      });

      // Collect PDF chunks
      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', (error: Error) => {
        reject(error);
      });

      // HealthyGo Brand Colors
      const primaryColor = boothConfig.theme.primary || '#1f4735';
      const accentColor = boothConfig.theme.accent || '#3a7255';
      const textColor = boothConfig.theme.text || '#1f4735';

      // Header with gradient effect
      doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);
      
      // White accent line
      doc.rect(0, 115, doc.page.width, 5).fill('#f9eee9');
      
      // Title
      doc.fontSize(32)
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .text('HealthyGo', 50, 35, { align: 'center' });
      
      doc.fontSize(18)
        .fillColor('#f9eee9')
        .font('Helvetica')
        .text('Health Consultation Report', 50, 75, { align: 'center' });
      
      // Date
      doc.fontSize(10)
        .fillColor('#ffffff')
        .font('Helvetica')
        .text(
          `Generated: ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}`,
          50,
          100,
          { align: 'center' }
        );

    // Reset to default color
    doc.fillColor(textColor);
    let yPosition = 140;

    // Patient Information Section
    doc.fontSize(20)
      .fillColor(primaryColor)
      .font('Helvetica-Bold')
      .text('Patient Information', 50, yPosition);
    
    // Underline
    doc.moveTo(50, yPosition + 25)
      .lineTo(doc.page.width - 50, yPosition + 25)
      .strokeColor(accentColor)
      .lineWidth(2)
      .stroke();
    
    yPosition += 40;

    // Background box for patient info
    doc.rect(50, yPosition - 10, doc.page.width - 100, 110)
      .fillColor('#f9f9f9')
      .fill()
      .strokeColor('#e0e0e0')
      .lineWidth(1)
      .stroke();

    const patientInfo = [
      { label: 'Name', value: data.name || 'N/A' },
      { label: 'Age', value: data.age || 'N/A' },
      { label: 'Gender', value: data.gender || 'N/A' },
      { label: 'Height', value: data.height ? `${data.height} cm` : 'N/A' },
      { label: 'Weight', value: data.weight ? `${data.weight} kg` : 'N/A' },
    ];

    patientInfo.forEach((info, index) => {
      const rowY = yPosition + (index * 20);
      doc.fontSize(12)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text(`${info.label}:`, 60, rowY, { width: 150 });
      
      doc.fontSize(12)
        .fillColor('#000000')
        .font('Helvetica')
        .text(info.value, 210, rowY);
    });

    yPosition += 120;

    yPosition += 10;

    // Health Metrics Section
    doc.fontSize(18)
      .fillColor(primaryColor)
      .text('Health Metrics', 50, yPosition, { underline: true });
    
    yPosition += 35;

    const healthMetrics = [
      { label: 'BMI', value: data.bmi || 'N/A' },
      { label: 'BMI Status', value: data.bmi_status || 'N/A' },
      { label: 'Ideal Weight', value: data.ideal_weight ? `${data.ideal_weight} kg` : 'N/A' },
      { label: 'Calorie Recommendation', value: data.calorie_recommendation || 'N/A' },
    ];

    healthMetrics.forEach((metric) => {
      doc.fontSize(12)
        .fillColor(textColor)
        .text(`${metric.label}:`, 50, yPosition, { continued: true, width: 150 });
      
      doc.fontSize(12)
        .fillColor('#000000')
        .text(metric.value, 200, yPosition);
      
      yPosition += 20;
    });

    yPosition += 10;

    // Medical History Section
    if (data.medical_history) {
      doc.fontSize(18)
        .fillColor(primaryColor)
        .text('Medical History', 50, yPosition, { underline: true });
      
      yPosition += 35;

      doc.fontSize(11)
        .fillColor('#000000')
        .text(data.medical_history, 50, yPosition, {
          width: doc.page.width - 100,
          align: 'left',
        });

      yPosition += doc.heightOfString(data.medical_history, {
        width: doc.page.width - 100,
      }) + 20;
    }

    // Check if we need a new page
    if (yPosition > doc.page.height - 200) {
      doc.addPage();
      yPosition = 50;
    }

    // Goal Section
    if (data.goal) {
      doc.fontSize(18)
        .fillColor(primaryColor)
        .text('Health Goals', 50, yPosition, { underline: true });
      
      yPosition += 35;

      doc.fontSize(11)
        .fillColor('#000000')
        .text(data.goal, 50, yPosition, {
          width: doc.page.width - 100,
          align: 'left',
        });

      yPosition += doc.heightOfString(data.goal, {
        width: doc.page.width - 100,
      }) + 20;
    }

    // Exercise Section
    if (data.exercise) {
      doc.fontSize(18)
        .fillColor(primaryColor)
        .text('Exercise Plan', 50, yPosition, { underline: true });
      
      yPosition += 35;

      doc.fontSize(11)
        .fillColor('#000000')
        .text(data.exercise, 50, yPosition, {
          width: doc.page.width - 100,
          align: 'left',
        });

      yPosition += doc.heightOfString(data.exercise, {
        width: doc.page.width - 100,
      }) + 20;
    }

    // Check if we need a new page
    if (yPosition > doc.page.height - 250) {
      doc.addPage();
      yPosition = 50;
    }

    // Meal Plan Section
    doc.fontSize(18)
      .fillColor(primaryColor)
      .text('Meal Plan', 50, yPosition, { underline: true });
    
    yPosition += 35;

    const mealPlan = [
      { label: 'Breakfast', value: data.breakfast_menu || 'N/A' },
      { label: 'Lunch', value: data.lunch_menu || 'N/A' },
      { label: 'Dinner', value: data.dinner_menu || 'N/A' },
      { label: 'Snack', value: data.snack_menu || 'N/A' },
    ];

    mealPlan.forEach((meal) => {
      doc.fontSize(14)
        .fillColor(accentColor)
        .text(meal.label, 50, yPosition);
      
      yPosition += 20;

      doc.fontSize(11)
        .fillColor('#000000')
        .text(meal.value, 70, yPosition, {
          width: doc.page.width - 120,
          align: 'left',
        });

      yPosition += doc.heightOfString(meal.value, {
        width: doc.page.width - 120,
      }) + 15;
    });

    yPosition += 10;

    // Recommendation Section
    if (data.recommendation) {
      doc.fontSize(18)
        .fillColor(primaryColor)
        .text('Recommendations', 50, yPosition, { underline: true });
      
      yPosition += 35;

      doc.fontSize(11)
        .fillColor('#000000')
        .text(data.recommendation, 50, yPosition, {
          width: doc.page.width - 100,
          align: 'left',
        });
    }

    // Footer
    const pageHeight = doc.page.height;
    doc.fontSize(10)
      .fillColor('#666666')
      .text(
        `Generated on ${new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })} at ${new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
        })}`,
        50,
        pageHeight - 40,
        { align: 'center' }
      );

      // Finalize PDF (this will trigger the 'end' event)
      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * API Endpoint: Generate PDF Report
 * 
 * POST /api/generate-pdf
 * 
 * Body: {
 *   boothId?: string;
 *   name?: string;
 *   age?: string;
 *   gender?: string;
 *   height?: string;
 *   weight?: string;
 *   bmi?: string;
 *   bmi_status?: string;
 *   ideal_weight?: string;
 *   calorie_recommendation?: string;
 *   medical_history?: string;
 *   goal?: string;
 *   exercise?: string;
 *   breakfast_menu?: string;
 *   lunch_menu?: string;
 *   dinner_menu?: string;
 *   snack_menu?: string;
 *   recommendation?: string;
 * }
 * 
 * Returns: PDF file (application/pdf)
 * 
 * Note: PDF is generated on-demand and NOT stored on server.
 * PDF is sent directly to client, then can be sent to webhook/print endpoint.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { boothId, ...data } = req.body as ConsultationData & { boothId?: string };
    const boothConfig = getBoothConfig(boothId);

    // Generate PDF on-demand (not stored permanently)
    const pdfBuffer = await generatePDF(data, boothConfig);

    // Set response headers for PDF
    const fileName = `healthygo-report-${data.name || 'customer'}-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    res.setHeader('Content-Length', pdfBuffer.length.toString());
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Send PDF buffer (PDF is NOT stored on server)
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}

