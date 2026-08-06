import { AIConfig, AIProviderId, ChatMessage, HomeworkProblem, SubjectId, UserRole, VisionScanResult } from '../types';
import { GuardrailService } from './guardrailService';
import { VectorService } from './vectorService';
import { AuditLogService } from './auditLogService';

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

  async checkServerlessHealth(): Promise<{
    isServerlessReachable: boolean;
    providers?: {
      openai: boolean;
      anthropic: boolean;
      gemini: boolean;
      qdrant: boolean;
      enkrypt: boolean;
    };
    isProductionGrade?: boolean;
  }> {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        return {
          isServerlessReachable: true,
          providers: data.providers,
          isProductionGrade: data.isProductionGrade
        };
      }
    } catch {
      // Serverless endpoint not reachable (e.g., standard Vite dev server without proxy)
    }
    return {
      isServerlessReachable: false
    };
  },


  // -------------------------------------------------------------
  // Real LLM API Dispatchers (Guardrails + RAG + Proxy + Audit)
  // -------------------------------------------------------------
  async callChatCompletion(
    systemPrompt: string,
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    options?: {
      jsonMode?: boolean;
      maxTokens?: number;
      subject?: SubjectId;
      userRole?: UserRole;
      userId?: string;
      enableRAG?: boolean;
    }
  ): Promise<string> {
    const startTime = Date.now();
    const config = this.getConfig();
    const lastUserMsg = messages.filter(m => m.role === 'user').slice(-1)[0]?.content || '';
    const userId = options?.userId || 'usr_current';
    const userRole = options?.userRole || 'student';
    const subject = options?.subject || 'math';

    // 1. Pre-flight Guardrails & PII Sanitization
    const guardrailCheck = await GuardrailService.validateAndSanitizeInput(lastUserMsg, userRole);

    if (guardrailCheck.blocked) {
      AuditLogService.recordLog({
        userId,
        userRole,
        promptOriginal: lastUserMsg,
        promptSanitized: guardrailCheck.sanitizedText,
        guardrailStatus: 'blocked',
        violations: guardrailCheck.violations,
        redactedFields: guardrailCheck.redactedFields,
        riskScore: guardrailCheck.riskScore,
        latencyMs: Date.now() - startTime,
        tokensEstimate: Math.ceil(lastUserMsg.length / 4),
        model: config.model || 'gpt-4o-mini',
        provider: config.provider,
        responseSnippet: guardrailCheck.sanitizedText
      });
      return guardrailCheck.sanitizedText;
    }

    // Replace user message with sanitized version
    const sanitizedMessages = messages.map(m => {
      if (m.role === 'user' && m.content === lastUserMsg) {
        return { ...m, content: guardrailCheck.sanitizedText };
      }
      return m;
    });

    // 2. Vector Semantic Search & Knowledge Graph RAG Augmentation
    let effectiveSystemPrompt = systemPrompt;
    let ragCitations: string[] = [];

    if (options?.enableRAG !== false && lastUserMsg.length > 3) {
      try {
        const ragRes = await VectorService.augmentPromptWithRAG(guardrailCheck.sanitizedText, subject);
        if (ragRes.augmentedContext) {
          effectiveSystemPrompt = `${systemPrompt}\n\n${ragRes.augmentedContext}`;
          ragCitations = ragRes.citations;
        }
      } catch (err) {
        console.warn('RAG augmentation notice:', err);
      }
    }

    let rawResponse = '';

    // 3. Try Secure Serverless Backend Proxy (/api/chat)
    try {
      const proxyRes = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: config.provider !== 'simulated' ? config.provider : 'openai',
          systemPrompt: effectiveSystemPrompt,
          messages: sanitizedMessages,
          model: config.model,
          temperature: config.temperature,
          maxTokens: options?.maxTokens,
          jsonMode: options?.jsonMode
        })
      });

      if (proxyRes.ok) {
        const data = await proxyRes.json();
        if (data.content) rawResponse = data.content;
      }
    } catch (e) {
      // Continue to direct client dispatch
    }

    // 4. Direct Client Dispatch (BYOK fallback)
    if (!rawResponse && this.isLiveProviderActive()) {
      if (config.provider === 'openai') {
        rawResponse = await this.callOpenAI(config, effectiveSystemPrompt, sanitizedMessages, options);
      } else if (config.provider === 'anthropic') {
        rawResponse = await this.callAnthropic(config, effectiveSystemPrompt, sanitizedMessages, options);
      } else if (config.provider === 'gemini') {
        rawResponse = await this.callGemini(config, effectiveSystemPrompt, sanitizedMessages, options);
      }
    }

    if (!rawResponse) {
      throw new Error('No active live AI provider configured. Using offline simulator.');
    }

    // 5. Post-generation Output Guardrail Validation
    const outputCheck = await GuardrailService.validateOutput(rawResponse);
    const finalResponse = outputCheck.sanitizedText;
    const latencyMs = Date.now() - startTime;
    const tokensEstimate = Math.ceil((lastUserMsg.length + finalResponse.length) / 4);

    // 6. Record in Enterprise AI Audit Log
    AuditLogService.recordLog({
      userId,
      userRole,
      promptOriginal: lastUserMsg,
      promptSanitized: guardrailCheck.sanitizedText,
      ragCitations,
      guardrailStatus: guardrailCheck.violations.length > 0 ? 'flagged' : 'passed',
      violations: guardrailCheck.violations,
      redactedFields: guardrailCheck.redactedFields,
      riskScore: guardrailCheck.riskScore,
      latencyMs,
      tokensEstimate,
      model: config.model || 'gpt-4o-mini',
      provider: config.provider,
      responseSnippet: finalResponse.substring(0, 120)
    });

    return finalResponse;
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
  // Multimodal Vision OCR Homework Analysis
  // -------------------------------------------------------------
  async analyzeHomeworkImage(imageBase64: string, mimeType: string = 'image/jpeg'): Promise<VisionScanResult> {
    const config = this.getConfig();

    // 1. Try secure backend serverless vision proxy
    try {
      const proxyRes = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64, mimeType })
      });

      if (proxyRes.ok) {
        const parsed = await proxyRes.json();
        if (parsed.steps && parsed.steps.length > 0) return parsed;
      }
    } catch (e) {
      // Continue to direct client fallback
    }

    // 2. Direct client-side OpenAI vision if key available
    const visionSystemPrompt = `You are an expert STEM Homework Inspector and Computer Vision Logic Engine.
Inspect the provided image of handwritten or typed student mathematical/scientific derivations.
1. Extract the title and main problem statement.
2. Break down each logical or algebraic step into sequential derivation steps.
3. Check the mathematical validity of each step.
4. If there is an algebraic, sign, or conceptual error, mark that exact step as isError: true, identify the errorType, provide a gentle correctionHint, and assign a remedialConceptId.

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
      "correctionHint": "Remember to multiply by the inner derivative \\\\frac{d}{dx}[g(x)]"
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
