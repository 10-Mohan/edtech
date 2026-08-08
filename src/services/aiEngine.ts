import { ChatMessage, DiagnosticQuestion, DiagnosticResult } from '../types';
import { AIProviderService } from './aiProvider';

export const SOCRATIC_SYSTEM_PROMPT = `You are Waypoint, an elite Socratic STEM Tutor built on first-principles pedagogy (Khanmigo & Bloom's 2-Sigma standard).
YOUR SACRED RULE: NEVER directly give the full answer, final numerical calculation, or complete derivation code.
Instead:
1. Guide the student step-by-step through probing questions.
2. Ask them to explain what physically or geometrically happens at intermediate steps.
3. Propose intuitive thought experiments (e.g. "What happens if $x \\to 0$ or as $t \\to \\infty$?").
4. Validate their correct reasoning with enthusiasm and gently illuminate any misconceptions with targeted counter-questions.
5. Format mathematical equations using clean, natural mathematical notation (e.g. F = G * (m1 * m2) / r², dy/dx, x², √(x)). Avoid raw LaTeX syntax like \\frac or curly braces. Keep responses concise (under 120 words) to encourage dynamic back-and-forth dialogue.`;

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

  // High-fidelity fallback with conversation history
  return generateSocraticResponse(userMessage, contextTopic, history);
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

  const fallback = generateSocraticResponse(userMessage, contextTopic, history);
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
 * Multi-Turn Socratic Dialogue Generator (Maintains progressive pedagogical chain)
 */
export function generateSocraticResponse(
  userMessage: string,
  contextTopic?: string,
  history: ChatMessage[] = []
): string {
  const msg = userMessage.toLowerCase().trim();
  const priorUserMessages = history.filter(m => m.sender === 'user');
  const userTurn = priorUserMessages.length + 1; // 1 = first question, 2+ = multi-turn answer
  const lastAssistantMsg = history.filter(m => m.sender === 'assistant').slice(-1)[0]?.text.toLowerCase() || '';

  // -------------------------------------------------------------
  // Check if student is asking for a hint or expresses confusion
  // -------------------------------------------------------------
  const isAskingForHint = msg.includes("don't know") || msg.includes('dont know') || msg.includes('not sure') || msg.includes('hint') || msg.includes('help') || msg.includes('confused') || msg.includes('no idea') || msg === '?';
  if (isAskingForHint) {
    if (lastAssistantMsg.includes('bernoulli') || lastAssistantMsg.includes('wing') || lastAssistantMsg.includes('pressure')) {
      return `Here's an intuitive hint: Imagine holding a piece of paper horizontally beneath your mouth and blowing over the top surface. The fast-moving air above lowers the pressure, so the normal atmospheric pressure underneath lifts the paper up! Applying that to a wing: what does faster air over the curved top do to the pressure difference?`;
    }
    if (lastAssistantMsg.includes('ice') || lastAssistantMsg.includes('density') || lastAssistantMsg.includes('lattice')) {
      return `Here's a visual clue: Think of liquid water molecules as people mingling closely in a crowded room. When it freezes into ice, they must all hold hands at arms' length in a rigid hexagon. Does that crowd take up more space or less space? What does that mean for mass per unit volume (density)?`;
    }
    if (lastAssistantMsg.includes('derivative') || lastAssistantMsg.includes('slope') || lastAssistantMsg.includes('secant')) {
      return `Here's a direct analogy: If you drive 60 miles in 1 hour, your average speed was 60 mph. But at second 45, you could have been stopped at a red light! To find your exact speed at second 45, we shrink the measured time window $\\Delta t$ closer and closer to 0. What geometric line does that secant line turn into at that exact instant?`;
    }
    return `Let's break it down into a simpler stepping stone! Think about the system before any change happens: what is the single main force or variable acting here? If you had to guess just the direction of change (increasing or decreasing), which way would it go?`;
  }

  // -------------------------------------------------------------
  // Multi-Turn Follow-Up Logic (Turn 2, Turn 3, Turn 4+)
  // -------------------------------------------------------------
  if (userTurn > 1) {
    // A. Aerodynamics Follow-Up
    if (lastAssistantMsg.includes('bernoulli') || lastAssistantMsg.includes('wing') || lastAssistantMsg.includes('air pressure') || lastAssistantMsg.includes('stall')) {
      if (lastAssistantMsg.includes('pressure') && !lastAssistantMsg.includes('angle of attack')) {
        return `Spot on! Higher pressure underneath and lower pressure on top creates a net upward aerodynamic force: **Lift**! Now here is the next crucial step: If the airplane needs more lift at low speeds (e.g. landing), the pilot tilts the wing upward (increasing the angle of attack). What happens if they tilt the wing too steep? At what point does the smooth airflow detach from the upper surface?`;
      }
      return `Brilliant insight! Exceeding the critical angle of attack causes boundary layer separation—the air can no longer follow the wing's curve, resulting in an aerodynamic stall. You have just derived the core aerodynamic principles of lift and stall recovery from first principles! How does this compare to how an airplane flies upside down?`;
    }

    // B. Ice & Density Follow-Up
    if (lastAssistantMsg.includes('lattice') || lastAssistantMsg.includes('ice') || lastAssistantMsg.includes('archimedes') || lastAssistantMsg.includes('lake')) {
      if (!lastAssistantMsg.includes('aquatic') && !lastAssistantMsg.includes('lake')) {
        return `Exactly right! The rigid hexagonal lattice forces the molecules farther apart, expanding the volume and making solid ice ~9% less dense than liquid water. According to Archimedes' principle, the buoyant force of the displaced water easily supports it. Now, connect this to ecology: Why is it vital for fish and aquatic life in winter that ice floats and insulates lakes from the top down, rather than freezing solid from the bottom up?`;
      }
      return `Outstanding synthesis! Because ice stays at the surface, it forms an insulating thermal blanket that prevents lakes from freezing solid to the seabed, preserving life below. You connected molecular hydrogen bonding directly to global ecological survival! What other liquid behaves this way?`;
    }

    // C. Calculus Derivatives Follow-Up
    if (lastAssistantMsg.includes('derivative') || lastAssistantMsg.includes('speedometer') || lastAssistantMsg.includes('secant') || lastAssistantMsg.includes('power rule')) {
      if (!lastAssistantMsg.includes('power rule') && !lastAssistantMsg.includes('t^2')) {
        return `Precisely! The secant line slope converges to the slope of the tangent line at that exact instant. Let's make this concrete: if a particle's position is $s(t) = t^2$, write out the average rate of change $\\frac{s(t + \\Delta t) - s(t)}{\\Delta t}$. What happens when you expand $(t + \\Delta t)^2$ and cancel out $\\Delta t$?`;
      }
      return `Fantastic! When you expand $\\frac{t^2 + 2t\\Delta t + (\\Delta t)^2 - t^2}{\\Delta t}$, the $t^2$ cancels, the $\\Delta t$ factors out leaving $2t + \\Delta t$, which becomes exactly $2t$ as $\\Delta t \\to 0$. You've just derived the Power Rule directly from Fermat and Newton's definition of the derivative! What would happen for $s(t) = t^3$?`;
    }

    // D. Electromagnetism & Circuits Follow-Up
    if (lastAssistantMsg.includes('circuit') || lastAssistantMsg.includes('resistor') || lastAssistantMsg.includes('voltage') || lastAssistantMsg.includes('current')) {
      return `Correct! In a series circuit, conservation of charge dictates current $I$ is constant everywhere ($I = V_{total} / R_{total}$). In a parallel circuit, however, each branch experiences the full source voltage. If you add a third identical lightbulb in parallel to a household circuit, does the brightness of the existing bulbs change, and what happens to the total current drawn from the wall outlet?`;
    }

    // E. General Multi-Turn Progress (Contextual acknowledge + next logical step)
    const acknowledgedText = userMessage.length > 40 ? userMessage.slice(0, 40) + '...' : userMessage;
    return `Excellent reasoning when you note **"${acknowledgedText}"**!
That validates the first mechanism. Taking this to the next step:
1. How does this intermediate effect influence the overall equilibrium of the system?
2. If we push this system to an extreme limit (e.g. infinite time or zero resistance), what is the final steady-state outcome?`;
  }

  // -------------------------------------------------------------
  // Initial Inquiry (Turn 1): Rich First-Principles Topic Triggers
  // -------------------------------------------------------------
  
  // 1. Aerodynamics & Fluid Dynamics
  if (msg.includes('airplane') || msg.includes('plane') || msg.includes('fly') || msg.includes('flight') || msg.includes('wing') || msg.includes('lift') || msg.includes('bernoulli') || msg.includes('airfoil')) {
    return `Let's examine the physics of flight from first principles! An airplane wing (airfoil) is curved on top and flatter on the bottom. When air flows faster over the curved top, what does Bernoulli's principle tell us about the air pressure above vs. below the wing? Which direction must the net aerodynamic force act?`;
  }

  // 2. Buoyancy, Density & Floating (e.g. Ice Floating)
  if (msg.includes('ice') || msg.includes('float') || msg.includes('buoyan') || msg.includes('archimedes') || msg.includes('density') || msg.includes('sink')) {
    return `Let's investigate from atomic structure and Archimedes' Principle! When liquid water freezes into ice, its hydrogen bonds form an open hexagonal crystalline lattice. Does this lattice cause the molecules to spread farther apart or pack closer together? And according to Archimedes' Principle, why does an object with lower density than the surrounding fluid experience a net upward buoyant force?`;
  }

  // 3. Calculus: Derivatives & Rates of Change
  if (msg.includes('derivative') || msg.includes('chain rule') || msg.includes('product rule') || msg.includes('calculus') || msg.includes('rate of change') || msg.includes('differentiate')) {
    return `Great question! Before calculating the derivative mechanically, let's think about what a derivative physically represents. If you were looking at a car's speedometer at an exact split second, how does that relate to the total distance traveled over time? What happens to the secant line slope as the time interval Δt shrinks toward zero?`;
  }

  // 4. Calculus: Integrals & Accumulation
  if (msg.includes('integral') || msg.includes('integration') || msg.includes('anti-derivative') || msg.includes('area under') || msg.includes('riemann')) {
    return `Let's visualize integration from first principles! If a derivative gives you the instantaneous velocity v(t), what happens when you sum up infinitely many infinitesimal rectangles of width dt multiplied by height v(t)? What physical quantity does that total area under the curve accumulate?`;
  }
  
  // 5. Linear Algebra: Matrices, Eigenvectors & Transforms
  if (msg.includes('matrix') || msg.includes('vector') || msg.includes('linear algebra') || msg.includes('eigen') || msg.includes('determinant')) {
    return `Let's visualize this geometrically. When we multiply a matrix by a vector, we aren't just doing arithmetic on numbers—we are transforming the entire coordinate grid! Imagine rotating or stretching a rubber sheet. What happens to the special vectors (eigenvectors) whose direction remains completely unchanged along their span during this transformation?`;
  }

  // 6. Thermodynamics & Entropy
  if (msg.includes('thermodynamic') || msg.includes('entropy') || msg.includes('heat') || msg.includes('carnot') || msg.includes('temperature') || msg.includes('absolute zero')) {
    return `Let's think in terms of statistical mechanics! Temperature is simply the average kinetic energy of vibrating molecules. Why can heat energy never spontaneously flow from a colder body to a hotter body without external work? What does the Second Law of Thermodynamics say about the total number of microstates (entropy) of an isolated system over time?`;
  }

  // 7. Electromagnetism & Circuits
  if (msg.includes('circuit') || msg.includes('current') || msg.includes('voltage') || msg.includes('resistance') || msg.includes('ohm') || msg.includes('magnetic') || msg.includes('induction') || msg.includes('faraday')) {
    return `Let's trace the flow of electrical charges! Voltage represents the electrical potential energy per unit charge (the "push"), while current is the rate of flow of electrons. In a closed circuit with two resistors in series vs. parallel, why must the current remain constant through series components, while the voltage drops across each?`;
  }

  // 8. Quantum Mechanics & Relativity
  if (msg.includes('quantum') || msg.includes('relativity') || msg.includes('photon') || msg.includes('wave-particle') || msg.includes('speed of light') || msg.includes('time dilation')) {
    return `Let's explore this famous thought experiment! Einstein postulated that the speed of light c is identical in all inertial reference frames, regardless of how fast the light source moves. If a spaceship travels at 0.9c and shines a flashlight forward, why does an outside observer measure the light at exactly c, and what must happen to the tick-rate of time inside the spaceship to keep the speed of light constant?`;
  }

  // 9. Chemistry: Chemical Bonding & Reactions
  if (msg.includes('bond') || msg.includes('covalent') || msg.includes('ionic') || msg.includes('electron') || msg.includes('reaction') || msg.includes('ph') || msg.includes('acid') || msg.includes('equilibrium')) {
    return `Let's look at the outermost electron shells! Atoms seek the lowest energetic state (often a full valence shell). In a covalent bond like H₂O, the atoms share electrons, but oxygen has higher electronegativity. How does this unequal sharing create a partial electrical dipole, and why does that give water its unique boiling point and surface tension?`;
  }

  // 10. Biology: Genetics, Photosynthesis & Cells
  if (msg.includes('photosynthesis') || msg.includes('chloroplast') || msg.includes('dna') || msg.includes('rna') || msg.includes('gene') || msg.includes('cell') || msg.includes('mitochondria')) {
    return `Let's trace the biochemical energy cycle! In cellular energy, ATP acts as the universal chemical battery. When sunlight strikes chlorophyll in the thylakoid membrane, what is the exact molecule that gets split to supply electrons, and how does the resulting proton gradient power ATP Synthase?`;
  }

  // 11. Gravity, Orbits & Astrophysics
  if (msg.includes('gravity') || msg.includes('gravitation') || msg.includes('orbit') || msg.includes('planet') || msg.includes('black hole') || msg.includes('rocket')) {
    return `Let's explore gravitation from first principles! Newton described gravity as an attractive force (F = G * m1 * m2 / r²), while Einstein revealed it as the curvature of spacetime. If you double the distance r between two planets, by what factor does the gravitational pull drop? And why does a satellite in orbit stay in perpetual free-fall without crashing into Earth?`;
  }

  // 12. Classical Mechanics: Forces, Newton's Laws & Momentum
  if (msg.includes('force') || msg.includes('newton') || msg.includes('friction') || msg.includes('momentum') || msg.includes('energy') || msg.includes('collision')) {
    return `Let's draw a mental Free Body Diagram first! What are all the individual contact forces (normal force, friction) and non-contact forces (gravity) acting on the object along each axis? According to Newton's Second Law (F_net = m * a), what must happen to the velocity if the net unbalanced force is zero?`;
  }

  // 13. Economics & Systems Thinking
  if (msg.includes('money') || msg.includes('inflation') || msg.includes('economy') || msg.includes('price') || msg.includes('market') || msg.includes('supply') || msg.includes('demand')) {
    return `Let's think in first principles! If the total amount of currency circulating on an island doubles overnight, but the total supply of grain and goods stays identical, what must happen to the price of each basket of grain when consumers bid for them? How does scarcity determine value?`;
  }

  // 14. Computer Science: Algorithms, Recursion & Data Structures
  if (msg.includes('recursion') || msg.includes('binary tree') || msg.includes('algorithm') || msg.includes('code') || msg.includes('sort') || msg.includes('graph') || msg.includes('dynamic programming') || msg.includes('big o')) {
    return `With algorithmic thinking, the key is understanding invariants and sub-problems! If your function solved the problem for an input of size (N - 1), what is the single remaining step to combine that with the N-th element? And what base case guarantees the computation terminates?`;
  }

  // 15. Dynamic First-Principles Parser for Any Specific Question
  const cleaned = msg.replace(/^(what is|what are|why does|why do|why is|how does|how do|how is|explain|tell me about|can you explain)\s+/i, '').replace(/[?!.]/g, '').trim();
  const subjectSnippet = cleaned.length > 3 ? cleaned : (contextTopic || 'this topic');

  return `Let's investigate **${subjectSnippet}** from first principles! 
1. What is the fundamental physical, mathematical, or logical rule governing this system?
2. If you were to explain the starting state before any changes occur, what are the key components involved?
3. What do you predict happens if we double or eliminate one of those key variables?`;
}

/**
 * Synchronous / Heuristic Feynman Evaluator
 */
export function evaluateFeynmanExplanation(topicTitle: string, studentExplanation: string): ChatMessage['feynmanFeedback'] {
  const words = studentExplanation.trim().split(/\s+/);
  const wordCount = words.length;
  const lower = studentExplanation.toLowerCase();

  let comprehensionScore = 72;
  let clarityScore = 75;
  const missingPoints: string[] = [];
  let praise = '';
  let suggestion = '';

  const hasCausalReasoning = lower.includes('because') || lower.includes('therefore') || lower.includes('due to') || lower.includes('leads to') || lower.includes('results in') || lower.includes('causes');
  const hasAnalogy = lower.includes('like a') || lower.includes('imagine') || lower.includes('for example') || lower.includes('think of') || lower.includes('similar to');
  const hasFirstPrinciples = lower.includes('fundamental') || lower.includes('mechanism') || lower.includes('atoms') || lower.includes('energy') || lower.includes('rate') || lower.includes('force');

  if (wordCount < 12) {
    comprehensionScore = 48;
    clarityScore = 52;
    missingPoints.push(`Underlying cause and mechanism for ${topicTitle}`);
    missingPoints.push('Real-world analogy to illustrate the concept');
    praise = 'Good initial start identifying the topic!';
    suggestion = 'Your explanation is very concise. Try explaining the "why" and "how" as if teaching someone who has never heard of this concept before.';
  } else {
    // Score based on causal depth and clarity
    let comp = 70 + Math.min(15, Math.floor(wordCount / 5));
    let clar = 72 + Math.min(15, Math.floor(wordCount / 6));

    if (hasCausalReasoning) {
      comp += 8;
      clar += 6;
    }
    if (hasAnalogy) {
      clar += 10;
      comp += 4;
    }
    if (hasFirstPrinciples) {
      comp += 6;
    }

    comprehensionScore = Math.min(98, comp);
    clarityScore = Math.min(96, clar);

    if (hasAnalogy && hasCausalReasoning) {
      praise = `Outstanding intuitive breakdown of ${topicTitle}! Using analogies paired with cause-and-effect reasoning makes the concept immediately accessible.`;
      suggestion = `To reach 100% mastery, connect your intuition back to the formal mathematical boundary conditions or edge cases.`;
    } else if (hasCausalReasoning) {
      praise = `Strong logical structure explaining how ${topicTitle} operates step-by-step!`;
      suggestion = `Try introducing a concrete physical analogy (e.g. water pipes, moving cars, or everyday objects) to make it even easier for a beginner to visualize.`;
      missingPoints.push('Intuitive visual analogy for non-technical learners');
    } else {
      praise = `Good coverage of the key ideas in ${topicTitle}.`;
      suggestion = `Avoid relying purely on definitions. Explain *why* the phenomenon happens using causal connectors like "because" or "which leads to".`;
      missingPoints.push('Explicit cause-and-effect explanation of the underlying mechanism');
    }
  }

  return {
    comprehensionScore,
    clarityScore,
    missingKeyPoints: missingPoints.length > 0 ? missingPoints : ['All primary conceptual mechanisms effectively covered!'],
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
