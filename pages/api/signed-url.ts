import { NextApiRequest, NextApiResponse } from 'next';
import { ElevenLabsClient } from '@elevenlabs/elevenlabs-js';

const client = new ElevenLabsClient({ apiKey: process.env.XI_API_KEY });

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const agentId = process.env.ELEVENLABS_AGENT_ID;
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

