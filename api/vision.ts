// Vercel Serverless Function: Secure Multimodal Vision OCR Proxy
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body;
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Missing imageBase64 payload' });
    }

    if (!openaiKey) {
      return res.status(500).json({ error: 'Server OPENAI_API_KEY is not configured on the backend' });
    }

    const visionSystemPrompt = `You are an expert STEM Homework Inspector and Computer Vision Logic Engine.
Inspect the provided image of handwritten or typed student mathematical/scientific derivations.
1. Extract the title and main problem statement.
2. Break down each logical or algebraic step into sequential derivation steps.
3. Check the mathematical validity of each step.
4. If there is an algebraic, sign, or conceptual error, mark that exact step as isError: true, identify the errorType, provide a gentle correctionHint, and assign a remedialConceptId (e.g. "calc-03-chain-rule", "linalg-02-matrix-mult", "phys-01-newton-laws").

CRITICAL: Return ONLY valid JSON in this exact structure:
{
  "title": "Problem Title with LaTeX",
  "subject": "math",
  "rawExpression": "Full mathematical problem equation",
  "steps": [
    {
      "stepNumber": 1,
      "expression": "LaTeX expression",
      "explanation": "Brief description of step",
      "isError": false
    },
    {
      "stepNumber": 2,
      "expression": "LaTeX expression",
      "explanation": "Brief description of step",
      "isError": true,
      "errorType": "Chain Rule Derivative Omission",
      "correctionHint": "Remember to multiply by the inner derivative"
    }
  ],
  "conceptTested": "Chain Rule on Composite Functions",
  "remedialConceptId": "calc-03-chain-rule"
}`;

    const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${openaiKey.trim()}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: visionSystemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Analyze this mathematical derivation image for logical steps and pinpoint errors.' },
              {
                type: 'image_url',
                image_url: { url: `data:${mimeType};base64,${imageBase64}` }
              }
            ]
          }
        ],
        response_format: { type: 'json_object' }
      })
    });

    if (!openAiRes.ok) {
      const errText = await openAiRes.text();
      return res.status(openAiRes.status).json({ error: `Vision API error: ${errText}` });
    }

    const data = await openAiRes.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');
    return res.status(200).json(parsed);
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
