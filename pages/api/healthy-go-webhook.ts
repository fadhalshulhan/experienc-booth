import { NextApiRequest, NextApiResponse } from 'next';
import { getBoothConfig } from '@/config/booths';
import PDFDocument from 'pdfkit';

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
 * Reusable function from generate-pdf.ts
 */
function generatePDF(data: ConsultationData, boothConfig: ReturnType<typeof getBoothConfig>): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
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

      const chunks: Buffer[] = [];
      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        resolve(pdfBuffer);
      });
      doc.on('error', (error: Error) => {
        reject(error);
      });

      const primaryColor = boothConfig.theme.primary || '#1f4735';
      const accentColor = boothConfig.theme.accent || '#3a7255';
      const textColor = boothConfig.theme.text || '#1f4735';

      // Header
      doc.rect(0, 0, doc.page.width, 120).fill(primaryColor);
      doc.rect(0, 115, doc.page.width, 5).fill('#f9eee9');
      
      doc.fontSize(32)
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .text('HealthyGo', 50, 35, { align: 'center' });
      
      doc.fontSize(18)
        .fillColor('#f9eee9')
        .font('Helvetica')
        .text('Health Consultation Report', 50, 75, { align: 'center' });
      
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

      doc.fillColor(textColor);
      let yPosition = 140;

      // Patient Information
      doc.fontSize(20)
        .fillColor(primaryColor)
        .font('Helvetica-Bold')
        .text('Patient Information', 50, yPosition);
      
      doc.moveTo(50, yPosition + 25)
        .lineTo(doc.page.width - 50, yPosition + 25)
        .strokeColor(accentColor)
        .lineWidth(2)
        .stroke();
      
      yPosition += 40;

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

      // Health Metrics
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

      // Medical History
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

      if (yPosition > doc.page.height - 200) {
        doc.addPage();
        yPosition = 50;
      }

      // Goal
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

      // Exercise
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

      if (yPosition > doc.page.height - 250) {
        doc.addPage();
        yPosition = 50;
      }

      // Meal Plan
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

      // Recommendation
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

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * API Endpoint: HealthyGo Webhook Handler (Middleware/Proxy)
 * 
 * WHY WE NEED THIS ENDPOINT:
 * - ElevenLabs webhook tool only sends JSON data (no PDF generation)
 * - Webhook external (workflows.cekat.ai) only receives data (cannot generate PDF)
 * - We need to generate PDF before sending to webhook external and print endpoint
 * 
 * FLOW:
 * 1. ElevenLabs → POST to /api/healthy-go-webhook (with consultation data)
 * 2. Our endpoint → Generate PDF from consultation data
 * 3. Our endpoint → Forward data + PDF (base64) to webhook external
 * 4. Our endpoint → Send PDF (file) to print endpoint
 * 5. Our endpoint → Return success response to ElevenLabs
 * 
 * ALTERNATIVE (if webhook external can generate PDF):
 * - ElevenLabs → POST directly to https://workflows.cekat.ai/webhook/healthy-go/innov
 * - Webhook external → Generate PDF internally
 * - Webhook external → Send PDF to print endpoint
 * 
 * POST /api/healthy-go-webhook
 * 
 * Configure this URL in ElevenLabs webhook tool:
 * https://your-domain.vercel.app/api/healthy-go-webhook
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Allow GET for testing/debugging (return endpoint info)
  if (req.method === 'GET') {
    return res.status(200).json({
      message: 'HealthyGo Webhook Endpoint',
      method: 'POST',
      description: 'This endpoint receives webhook calls from ElevenLabs when create_report tool is called.',
      flow: [
        '1. ElevenLabs → POST to this endpoint (with consultation data)',
        '2. Endpoint → Generate PDF from consultation data',
        '3. Endpoint → Forward data + PDF (base64) to webhook external',
        '4. Endpoint → Send PDF (file) to print endpoint',
        '5. Endpoint → Return success response to ElevenLabs',
      ],
      requiredFields: [
        'name',
        'age',
        'gender',
        'height',
        'weight',
        'bmi',
        'bmi_status',
        'ideal_weight',
        'calorie_recommendation',
        'medical_history',
        'goal',
        'exercise',
        'breakfast_menu',
        'lunch_menu',
        'dinner_menu',
        'snack_menu',
        'recommendation',
      ],
      exampleRequest: {
        name: 'John Doe',
        age: '30',
        gender: 'Male',
        height: '170',
        weight: '70',
        bmi: '24.2',
        bmi_status: 'Normal',
        ideal_weight: '65',
        calorie_recommendation: '2000',
        medical_history: 'None',
        goal: 'Maintain weight',
        exercise: '30 minutes daily',
        breakfast_menu: 'Oatmeal with fruits',
        lunch_menu: 'Grilled chicken with vegetables',
        dinner_menu: 'Salmon with rice',
        snack_menu: 'Apple',
        recommendation: 'Maintain current diet',
      },
      note: 'This endpoint only accepts POST requests. Use POST method to call this endpoint.',
    });
  }

  // Only allow POST for actual webhook calls
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Method not allowed',
      message: 'This endpoint only accepts POST requests.',
      allowedMethods: ['POST', 'GET'],
      note: 'Use GET to see endpoint information, POST to process webhook calls.',
    });
  }

  try {
    // Get consultation data from ElevenLabs webhook
    const consultationData = req.body as ConsultationData;
    const boothConfig = getBoothConfig('healthygo');

    // Step 1: Generate PDF (webhook external cannot do this)
    const pdfBuffer = await generatePDF(consultationData, boothConfig);

    // Step 2: Convert PDF to base64 for webhook external
    const pdfBase64 = pdfBuffer.toString('base64');

    // Step 3: Forward data + PDF to webhook external
    // This is the original webhook URL that webhook external expects
    const webhookUrl = 'https://workflows.cekat.ai/webhook/healthy-go/innov';
    const webhookResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...consultationData,
        pdf_base64: pdfBase64, // Add PDF as base64
        pdf_filename: `healthygo-report-${consultationData.name || 'customer'}-${Date.now()}.pdf`,
      }),
    });

    if (!webhookResponse.ok) {
      console.error('Webhook request failed:', webhookResponse.status, await webhookResponse.text());
      // Don't fail the request, just log the error
      // Webhook external failure is not critical for the flow
    }

    // Step 4: Send PDF to print endpoint as multipart/form-data
    try {
      const printUrl = 'https://nontestable-odelia-isomerically.ngrok-free.dev/print';
      const pdfFileName = `healthygo-report-${consultationData.name || 'customer'}-${Date.now()}.pdf`;
      
      // Create multipart/form-data manually for Node.js
      const boundary = `----WebKitFormBoundary${Date.now()}`;
      const formDataStart = `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="${pdfFileName}"\r\nContent-Type: application/pdf\r\n\r\n`;
      const formDataEnd = `\r\n--${boundary}--\r\n`;
      
      const formDataBuffer = Buffer.concat([
        Buffer.from(formDataStart, 'utf-8'),
        pdfBuffer,
        Buffer.from(formDataEnd, 'utf-8'),
      ]);

      const printResponse = await fetch(printUrl, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: formDataBuffer,
      });

      if (!printResponse.ok) {
        console.warn('Print request failed:', printResponse.status);
      } else {
        console.debug('PDF sent to printer successfully');
      }
    } catch (printError) {
      // Print error is not critical, just log it
      console.warn('Failed to send PDF to printer:', printError);
    }

    // Return success to ElevenLabs
    res.status(200).json({
      status: 'success',
      message: 'Report created successfully. PDF generated and sent to webhook and print endpoint.',
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).json({
      error: 'Failed to process report',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

