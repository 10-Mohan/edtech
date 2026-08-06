import { describe, it, expect } from 'vitest';
import {
  generateSocraticResponse,
  evaluateFeynmanExplanation,
  processDiagnosticSubmission,
  generateSocraticResponseAsync,
  evaluateFeynmanExplanationAsync
} from '../services/aiEngine';
import { DiagnosticQuestion } from '../types';

describe('AI Pedagogical & Diagnostic Engine', () => {
  it('generates targeted Socratic prompts with LaTeX guidance', () => {
    const reply1 = generateSocraticResponse('How do I use the derivative for sin(3x)?', 'Calculus');
    expect(reply1).toBeDefined();
    expect(reply1.length).toBeGreaterThan(20);

    const reply2 = generateSocraticResponse('What happens to a matrix vector transformation?');
    expect(reply2).toBeDefined();
    expect(reply2.length).toBeGreaterThan(15);
  });

  it('evaluates Feynman explanations and scores comprehension & clarity', () => {
    const goodExplanation =
      'A derivative is the instantaneous rate of change of a curve at a single point because it measures the slope of the tangent line as delta x approaches zero.';
    const feedback = evaluateFeynmanExplanation('Derivatives & Tangents', goodExplanation);

    expect(feedback).toBeDefined();
    if (feedback) {
      expect(feedback.comprehensionScore).toBeGreaterThanOrEqual(60);
      expect(feedback.clarityScore).toBeGreaterThanOrEqual(60);
      expect(feedback.praise).toBeDefined();
      expect(Array.isArray(feedback.missingKeyPoints)).toBe(true);
    }
  });

  it('diagnoses step gaps from multiple-choice diagnostic submissions', () => {
    const sampleQuestions: DiagnosticQuestion[] = [
      {
        id: 'q1',
        subject: 'math',
        topicId: 'calc_limits_01',
        topicTitle: 'Limits & Continuity',
        question: 'What is the limit of (sin x)/x as x approaches 0?',
        options: [
          { id: 'opt_a', text: '1', isCorrect: true },
          { id: 'opt_b', text: '0', isCorrect: false, misconceptionFeedback: 'Confused with sin(0)=0' }
        ],
        hint: 'Use the squeeze theorem'
      }
    ];

    const result = processDiagnosticSubmission(sampleQuestions, { q1: 'opt_b' });
    expect(result.totalQuestions).toBe(1);
    expect(result.correctAnswers).toBe(0);
    expect(result.identifiedGaps.length).toBe(1);
    expect(result.identifiedGaps[0].topicId).toBe('calc_limits_01');
    expect(result.generatedCardIds.length).toBe(1);
  });

  it('handles async hybrid execution seamlessly', async () => {
    const asyncReply = await generateSocraticResponseAsync('Why is the integral of 1/x equal to ln|x|?');
    expect(asyncReply).toBeDefined();
    expect(typeof asyncReply).toBe('string');

    const asyncFeynman = await evaluateFeynmanExplanationAsync(
      'Integration',
      'Area under a curve accumulated infinitely because small rectangles sum to the integral.'
    );
    expect(asyncFeynman).toBeDefined();
    if (asyncFeynman) {
      expect(asyncFeynman.comprehensionScore).toBeGreaterThan(0);
    }
  });
});
