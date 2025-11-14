import type { NextApiRequest, NextApiResponse } from 'next';

interface ReportPayload {
  boothId?: string;
  visitorName?: string;
  transcript?: string;
  recommendedDrink?: string;
  summary?: string;
  [key: string]: unknown;
}

const REQUIRED_SECRET = process.env.REPORT_WEBHOOK_SECRET;
const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!N8N_WEBHOOK_URL) {
    return res.status(500).json({ error: 'Reporting endpoint not configured' });
  }

  const payload = req.body as ReportPayload | undefined;

  if (!payload || typeof payload !== 'object') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  if (REQUIRED_SECRET) {
    const providedSecret = req.headers['x-report-secret'];
    if (!providedSecret || providedSecret !== REQUIRED_SECRET) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...payload,
        receivedAt: new Date().toISOString(),
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('n8n webhook error:', response.status, text);
      return res.status(502).json({ error: 'Failed to forward report' });
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Error forwarding report:', error);
    res.status(500).json({ error: 'Failed to forward report' });
  }
}
