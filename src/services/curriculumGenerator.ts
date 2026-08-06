import {
  ConceptNode,
  CurriculumGenerationPrompt,
  DifferentiatedWorksheet,
  GeneratedCurriculum,
  GraphEdge,
  SubjectId
} from '../types';
import { AIProviderService } from './aiProvider';

export const CURRICULUM_SYNTHESIS_PROMPT = `You are an elite STEM Curriculum Architect & Cognitive Instructional Designer.
Given a subject, course title, and target level, generate a rigorous, structured concept knowledge graph.
For each concept node:
1. Provide a unique ID (e.g. "calc-01-limits", "linalg-03-eigenvalues").
2. Title with mathematical precision.
3. Category (e.g. "Foundations", "Techniques", "Applications").
4. Description explaining the core intuition.
5. List of prerequisite node IDs.
6. Common student misconception and how to avoid it.
7. 2-3 key takeaways.

CRITICAL: Return ONLY valid JSON in this exact structure:
{
  "courseTitle": "Course Title",
  "subject": "math",
  "nodes": [
    {
      "id": "node-01",
      "title": "Concept Name",
      "subject": "math",
      "category": "Foundations",
      "status": "in_progress",
      "masteryScore": 65,
      "prerequisites": [],
      "x": 200,
      "y": 150,
      "description": "Intuitive description",
      "estimatedStudyMins": 20,
      "commonMisconception": "Common trap",
      "keyTakeaways": ["Takeaway 1", "Takeaway 2"]
    }
  ],
  "edges": [
    { "from": "node-01", "to": "node-02" }
  ]
}`;

export const CurriculumGeneratorService = {
  async generateCourseCurriculum(prompt: CurriculumGenerationPrompt): Promise<GeneratedCurriculum> {
    if (AIProviderService.isLiveProviderActive()) {
      try {
        const userMessage = `Generate a comprehensive curriculum graph for:\nCourse: "${prompt.courseTitle}"\nSubject: ${prompt.subject}\nLevel: ${prompt.targetLevel}\nKey Focus Units: ${prompt.keyUnits.join(', ')}`;
        const rawJson = await AIProviderService.callChatCompletion(
          CURRICULUM_SYNTHESIS_PROMPT,
          [{ role: 'user', content: userMessage }],
          { jsonMode: true }
        );

        const parsed = JSON.parse(rawJson);
        if (parsed && Array.isArray(parsed.nodes) && parsed.nodes.length > 0) {
          return {
            courseTitle: parsed.courseTitle || prompt.courseTitle,
            subject: prompt.subject,
            nodes: parsed.nodes,
            edges: parsed.edges || []
          };
        }
      } catch (err) {
        console.warn('Live AI curriculum synthesis failed, using local generator:', err);
      }
    }

    return this.generateDeterministicCurriculum(prompt);
  },

  generateDeterministicCurriculum(prompt: CurriculumGenerationPrompt): GeneratedCurriculum {
    const subject = prompt.subject;
    const courseTitle = prompt.courseTitle || 'Advanced STEM Specialization';

    const baseNodes: ConceptNode[] = [
      {
        id: `${subject}-foundations-01`,
        title: `${courseTitle} Foundations & First Principles`,
        subject: subject,
        category: 'Foundations',
        status: 'mastered',
        masteryScore: 88,
        prerequisites: [],
        x: 180,
        y: 120,
        description: 'Core axiomatic foundations, notation definitions, and geometric intuition.',
        estimatedStudyMins: 20,
        commonMisconception: 'Memorizing formulas instead of visual derivation.',
        keyTakeaways: ['Axioms and domain bounds', 'Visual representations']
      },
      {
        id: `${subject}-methods-02`,
        title: `Analytical Operations & Transformations`,
        subject: subject,
        category: 'Techniques',
        status: 'in_progress',
        masteryScore: 72,
        prerequisites: [`${subject}-foundations-01`],
        x: 380,
        y: 180,
        description: 'Step-by-step mathematical mechanics, algebraic transformations, and symmetry.',
        estimatedStudyMins: 25,
        commonMisconception: 'Ignoring boundary conditions during integration.',
        keyTakeaways: ['Algorithmic problem decomposition', 'Verifying units and dimensions']
      },
      {
        id: `${subject}-optimization-03`,
        title: `Dynamic Systems & Extremum Analysis`,
        subject: subject,
        category: 'Optimization',
        status: 'in_progress',
        masteryScore: 58,
        prerequisites: [`${subject}-methods-02`],
        x: 580,
        y: 140,
        description: 'Gradient methods, saddle points, critical boundaries, and global vs local extrema.',
        estimatedStudyMins: 30,
        commonMisconception: 'Assuming zero derivative always implies a true minimum.',
        keyTakeaways: ['Second derivative Hessian tests', 'Constrained Lagrange multipliers']
      },
      {
        id: `${subject}-applied-04`,
        title: `Real-World Modeling & Computational Simulation`,
        subject: subject,
        category: 'Applications',
        status: 'weak',
        masteryScore: 42,
        prerequisites: [`${subject}-optimization-03`],
        x: 780,
        y: 220,
        description: 'Translating physical and economic constraints into solvable differential matrix models.',
        estimatedStudyMins: 35,
        commonMisconception: 'Over-simplifying non-linear friction and feedback delays.',
        keyTakeaways: ['State-space representation', 'Numerical stability analysis']
      }
    ];

    const edges: GraphEdge[] = [
      { from: `${subject}-foundations-01`, to: `${subject}-methods-02` },
      { from: `${subject}-methods-02`, to: `${subject}-optimization-03` },
      { from: `${subject}-optimization-03`, to: `${subject}-applied-04` }
    ];

    return {
      courseTitle,
      subject,
      nodes: baseNodes,
      edges
    };
  },

  async generateDifferentiatedWorksheetAI(
    topicTitle: string,
    subject: SubjectId
  ): Promise<DifferentiatedWorksheet> {
    const prompt = `Generate a 3-Tier Differentiated Worksheet for topic: "${topicTitle}" in ${subject}.
Tier 1 (Foundational): Step-by-step scaffolds and direct calculations for students needing support.
Tier 2 (Intermediate): Standard multi-step exam problems with geometric or word contexts.
Tier 3 (Extension): Proofs, high-order generalizations, and olympiad-level challenges for advanced students.

CRITICAL: Return ONLY valid JSON:
{
  "title": "Tiered Differentiation: ${topicTitle}",
  "subject": "${subject}",
  "topicTitle": "${topicTitle}",
  "tier1Foundational": {
    "targetStudents": ["Lucas Vance", "Sophia Rodriguez"],
    "description": "Scaffolded calculations and core identity recall.",
    "problems": ["Problem 1 with LaTeX", "Problem 2 with LaTeX", "Problem 3 with LaTeX"]
  },
  "tier2Intermediate": {
    "targetStudents": ["Maya Lin", "Aria Patel"],
    "description": "Multi-step applications and word problem modeling.",
    "problems": ["Problem 1 with LaTeX", "Problem 2 with LaTeX"]
  },
  "tier3Extension": {
    "targetStudents": ["Ethan Zhang"],
    "description": "Deep proofs and boundary condition analysis.",
    "problems": ["Problem 1 with LaTeX", "Problem 2 with LaTeX"]
  }
}`;

    if (AIProviderService.isLiveProviderActive()) {
      try {
        const rawJson = await AIProviderService.callChatCompletion(
          'You are an expert differentiated curriculum worksheet builder. Output valid JSON only.',
          [{ role: 'user', content: prompt }],
          { jsonMode: true }
        );
        const parsed = JSON.parse(rawJson);
        return {
          id: `ws_${Date.now()}`,
          createdAt: new Date().toISOString(),
          ...parsed
        };
      } catch (e) {
        console.warn('Worksheet live AI synthesis fallback:', e);
      }
    }

    return {
      id: `ws_${Date.now()}`,
      title: `Tiered Differentiation: ${topicTitle}`,
      subject,
      topicTitle,
      createdAt: new Date().toISOString(),
      tier1Foundational: {
        targetStudents: ['Lucas Vance', 'Sophia Rodriguez'],
        description: 'Scaffolded steps and foundational formula verification.',
        problems: [
          `State the fundamental definition and bounds for $${topicTitle}$.`,
          `Compute the step-by-step basic case when given parameters $a = 2, b = 5$.`,
          `Identify which theorem guarantees a solution and state its assumptions.`
        ]
      },
      tier2Intermediate: {
        targetStudents: ['Maya Lin', 'Aria Patel'],
        description: 'Multi-step analytical derivations and coordinate geometry.',
        problems: [
          `Given $f(x) = x^3 - 3x + 2$, find all critical points and classify their stability.`,
          `Set up the definite integral or matrix formulation to evaluate the enclosed volume.`
        ]
      },
      tier3Extension: {
        targetStudents: ['Ethan Zhang'],
        description: 'High-order proofs, eigenvalue bounds, and continuous limits.',
        problems: [
          `Prove that for any continuous function $f:[a,b] \\to \\mathbb{R}$, if $f(a)f(b) < 0$ there exists $c \\in (a,b)$ where $f(c) = 0$.`,
          `Generalize this theorem to $N$-dimensional Banach spaces.`
        ]
      }
    };
  }
};
