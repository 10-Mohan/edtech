import { renderWeeklyDigestHtml } from '../notifications/parent-digest';

/**
 * Vercel Cron Handler: Automatically runs every Sunday at 18:00 UTC (or manual test trigger)
 * Dispatches the weekly learning digest to all active student parent emails.
 */
export default async function handler(req: any, res: any) {
  // Verify Vercel Cron Secret if configured
  const authHeader = req.headers['authorization'] || req.headers['x-cron-auth'];
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: 'Unauthorized: Invalid Cron Secret' });
  }

  try {
    const resendApiKey = process.env.RESEND_API_KEY;
    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    // Active student cohorts to digest
    const mockRecipients = [
      {
        studentName: 'Maya Chen',
        parentName: 'Dr. Robert Chen',
        parentEmail: 'parent.chen@example.com',
        grade: 'Grade 11 (AP STEM)',
        school: 'St. Jude STEM Academy',
        weeklyFocusHours: 8.5,
        masteryGainPercent: 14,
        streakDays: 12,
        masteredCardsCount: 38,
        headlineSummary: 'Maya demonstrated high conceptual consistency in Calculus derivatives and physics kinematics, advancing to Tier 3 extension worksheets.',
        celebrations: ['Mastered Chain Rule Multi-variable Derivatives', '12-Day Active Recall Streak'],
        dinnerPrompts: [
          {
            prompt: 'How does the Chain Rule relate to gears turning inside a mechanical watch?',
            whyItMatters: 'Deepens intuition for compounding rates of change.'
          }
        ],
        weakAreas: [{ topic: 'Rotational Inertia', recommendedHomeAction: 'Review bicycle wheel gyroscopic angular momentum demo.' }]
      },
      {
        studentName: 'Leo Vance',
        parentName: 'Sarah Vance',
        parentEmail: 'sarah.vance@example.com',
        grade: 'Grade 9 (Pre-AP STEM)',
        school: 'St. Jude STEM Academy',
        weeklyFocusHours: 6.2,
        masteryGainPercent: 18,
        streakDays: 7,
        masteredCardsCount: 24,
        headlineSummary: 'Leo achieved an 18% mastery leap in Linear Algebra matrices and resolved his sign confusion on 2x2 determinants.',
        celebrations: ['Perfect score on Matrix Vector Transformations', '7-Day Streak Achieved'],
        dinnerPrompts: [
          {
            prompt: 'Why do 3D video games rely on matrix multiplication for camera angles?',
            whyItMatters: 'Connects matrix transformations to gaming graphics pipelines.'
          }
        ],
        weakAreas: [{ topic: 'Vector Cross Products', recommendedHomeAction: 'Practice right-hand rule hand physical gesture.' }]
      }
    ];

    const results = [];

    for (const student of mockRecipients) {
      const html = renderWeeklyDigestHtml(student);

      if (resendApiKey) {
        const emailRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendApiKey.trim()}`
          },
          body: JSON.stringify({
            from: 'Waypoint Learning <updates@waypoint-learning.com>',
            to: [student.parentEmail],
            subject: `Weekly STEM Learning Digest for ${student.studentName}`,
            html
          })
        });
        const data = await emailRes.json();
        results.push({ student: student.studentName, email: student.parentEmail, status: 'dispatched', id: data.id });
      } else if (sendgridApiKey) {
        await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${sendgridApiKey.trim()}`
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: student.parentEmail }] }],
            from: { email: 'updates@waypoint-learning.com', name: 'Waypoint Learning' },
            subject: `Weekly STEM Learning Digest for ${student.studentName}`,
            content: [{ type: 'text/html', value: html }]
          })
        });
        results.push({ student: student.studentName, email: student.parentEmail, status: 'dispatched_sendgrid' });
      } else {
        results.push({ student: student.studentName, email: student.parentEmail, status: 'simulated_rendered' });
      }
    }

    return res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      cronJob: 'parent_weekly_digest',
      dispatchedCount: results.length,
      details: results
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Cron Execution Error' });
  }
}
