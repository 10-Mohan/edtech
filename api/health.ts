// Vercel Serverless Function: Environment & Proxy Health Check (Zero-Secret Leakage)
export default async function handler(req: any, res: any) {
  res.setHeader('Cache-Control', 'no-store');

  const openaiConfigured = !!process.env.OPENAI_API_KEY;
  const anthropicConfigured = !!process.env.ANTHROPIC_API_KEY;
  const geminiConfigured = !!process.env.GEMINI_API_KEY;
  const qdrantConfigured = !!(process.env.QDRANT_URL && process.env.QDRANT_API_KEY);
  const enkryptConfigured = !!process.env.ENKRYPT_API_KEY;

  const totalConfigured = [
    openaiConfigured,
    anthropicConfigured,
    geminiConfigured,
    qdrantConfigured,
    enkryptConfigured
  ].filter(Boolean).length;

  return res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    serverless: true,
    providers: {
      openai: openaiConfigured,
      anthropic: anthropicConfigured,
      gemini: geminiConfigured,
      qdrant: qdrantConfigured,
      enkrypt: enkryptConfigured
    },
    totalConfigured,
    isProductionGrade: openaiConfigured || anthropicConfigured || geminiConfigured
  });
}
