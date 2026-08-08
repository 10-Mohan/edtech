import { ChatMessage, DiagnosticQuestion, DiagnosticResult } from '../types';
import { AIProviderService } from './aiProvider';

export const SOCRATIC_SYSTEM_PROMPT = `You are Waypoint, an elite Socratic STEM Tutor built on first-principles pedagogy (Khanmigo & Bloom's 2-Sigma standard).
YOUR SACRED RULE: NEVER directly give the full answer, final numerical calculation, or complete derivation code.
Instead:
1. Guide the student step-by-step through probing questions.
2. Ask them to explain what physically or geometrically happens at intermediate steps.
3. Propose intuitive thought experiments (e.g. "What happens if $x \\to 0$ or as $t \\to \\infty$?").
4. Validate their correct reasoning with enthusiasm and gently illuminate any misconceptions with targeted counter-questions.
5. Format mathematical equations with standard LaTeX ($x^2$, $\\frac{df}{dx}$, \\int). Keep responses concise (under 120 words) to encourage dynamic back-and-forth dialogue.`;

export const FEYNMAN_SYSTEM_PROMPT = `You are a Feynman Technique Mastery Evaluator.
The student will attempt to explain a complex STEM topic in simple, intuitive terms as if teaching a beginner.
Evaluate their explanation rigorously based on:
1. Conceptual Comprehension (0-100%): Did they capture the fundamental mechanism correctly?
2. Jargon-Free Clarity (0-100%): Did they use clear analogies instead of copy-pasting textbook jargon?
3. Missing Key Nuances: What critical mechanism, boundary case, or practical implication was left out?

CRITICAL: Return ONLY valid JSON in this exact structure:
{
  "comprehensionScore": 85,
  "clarityScore": 90,
  "missingKeyPoints": ["Mentioning why the rate approaches a finite limit", "Connecting to a real-world physical example"],
  "praise": "Outstanding intuitive breakdown using the moving car speedometer analogy!",
  "suggestion": "To make this 100% complete, briefly explain what happens when the interval $\\Delta t$ shrinks to zero."
}`;

/**
 * Real Socratic AI Tutor Generator (Async with live LLM + offline fallback)
 */
export async function generateSocraticResponseAsync(
  userMessage: string,
  contextTopic?: string,
  history: ChatMessage[] = []
): Promise<string> {
  if (AIProviderService.isLiveProviderActive()) {
    try {
      const messages = history.slice(-6).map(m => ({
        role: (m.sender === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
        content: m.text
      }));
      messages.push({ role: 'user', content: userMessage });

      const topicContext = contextTopic ? `\nCURRENT SUBJECT FOCUS: ${contextTopic}` : '';
      const reply = await AIProviderService.callChatCompletion(
        SOCRATIC_SYSTEM_PROMPT + topicContext,
        messages
      );
      if (reply.trim()) {
        return reply.trim();
      }
    } catch (err) {
      console.warn('Live AI provider failed, falling back to simulated engine:', err);
    }
  }

  // High-fidelity fallback
  return generateSocraticResponse(userMessage, contextTopic);
}

/**
 * Real Socratic AI Tutor Streamer (Async with live SSE stream + fallback simulation)
 */
export async function generateSocraticResponseStreamAsync(
  userMessage: string,
  contextTopic?: string,
  history: ChatMessage[] = [],
  onChunk?: (chunk: string, fullAccumulated: string) => void
): Promise<string> {
  const messages = history.slice(-6).map(m => ({
    role: (m.sender === 'assistant' ? 'assistant' : 'user') as 'assistant' | 'user',
    content: m.text
  }));
  messages.push({ role: 'user', content: userMessage });

  const topicContext = contextTopic ? `\nCURRENT SUBJECT FOCUS: ${contextTopic}` : '';

  if (onChunk) {
    try {
      const streamedText = await AIProviderService.streamChatCompletion(
        SOCRATIC_SYSTEM_PROMPT + topicContext,
        messages,
        onChunk
      );
      if (streamedText.trim()) {
        return streamedText.trim();
      }
    } catch (err) {
      console.warn('Live streaming provider failed, falling back to simulated stream:', err);
    }
  }

  const fallback = generateSocraticResponse(userMessage, contextTopic);
  if (onChunk) {
    onChunk(fallback, fallback);
  }
  return fallback;
}

/**
 * Real Feynman Evaluator (Async with live LLM JSON mode + offline fallback)
 */
export async function evaluateFeynmanExplanationAsync(
  topicTitle: string,
  studentExplanation: string
): Promise<ChatMessage['feynmanFeedback']> {
  if (AIProviderService.isLiveProviderActive()) {
    try {
      const prompt = `Topic to evaluate: "${topicTitle}"\nStudent Explanation:\n"${studentExplanation}"`;
      const rawJson = await AIProviderService.callChatCompletion(
        FEYNMAN_SYSTEM_PROMPT,
        [{ role: 'user', content: prompt }],
        { jsonMode: true }
      );

      const parsed = JSON.parse(rawJson);
      return {
        comprehensionScore: Math.min(100, Math.max(0, Number(parsed.comprehensionScore) || 75)),
        clarityScore: Math.min(100, Math.max(0, Number(parsed.clarityScore) || 80)),
        missingKeyPoints: Array.isArray(parsed.missingKeyPoints) && parsed.missingKeyPoints.length > 0
          ? parsed.missingKeyPoints
          : ['All essential conceptual mechanisms covered!'],
        praise: parsed.praise || 'Great effort putting this into your own words!',
        suggestion: parsed.suggestion || 'Try adding a visual analogy to ground the concept even further.'
      };
    } catch (err) {
      console.warn('Live Feynman evaluation failed, falling back to local heuristic evaluator:', err);
    }
  }

  return evaluateFeynmanExplanation(topicTitle, studentExplanation);
}

/**
 * Synchronous / Heuristic Socratic Generator (used as instant fallback & unit tests)
 */
export function generateSocraticResponse(userMessage: string, contextTopic?: string): string {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes('airplane') || msg.includes('plane') || msg.includes('fly') || msg.includes('flight') || msg.includes('wing') || msg.includes('lift') || msg.includes('bernoulli')) {
    return `Let's examine the physics of flight from first principles! An airplane wing (airfoil) is curved on top and flatter on the bottom. When air flows faster over the curved top, what does Bernoulli's principle tell us about the air pressure above vs. below the wing? Which direction must the net aerodynamic force act?`;
  }

  if (msg.includes('derivative') || msg.includes('calculus') || msg.includes('rate of change')) {
    return `Great question! Before calculating the derivative mechanically, let's think about what a derivative physically represents. If you were looking at a car's speedometer at an exact split second, how does that relate to the total distance traveled over time? What happens if the time interval $\\Delta t$ shrinks toward zero?`;
  }
  
  if (msg.includes('matrix') || msg.includes('vector') || msg.includes('linear algebra')) {
    return `Let's visualize this geometrically. When we multiply a matrix by a vector, we aren't just doing arithmetic on numbers—we are transforming the entire coordinate grid! Imagine rotating or stretching a rubber sheet. What happens to the basis vectors $\\hat{i} = [1, 0]$ and $\\hat{j} = [0, 1]$ after the transformation?`;
  }

  if (msg.includes('photosynthesis') || msg.includes('chloroplast') || msg.includes('biology')) {
    return `Let's trace the energy currency! Sunlight hits the thylakoid membrane, but what is the exact molecule that gets split to release oxygen and provide excited electrons? Try walking through the Light-Dependent reactions first.`;
  }

  if (msg.includes('force') || msg.includes('newton') || msg.includes('friction') || msg.includes('gravity') || msg.includes('momentum')) {
    return `Let's draw a mental Free Body Diagram first! What are all the individual contact forces and non-contact forces acting on the object along each axis? Is there any net unbalanced force, or is the system in dynamic equilibrium?`;
  }

  if (msg.includes('money') || msg.includes('inflation') || msg.includes('economy') || msg.includes('price')) {
    return `Let's think in first principles! If the total amount of currency circulating on an island doubles overnight, but the total supply of grain and goods stays identical, what must happen to the price of each basket of grain when consumers bid for them?`;
  }

  if (msg.includes('recursion') || msg.includes('binary tree') || msg.includes('algorithm') || msg.includes('code')) {
    return `With recursion, the secret is always in the base case and the sub-problem contract! If your function solved the problem for a sub-tree of size $(N-1)$, what is the single remaining step to combine that with the root?`;
  }

  const socraticPrompts = [
    `That's a pivotal concept in ${contextTopic || 'this discipline'}. What is the fundamental definition you are applying here, and what assumptions are you making about starting conditions?`,
    `Let's break that down into smaller steps. What is the very first physical or mathematical thing that occurs before this step? How can you verify that intermediate result?`,
    `Interesting intuition! If we tested an extreme edge case (like when $x = 0$ or as $x \\to \\infty$), does your explanation still hold true? What happens?`,
    `Could you explain what you expect to happen if we reverse the process? What is the core mechanism driving this behavior?`
  ];
  return socraticPrompts[Math.floor(Math.random() * socraticPrompts.length)];
}

/**
 * Synchronous / Heuristic Feynman Evaluator
 */
export function evaluateFeynmanExplanation(topicTitle: string, studentExplanation: string): ChatMessage['feynmanFeedback'] {
  const wordCount = studentExplanation.trim().split(/\s+/).length;
  const lower = studentExplanation.toLowerCase();

  let comprehensionScore = 70;
  let clarityScore = 75;
  const missingPoints: string[] = [];
  let praise = '';
  let suggestion = '';

  if (wordCount < 15) {
    comprehensionScore = 45;
    clarityScore = 50;
    missingPoints.push('Core underlying mechanism');
    missingPoints.push('Real-world analogy or visual illustration');
    praise = 'Good start identifying the topic!';
    suggestion = 'Your explanation is quite brief. Try explaining it as if you were teaching a 12-year-old using simple words and analogies.';
  } else if (lower.includes('because') || lower.includes('means') || lower.includes('for example') || lower.includes('imagine')) {
    comprehensionScore = Math.min(96, 75 + Math.floor(wordCount / 4));
    clarityScore = Math.min(94, 80 + Math.floor(wordCount / 6));
    praise = 'Terrific use of causal reasoning and everyday language!';
    suggestion = 'To make this explanation 100% airtight, connect it back to the mathematical formulation or boundary condition.';
    if (!lower.includes('limit') && topicTitle.toLowerCase().includes('calculus')) {
      missingPoints.push('Mentioning how limits formalize the instantaneous rate');
    }
  } else {
    comprehensionScore = 65;
    clarityScore = 70;
    missingPoints.push('Intuitive analogy for beginners');
    missingPoints.push('Why this concept matters in practice');
    praise = 'You covered the formal jargon well.';
    suggestion = 'Avoid simply repeating textbook definitions. Try replacing technical terms with simple analogies.';
  }

  return {
    comprehensionScore,
    clarityScore,
    missingKeyPoints: missingPoints.length > 0 ? missingPoints : ['All key primary points covered!'],
    praise,
    suggestion
  };
}

/**
 * Diagnostic Evaluation & Auto-Generation of Recall Cards
 */
export function processDiagnosticSubmission(
  questions: DiagnosticQuestion[],
  selectedAnswers: Record<string, string>
): DiagnosticResult {
  let correctCount = 0;
  const gaps: DiagnosticResult['identifiedGaps'] = [];
  const generatedCardIds: string[] = [];

  questions.forEach(q => {
    const selectedOptionId = selectedAnswers[q.id];
    const chosenOption = q.options.find(opt => opt.id === selectedOptionId);
    
    if (chosenOption && chosenOption.isCorrect) {
      correctCount++;
    } else {
      const misconception = chosenOption?.misconceptionFeedback || `Struggled with foundational ${q.topicTitle} rules.`;
      gaps.push({
        topicId: q.topicId,
        topicTitle: q.topicTitle,
        severity: 'high',
        misconception,
        recommendedAction: `Complete 5-minute targeted recall drill on ${q.topicTitle}.`
      });
      generatedCardIds.push(`card-auto-${q.topicId}-${Date.now()}`);
    }
  });

  return {
    totalQuestions: questions.length,
    correctAnswers: correctCount,
    identifiedGaps: gaps,
    generatedCardIds
  };
}
