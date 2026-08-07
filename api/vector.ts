import { checkRateLimit } from './rateLimiter';

// Vercel Serverless Function: Secure Qdrant & Embedding Vector Proxy with Rate Limiting
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Rate Limiting: Max 60 requests per minute per IP / User
  if (!checkRateLimit(req, res, { maxRequests: 60, windowMs: 60000, endpointName: 'Vector Embedding & Search API' })) {
    return;
  }

  try {
    const { action, text, vector, limit = 3, collection = 'waypoint_curriculum' } = req.body;
    const openaiKey = process.env.OPENAI_API_KEY;
    const qdrantUrl = process.env.QDRANT_URL;
    const qdrantApiKey = process.env.QDRANT_API_KEY;

    // Action: Generate OpenAI dense text embedding
    if (action === 'embed') {
      if (!openaiKey) {
        return res.status(500).json({ error: 'Server OPENAI_API_KEY not configured for embeddings' });
      }

      const embRes = await fetch('https://api.openai.com/v1/embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey.trim()}`
        },
        body: JSON.stringify({
          model: 'text-embedding-3-small',
          input: text || ''
        })
      });

      if (!embRes.ok) {
        const errText = await embRes.text();
        return res.status(embRes.status).json({ error: `Embedding error: ${errText}` });
      }

      const data = await embRes.json();
      return res.status(200).json({ embedding: data.data?.[0]?.embedding || [] });
    }

    // Action: Search Qdrant Cloud collection
    if (action === 'search') {
      if (!qdrantUrl) {
        return res.status(500).json({ error: 'Server QDRANT_URL not configured' });
      }

      const searchUrl = `${qdrantUrl.replace(/\/+$/, '')}/collections/${collection}/points/search`;
      const qdrantRes = await fetch(searchUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(qdrantApiKey ? { 'api-key': qdrantApiKey.trim() } : {})
        },
        body: JSON.stringify({
          vector,
          limit,
          with_payload: true
        })
      });

      if (!qdrantRes.ok) {
        const errText = await qdrantRes.text();
        return res.status(qdrantRes.status).json({ error: `Qdrant error: ${errText}` });
      }

      const data = await qdrantRes.json();
      return res.status(200).json(data);
    }

    return res.status(400).json({ error: `Unknown vector action: ${action}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
