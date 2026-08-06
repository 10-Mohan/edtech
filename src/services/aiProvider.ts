import { AIConfig, AIProviderId, ChatMessage, HomeworkProblem, SubjectId, VisionScanResult } from '../types';

const AI_CONFIG_KEY = 'waypoint_ai_config';

export const DEFAULT_AI_CONFIG: AIConfig = {
  provider: 'simulated',
  apiKey: '',
  model: 'gpt-4o-mini',
  temperature: 0.7,
  visionModel: 'gpt-4o-mini'
};

export const AIProviderService = {
  getConfig(): AIConfig {
    const data = localStorage.getItem(AI_CONFIG_KEY);
    if (data) {
      try {
        return { ...DEFAULT_AI_CONFIG, ...JSON.parse(data) };
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_AI_CONFIG;
  },

  saveConfig(config: AIConfig): void {
    localStorage.setItem(AI_CONFIG_KEY, JSON.stringify(config));
  },

  isLiveProviderActive(): boolean {
    const config = this.getConfig();
    return config.provider !== 'simulated' && !!config.apiKey.trim();
  },

  getActiveProviderName(): string {
    const config = this.getConfig();
    if (!this.isLiveProviderActive()) return 'Deterministic Offline Engine';
    if (config.provider === 'openai') return `OpenAI (${config.model || 'GPT-4o'})`;
    if (config.provider === 'anthropic') return `Anthropic (${config.model || 'Claude 3.5'})`;
    if (config.provider === 'gemini') return `Google Gemini (${config.model || 'Gemini 2.0'})`;
    return 'Active AI Engine';
  },

  // -------------------------------------------------------------
  // Real LLM API Dispatchers (OpenAI / Anthropic / Gemini)
  // -------------------------------------------------------------
  async callChatCompletion(
    systemPrompt: string,
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    options?: { jsonMode?: boolean; maxTokens?: number }
  ): Promise<string> {
    const config = this.getConfig();

    if (!this.isLiveProviderActive()) {
      throw new Error('No active live AI provider configured. Using offline simulator.');
    }

    if (config.provider === 'openai') {
      return this.callOpenAI(config, systemPrompt, messages, options);
    } else if (config.provider === 'anthropic') {
      return this.callAnthropic(config, systemPrompt, messages, options);
    } else if (config.provider === 'gemini') {
      return this.callGemini(config, systemPrompt, messages, options);
    }

    throw new Error(`Unsupported AI provider: ${config.provider}`);
  },

  async callOpenAI(
    config: AIConfig,
    systemPrompt: string,
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    options?: { jsonMode?: boolean; maxTokens?: number }
  ): Promise<string> {
    const url = config.customEndpoint || 'https://api.openai.com/v1/chat/completions';
    const payload = {
      model: config.model || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...messages
      ],
      temperature: config.temperature ?? 0.7,
      max_tokens: options?.maxTokens || 1200,
      ...(options?.jsonMode ? { response_format: { type: 'json_object' } } : {})
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey.trim()}`
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`OpenAI API error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
  },

  async callAnthropic(
    config: AIConfig,
    systemPrompt: string,
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    options?: { jsonMode?: boolean; maxTokens?: number }
  ): Promise<string> {
    const url = 'https://api.anthropic.com/v1/messages';
    const formattedMessages = messages
      .filter(m => m.role !== 'system')
      .map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apiKey.trim(),
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true'
      },
      body: JSON.stringify({
        model: config.model || 'claude-3-5-haiku-20241022',
        system: systemPrompt,
        messages: formattedMessages,
        max_tokens: options?.maxTokens || 1200,
        temperature: config.temperature ?? 0.7
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Anthropic API error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    return data.content?.[0]?.text || '';
  },

  async callGemini(
    config: AIConfig,
    systemPrompt: string,
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    options?: { jsonMode?: boolean }
  ): Promise<string> {
    const model = config.model || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${config.apiKey.trim()}`;

    const contents = [
      {
        role: 'user',
        parts: [{ text: `SYSTEM INSTRUCTIONS:\n${systemPrompt}\n\nUSER MESSAGE:\n${messages[messages.length - 1]?.content || ''}` }]
      }
    ];

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: config.temperature ?? 0.7,
          ...(options?.jsonMode ? { responseMimeType: 'application/json' } : {})
        }
      })
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Google Gemini API error (${response.status}): ${errBody}`);
    }

    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  },

  // -------------------------------------------------------------
  // Real Multimodal / Vision OCR Homework Analysis
  // -------------------------------------------------------------
  async analyzeHomeworkImage(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<VisionScanResult> {
    const config = this.getConfig();

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
      "correctionHint": "Remember to multiply by the inner derivative \\frac{d}{dx}[g(x)]"
    }
  ],
  "conceptTested": "Chain Rule on Composite Functions",
  "remedialConceptId": "calc-03-chain-rule"
}`;

    if (this.isLiveProviderActive() && config.provider === 'openai') {
      const url = config.customEndpoint || 'https://api.openai.com/v1/chat/completions';
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.apiKey.trim()}`
        },
        body: JSON.stringify({
          model: config.visionModel || 'gpt-4o-mini',
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

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        return JSON.parse(content);
      }
    }

    // High-fidelity fallback / simulated vision parse
    return {
      title: 'Differentiate $f(x) = (3x^2 + 5)^4$',
      subject: 'math',
      rawExpression: 'f(x) = (3x^2 + 5)^4',
      steps: [
        {
          stepNumber: 1,
          expression: 'f\'(x) = 4(3x^2 + 5)^3',
          explanation: 'Applied power rule to outer polynomial $u^4 \\to 4u^3$.',
          isError: true,
          errorType: 'Omission of Inner Derivative (Chain Rule)',
          correctionHint: 'You differentiated the outer exponent 4, but forgot to multiply by the derivative of the inner function $\\frac{d}{dx}(3x^2 + 5) = 6x$.'
        },
        {
          stepNumber: 2,
          expression: 'f\'(x) = 4(3x^2 + 5)^3 \\cdot (6x) = 24x(3x^2 + 5)^3',
          explanation: 'Correct application multiplying by inner derivative $6x$.',
          isError: false
        }
      ],
      conceptTested: 'Chain Rule on Composite Functions',
      remedialConceptId: 'calc-03-chain-rule'
    };
  }
};
