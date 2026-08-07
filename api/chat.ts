import { checkRateLimit } from './rateLimiter';

// Vercel Serverless Function: Secure LLM Proxy with Server-Side Guardrails & Rate Limiting
export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Rate Limiting: Max 30 requests per minute per IP / User
  if (!checkRateLimit(req, res, { maxRequests: 30, windowMs: 60000, endpointName: 'Chat/Tutor API' })) {
    return;
  }

  try {
    const { provider = 'openai', systemPrompt, messages, model, temperature = 0.7, maxTokens = 1200, jsonMode = false } = req.body;

    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // Server-side Prompt Injection & Jailbreak Guardrail
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').slice(-1)[0]?.content || '';
    const injectionPatterns = [
      /ignore\s+(all\s+)?(previous|prior)\s+(instructions|prompts|rules)/i,
      /disregard\s+(all\s+)?(previous|prior)\s+(instructions|directives)/i,
      /system\s+override/i,
      /you\s+are\s+now\s+in\s+developer\s+mode/i,
      /\b(dan\s+mode|jailbreak)\b/i,
      /reveal\s+(the\s+|your\s+)?(system\s+prompt|initial\s+prompt)/i
    ];

    const isInjected = injectionPatterns.some(pat => pat.test(lastUserMessage));
    if (isInjected) {
      return res.status(200).json({
        content: 'I am unable to fulfill requests that attempt to bypass pedagogical safety boundaries or extract system instructions. How can I help you master your current STEM topic?'
      });
    }

    if (provider === 'openai') {
      if (!openaiKey) {
        return res.status(500).json({ error: 'Server OPENAI_API_KEY is not set' });
      }

      const openAiRes = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiKey.trim()}`
        },
        body: JSON.stringify({
          model: model || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages
          ],
          temperature,
          max_tokens: maxTokens,
          ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
        })
      });

      if (!openAiRes.ok) {
        const errText = await openAiRes.text();
        return res.status(openAiRes.status).json({ error: `OpenAI error: ${errText}` });
      }

      const data = await openAiRes.json();
      return res.status(200).json({ content: data.choices?.[0]?.message?.content || '' });
    }

    if (provider === 'anthropic') {
      if (!anthropicKey) {
        return res.status(500).json({ error: 'Server ANTHROPIC_API_KEY is not set' });
      }

      const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey.trim(),
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: model || 'claude-3-5-haiku-20241022',
          system: systemPrompt,
          messages: messages.filter((m: any) => m.role !== 'system').map((m: any) => ({
            role: m.role === 'assistant' ? 'assistant' : 'user',
            content: m.content
          })),
          max_tokens: maxTokens,
          temperature
        })
      });

      if (!anthropicRes.ok) {
        const errText = await anthropicRes.text();
        return res.status(anthropicRes.status).json({ error: `Anthropic error: ${errText}` });
      }

      const data = await anthropicRes.json();
      return res.status(200).json({ content: data.content?.[0]?.text || '' });
    }

    if (provider === 'gemini') {
      if (!geminiKey) {
        return res.status(500).json({ error: 'Server GEMINI_API_KEY is not set' });
      }

      const targetModel = model || 'gemini-2.0-flash';
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${geminiKey.trim()}`;

      const contents = [
        {
          role: 'user',
          parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\nUSER MESSAGE:\n${messages[messages.length - 1]?.content || ''}` }]
        }
      ];

      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          generationConfig: {
            temperature,
            ...(jsonMode ? { responseMimeType: 'application/json' } : {})
          }
        })
      });

      if (!geminiRes.ok) {
        const errText = await geminiRes.text();
        return res.status(geminiRes.status).json({ error: `Gemini error: ${errText}` });
      }

      const data = await geminiRes.json();
      return res.status(200).json({ content: data.candidates?.[0]?.content?.parts?.[0]?.text || '' });
    }

    return res.status(400).json({ error: `Unsupported provider ${provider}` });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
