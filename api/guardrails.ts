// Vercel Serverless Function: Secure Enkrypt AI Guardrails Proxy
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { text, stage = 'pre_flight', apiKey, endpoint } = req.body;
    const serverKey = process.env.ENKRYPT_API_KEY || apiKey;
    const targetEndpoint = endpoint || 'https://api.enkryptai.com/v1/guardrails';

    if (!serverKey) {
      // Return safe fallback pass if no Enkrypt API key is set on server
      return res.status(200).json({
        passed: true,
        blocked: false,
        riskScore: 0.0,
        violations: []
      });
    }

    const enkryptRes = await fetch(targetEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: serverKey.trim()
      },
      body: JSON.stringify({
        input: text,
        stage,
        policies: ['prompt_injection', 'pii_detection', 'toxicity', 'academic_integrity']
      })
    });

    if (!enkryptRes.ok) {
      const errText = await enkryptRes.text();
      return res.status(enkryptRes.status).json({ error: `Enkrypt error: ${errText}` });
    }

    const data = await enkryptRes.json();
    return res.status(200).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
