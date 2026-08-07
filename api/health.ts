// Vercel Serverless Function: Comprehensive Environment & Services Health Check (Zero-Secret Leakage)
export default async function handler(req: any, res: any) {
  const startTime = Date.now();
  res.setHeader('Cache-Control', 'no-store');

  const openaiConfigured = !!process.env.OPENAI_API_KEY;
  const anthropicConfigured = !!process.env.ANTHROPIC_API_KEY;
  const geminiConfigured = !!process.env.GEMINI_API_KEY;
  const qdrantConfigured = !!(process.env.QDRANT_URL && process.env.QDRANT_API_KEY);
  const enkryptConfigured = !!process.env.ENKRYPT_API_KEY;
  const supabaseConfigured = !!(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL);
  const resendConfigured = !!(process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY);

  const totalConfigured = [
    openaiConfigured,
    anthropicConfigured,
    geminiConfigured,
    qdrantConfigured,
    enkryptConfigured,
    supabaseConfigured,
    resendConfigured
  ].filter(Boolean).length;

  const latencyMs = Date.now() - startTime;

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    serverless: true,
    latencyMs,
    providers: {
      openai: openaiConfigured,
      anthropic: anthropicConfigured,
      gemini: geminiConfigured,
      qdrant: qdrantConfigured,
      enkrypt: enkryptConfigured,
      supabase: supabaseConfigured,
      email: resendConfigured
    },
    services: {
      aiGateway: {
        status: openaiConfigured || anthropicConfigured || geminiConfigured ? 'cloud_live' : 'client_byok_fallback',
        primary: openaiConfigured ? 'OpenAI' : anthropicConfigured ? 'Anthropic' : geminiConfigured ? 'Gemini' : 'Client / Mock'
      },
      vectorSearch: {
        status: qdrantConfigured ? 'cloud_live' : 'in_memory_dense_active',
        driver: qdrantConfigured ? 'Qdrant Cloud (1536-dim)' : 'In-Memory Cosine Vector Store (1536-dim)'
      },
      guardrails: {
        status: enkryptConfigured ? 'enkrypt_cloud_active' : 'local_rule_engine_active',
        rules: ['FERPA PII Stripping', 'Prompt Injection Detection', 'Jailbreak Interceptor']
      },
      database: {
        status: supabaseConfigured ? 'supabase_postgres_live' : 'offline_cache_ready',
        driver: supabaseConfigured ? 'Supabase Postgres + RLS' : 'IndexedDB / Local Storage'
      },
      notifications: {
        status: resendConfigured ? 'live_smtp_active' : 'interactive_preview_active',
        driver: resendConfigured ? (process.env.RESEND_API_KEY ? 'Resend' : 'SendGrid') : 'HTML In-App Preview'
      }
    },
    totalConfigured,
    isProductionGrade: (openaiConfigured || anthropicConfigured || geminiConfigured) && qdrantConfigured
  });
}
