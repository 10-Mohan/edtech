import { checkRateLimit } from '../rateLimiter';

export function renderWeeklyDigestHtml(params: {
  studentName: string;
  parentName: string;
  grade: string;
  school: string;
  weeklyFocusHours: number;
  masteryGainPercent: number;
  streakDays: number;
  masteredCardsCount: number;
  headlineSummary: string;
  celebrations: string[];
  dinnerPrompts: { prompt: string; whyItMatters: string }[];
  weakAreas: { topic: string; recommendedHomeAction: string }[];
}): string {
  const {
    studentName,
    parentName,
    grade,
    school,
    weeklyFocusHours,
    masteryGainPercent,
    streakDays,
    masteredCardsCount,
    headlineSummary,
    celebrations,
    dinnerPrompts,
    weakAreas
  } = params;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Waypoint Weekly Learning Digest — ${studentName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0f19; color: #e2e8f0; margin: 0; padding: 24px 12px; }
    .container { max-width: 620px; margin: 0 auto; background: #131b2e; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 28px; text-align: left; }
    .header h1 { margin: 0 0 6px; font-size: 24px; color: #ffffff; font-weight: 800; }
    .header p { margin: 0; font-size: 14px; color: #e0e7ff; }
    .content { padding: 28px; }
    .greeting { font-size: 16px; line-height: 1.6; color: #cbd5e1; margin-bottom: 24px; }
    .metrics-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 24px; }
    .metric-card { background: #1a233a; border: 1px solid #2d3748; border-radius: 12px; padding: 16px; text-align: center; }
    .metric-val { font-size: 22px; font-weight: 800; color: #38bdf8; margin-bottom: 4px; }
    .metric-label { font-size: 12px; color: #94a3b8; text-transform: uppercase; font-weight: 600; }
    .section-title { font-size: 16px; font-weight: 700; color: #f8fafc; margin: 24px 0 12px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #1e293b; padding-bottom: 8px; }
    .celebration-item { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.25); border-radius: 8px; padding: 12px 16px; margin-bottom: 10px; font-size: 14px; color: #a7f3d0; }
    .prompt-box { background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 10px; padding: 16px; margin-bottom: 12px; }
    .prompt-text { font-size: 15px; font-weight: 600; color: #ffffff; margin-bottom: 6px; }
    .prompt-sub { font-size: 13px; color: #94a3b8; line-height: 1.4; }
    .radar-box { background: #1e293b; border-radius: 8px; padding: 12px 16px; margin-bottom: 8px; font-size: 13px; color: #cbd5e1; }
    .footer { text-align: center; padding: 24px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; }
    .btn { display: inline-block; background: #4f46e5; color: #ffffff !important; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Waypoint Weekly Learning Digest</h1>
      <p>${studentName} (${grade}) • ${school}</p>
    </div>
    <div class="content">
      <div class="greeting">
        Dear ${parentName || 'Parent'},<br><br>
        Here is your AI-curated summary of ${studentName}'s STEM breakthroughs, focus hours, and recommended dinner table discussions for the week.
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-val">${weeklyFocusHours} Hours</div>
          <div class="metric-label">Active Focus Time</div>
        </div>
        <div class="metric-card">
          <div class="metric-val">+${masteryGainPercent}%</div>
          <div class="metric-label">Mastery Growth</div>
        </div>
        <div class="metric-card">
          <div class="metric-val">${streakDays} Days</div>
          <div class="metric-label">Active Recall Streak</div>
        </div>
        <div class="metric-card">
          <div class="metric-val">${masteredCardsCount} Cards</div>
          <div class="metric-label">Long-Term Memory</div>
        </div>
      </div>

      <div class="section-title">✨ Weekly Executive Summary</div>
      <p style="font-size: 14px; color: #94a3b8; line-height: 1.6; margin-bottom: 20px;">
        ${headlineSummary}
      </p>

      <div class="section-title">🎉 Milestone Celebrations</div>
      ${celebrations.map(c => `<div class="celebration-item">🏆 <strong>${c}</strong></div>`).join('')}

      <div class="section-title">🍽️ Dinner Table Conversation Starters</div>
      <p style="font-size: 13px; color: #94a3b8; margin-bottom: 12px;">
        Try asking these conversational questions instead of "How was school?":
      </p>
      ${dinnerPrompts.map(p => `
        <div class="prompt-box">
          <div class="prompt-text">"${p.prompt}"</div>
          <div class="prompt-sub">💡 <strong>Why it connects:</strong> ${p.whyItMatters}</div>
        </div>
      `).join('')}

      ${weakAreas && weakAreas.length > 0 ? `
        <div class="section-title">🎯 Targeted Home Action</div>
        ${weakAreas.slice(0, 2).map(w => `
          <div class="radar-box">
            <strong>${w.topic}:</strong> ${w.recommendedHomeAction}
          </div>
        `).join('')}
      ` : ''}

      <div style="text-align: center; margin-top: 24px;">
        <a href="https://waypoint-edtech.vercel.app" class="btn">View Live Parent Dashboard</a>
      </div>
    </div>

    <div class="footer">
      Sent with care by Waypoint AI Learning Platform.<br>
      To manage email notification frequencies, log in to your Parent Portal settings.
    </div>
  </div>
</body>
</html>
  `.trim();
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  // Rate Limiting: Max 10 digest requests per minute
  if (!checkRateLimit(req, res, { maxRequests: 10, windowMs: 60000, endpointName: 'Parent Digest Notification' })) {
    return;
  }

  try {
    const {
      parentEmail,
      studentName = 'Maya Chen',
      parentName = 'Dr. Robert Chen',
      grade = 'Grade 11 (AP STEM)',
      school = 'St. Jude STEM Academy',
      weeklyFocusHours = 8.5,
      masteryGainPercent = 14,
      streakDays = 12,
      masteredCardsCount = 38,
      headlineSummary = 'Maya had an exceptional week, achieving complete mastery on Chain Rule derivatives and maintaining an active 12-day Spaced Repetition streak.',
      celebrations = ['Mastered Chain Rule Multi-variable Derivatives', '12-Day Active Recall Streak'],
      dinnerPrompts = [
        {
          prompt: 'How does the Chain Rule relate to gears turning inside a mechanical watch?',
          whyItMatters: 'Deepens intuition for compounding rates of change.'
        }
      ],
      weakAreas = []
    } = req.body;

    const html = renderWeeklyDigestHtml({
      studentName,
      parentName,
      grade,
      school,
      weeklyFocusHours,
      masteryGainPercent,
      streakDays,
      masteredCardsCount,
      headlineSummary,
      celebrations,
      dinnerPrompts,
      weakAreas
    });

    const resendApiKey = process.env.RESEND_API_KEY;
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    const recipient = parentEmail || 'parent@example.com';

    // 1. Resend API Dispatch
    if (resendApiKey) {
      const emailRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${resendApiKey.trim()}`
        },
        body: JSON.stringify({
          from: 'Waypoint Learning <updates@waypoint-learning.com>',
          to: [recipient],
          subject: `Weekly STEM Learning Digest for ${studentName}`,
          html
        })
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        return res.status(emailRes.status).json({ error: `Resend dispatch failed: ${errText}` });
      }

      const data = await emailRes.json();
      return res.status(200).json({
        success: true,
        delivered: true,
        provider: 'resend',
        messageId: data.id,
        recipient,
        previewHtml: html
      });
    }

    // 2. SendGrid API Dispatch
    if (sendgridApiKey) {
      const emailRes = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sendgridApiKey.trim()}`
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: recipient }] }],
          from: { email: 'updates@waypoint-learning.com', name: 'Waypoint Learning' },
          subject: `Weekly STEM Learning Digest for ${studentName}`,
          content: [{ type: 'text/html', value: html }]
        })
      });

      if (!emailRes.ok) {
        const errText = await emailRes.text();
        return res.status(emailRes.status).json({ error: `SendGrid dispatch failed: ${errText}` });
      }

      return res.status(200).json({
        success: true,
        delivered: true,
        provider: 'sendgrid',
        recipient,
        previewHtml: html
      });
    }

    // 3. Graceful Simulation Mode (No server key set)
    return res.status(200).json({
      success: true,
      delivered: false,
      simulated: true,
      provider: 'simulation',
      notice: 'RESEND_API_KEY / SENDGRID_API_KEY not configured on server. Email compiled and rendered successfully in preview mode.',
      recipient,
      previewHtml: html
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
}
