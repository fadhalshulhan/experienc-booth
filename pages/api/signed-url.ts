import { NextApiRequest, NextApiResponse } from 'next';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';
import { getBoothConfig } from '@/config/booths';

const client = new ElevenLabsClient({ apiKey: process.env.XI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const boothIdParam = typeof req.query.boothId === 'string' ? req.query.boothId : undefined;
    const boothConfig = getBoothConfig(boothIdParam);

    const boothAgentIds: Record<string, string | undefined> = {
      healthygo: process.env.HEALTHYGO_AGENT_ID,
      jago: process.env.JAGO_AGENT_ID,
      cekat: process.env.CEKAT_AGENT_ID,
    };

    const agentId = boothConfig.agentId ?? boothAgentIds[boothConfig.id];

    if (!agentId) {
      return res.status(500).json({ error: 'Agent ID not configured' });
    }

    const result = await client.conversationalAi.conversations.getSignedUrl({ agentId });
    res.json({ signedUrl: result.signedUrl });
  } catch (error) {
    console.error('Error getting signed URL:', error);
    res.status(500).json({ error: 'Failed to get signed URL' });
  }
}

