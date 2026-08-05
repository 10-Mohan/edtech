import { ChatMessage, DiagnosticQuestion, DiagnosticResult, HomeworkProblem, RecallCard } from '../types';

/**
 * Socratic AI Tutor Response Generator
 */
export function generateSocraticResponse(userMessage: string, contextTopic?: string): string {
  const msg = userMessage.toLowerCase();
  
  if (msg.includes('derivative') || msg.includes('calculus') || msg.includes('rate of change')) {
    return `Great question! Before calculating the derivative mechanically, let's think about what a derivative physically represents. If you were looking at a car's speedometer at an exact split second, how does that relate to the total distance traveled over time? What happens if the time interval $\\Delta t$ shrinks toward zero?`;
  }
  
  if (msg.includes('matrix') || msg.includes('vector') || msg.includes('linear algebra')) {
    return `Let's visualize this geometrically. When we multiply a matrix by a vector, we aren't just doing arithmetic on numbers—we are transforming the entire coordinate grid! Imagine rotating or stretching a rubber sheet. What happens to the basis vectors $\\hat{i} = [1, 0]$ and $\\hat{j} = [0, 1]$ after the transformation?`;
  }

  if (msg.includes('photosynthesis') || msg.includes('chloroplast') || msg.includes('biology')) {
    return `Let's trace the energy currency! Sunlight hits the thylakoid membrane, but what is the exact molecule that gets split to release oxygen and provide excited electrons? Try walking through the Light-Dependent reactions first.`;
  }

  if (msg.includes('force') || msg.includes('newton') || msg.includes('friction') || msg.includes('gravity')) {
    return `Let's draw a mental Free Body Diagram first! What are all the individual contact forces and non-contact forces acting on the object along each axis? Is there any net unbalanced force, or is the system in dynamic equilibrium?`;
  }

  if (msg.includes('recursion') || msg.includes('binary tree') || msg.includes('algorithm')) {
    return `With recursion, the secret is always in the base case and the sub-problem contract! If your function solved the problem for a sub-tree of size $(N-1)$, what is the single remaining step to combine that with the root?`;
  }

  // Generic Socratic prompt
  const socraticPrompts = [
    `That's a pivotal concept. What is the fundamental definition or rule you are applying here, and what assumptions are you making about the starting conditions?`,
    `Let's break that down into smaller steps. What is the very first thing that occurs before this step? How can you verify that intermediate result?`,
    `Interesting intuition! If we tested an extreme edge case (like when $x = 0$ or as $x \\to \\infty$), does your explanation still hold true? What happens?`,
    `Could you explain what you expect to happen if we reverse the process? What is the core mechanism driving this behavior?`
  ];
  return socraticPrompts[Math.floor(Math.random() * socraticPrompts.length)];
}

/**
 * Feynman Technique Evaluator ("Teach the AI")
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
 * Evaluate Diagnostic Test & Auto-Generate Recall Cards
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
      // Gap identified!
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
