import {
  CareerPath,
  ConceptNode,
  DiagnosticQuestion,
  DifferentiatedWorksheet,
  HomeworkProblem,
  ParentWeeklySummary,
  RecallCard,
  StudentClassroomMetric,
  UserProfile
} from '../types';

export const initialStudentProfile: UserProfile = {
  id: 'usr_maya_01',
  name: 'Maya Lin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'student',
  grade: '11th Grade (AP STEM)',
  xp: 420,
  level: 3,
  streakDays: 8,
  dailyGoalMinutes: 30,
  completedMinutesToday: 18,
  cardsReviewedToday: 12
};

export const initialConceptNodes: ConceptNode[] = [
  {
    id: 'alg_01',
    title: 'Algebraic Polynomials',
    subject: 'math',
    category: 'Foundations',
    status: 'mastered',
    masteryScore: 95,
    prerequisites: [],
    x: 100,
    y: 200,
    description: 'Factoring, quadratic formulas, binomial expansions, and roots.',
    estimatedStudyMins: 20,
    keyTakeaways: ['Quadratic formula derivation', 'Vieta formulas for polynomial roots']
  },
  {
    id: 'func_01',
    title: 'Function Transformations',
    subject: 'math',
    category: 'Analysis',
    status: 'mastered',
    masteryScore: 88,
    prerequisites: ['alg_01'],
    x: 280,
    y: 120,
    description: 'Translations, reflections, stretch factors, and inverse mappings.',
    estimatedStudyMins: 25,
    keyTakeaways: ['Vertical vs horizontal phase shift rules', 'Bijective functions & inverses']
  },
  {
    id: 'trig_01',
    title: 'Trigonometric Identities',
    subject: 'math',
    category: 'Geometry & Trig',
    status: 'in_progress',
    masteryScore: 72,
    prerequisites: ['alg_01'],
    x: 280,
    y: 280,
    description: 'Unit circle geometry, double angle formulas, and oscillatory behavior.',
    estimatedStudyMins: 30,
    commonMisconception: 'Confusing $\\sin(2x)$ with $2\\sin(x)$.',
    keyTakeaways: ['Pythagorean trigonometric identities', 'Euler representation of oscillations']
  },
  {
    id: 'lim_01',
    title: 'Limits & Continuity',
    subject: 'math',
    category: 'Calculus Core',
    status: 'mastered',
    masteryScore: 92,
    prerequisites: ['func_01'],
    x: 480,
    y: 120,
    description: 'Epsilon-delta intuition, one-sided limits, asymptotes, and squeeze theorem.',
    estimatedStudyMins: 35,
    keyTakeaways: ['Definition of continuity at a point', 'L’Hôpital’s rule prerequisites']
  },
  {
    id: 'diff_01',
    title: 'Derivatives & Chain Rule',
    subject: 'math',
    category: 'Calculus Core',
    status: 'weak',
    masteryScore: 42,
    prerequisites: ['lim_01', 'trig_01'],
    x: 680,
    y: 200,
    description: 'Instantaneous rate of change, power rule, product/quotient, and composite chain rule.',
    estimatedStudyMins: 45,
    commonMisconception: 'Forgetting to multiply by the internal derivative during composite differentiation $\\frac{d}{dx}f(g(x))$.',
    keyTakeaways: ['Geometric meaning of tangent slope', 'Multi-layer chain rule step protocol']
  },
  {
    id: 'opt_01',
    title: 'Optimization & Related Rates',
    subject: 'math',
    category: 'Applied Calculus',
    status: 'locked',
    masteryScore: 0,
    prerequisites: ['diff_01'],
    x: 880,
    y: 120,
    description: 'Critical points, concavity, second derivative test, and real-world geometric extrema.',
    estimatedStudyMins: 40,
    keyTakeaways: ['Formulating constrained objective functions', 'Differentiating with respect to time $t$']
  },
  {
    id: 'int_01',
    title: 'Definite Integrals & FTC',
    subject: 'math',
    category: 'Integral Calculus',
    status: 'locked',
    masteryScore: 0,
    prerequisites: ['diff_01'],
    x: 880,
    y: 280,
    description: 'Riemann sums, Fundamental Theorem of Calculus, and area under curves.',
    estimatedStudyMins: 50,
    keyTakeaways: ['Accumulation function concept', 'U-substitution integration method']
  },
  {
    id: 'vec_01',
    title: 'Vector Spaces & Matrices',
    subject: 'math',
    category: 'Linear Algebra',
    status: 'in_progress',
    masteryScore: 68,
    prerequisites: ['alg_01'],
    x: 480,
    y: 360,
    description: 'Linear transformations, dot products, cross products, and matrix determinants.',
    estimatedStudyMins: 35,
    commonMisconception: 'Assuming matrix multiplication is commutative ($AB = BA$).',
    keyTakeaways: ['Basis change geometric representation', 'Determinant as area scaling factor']
  }
];

export const initialRecallCards: RecallCard[] = [
  {
    id: 'card_01',
    topicId: 'diff_01',
    subject: 'math',
    front: 'What is the derivative of $f(x) = \\sin(3x^2 + 1)$ with respect to $x$?',
    back: 'By the Chain Rule: $f\'(x) = \\cos(3x^2 + 1) \\cdot \\frac{d}{dx}(3x^2 + 1) = 6x \\cos(3x^2 + 1)$.',
    equation: '\\frac{d}{dx}[f(g(x))] = f\'(g(x)) \\cdot g\'(x)',
    hint: 'Differentiate the outer sine function first, then multiply by the derivative of the inside polynomial.',
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: new Date().toISOString(),
    status: 'learning'
  },
  {
    id: 'card_02',
    topicId: 'trig_01',
    subject: 'math',
    front: 'Express $\\cos(2\\theta)$ in terms of $\\sin(\\theta)$ only.',
    back: '$\\cos(2\\theta) = 1 - 2\\sin^2(\\theta)$',
    equation: '\\cos(2\\theta) = \\cos^2(\\theta) - \\sin^2(\\theta) = 1 - 2\\sin^2(\\theta)',
    hint: 'Use the Pythagorean identity $\\cos^2(\\theta) + \\sin^2(\\theta) = 1$.',
    intervalDays: 3,
    easeFactor: 2.6,
    repetitions: 2,
    nextReviewDate: new Date().toISOString(),
    status: 'review'
  },
  {
    id: 'card_03',
    topicId: 'lim_01',
    subject: 'math',
    front: 'Evaluate the limit: $\\lim_{x \\to 0} \\frac{\\sin(5x)}{x}$',
    back: '$\\lim_{x \\to 0} \\frac{\\sin(5x)}{x} = 5 \\cdot \\lim_{x \\to 0} \\frac{\\sin(5x)}{5x} = 5 \\cdot 1 = 5$.',
    hint: 'Recall the standard limit $\\lim_{u \\to 0} \\frac{\\sin(u)}{u} = 1$.',
    intervalDays: 7,
    easeFactor: 2.7,
    repetitions: 4,
    nextReviewDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    status: 'mastered'
  },
  {
    id: 'card_04',
    topicId: 'vec_01',
    subject: 'math',
    front: 'What does a matrix determinant equal to $0$ tell you about the linear transformation?',
    back: 'It squishes space into a lower dimension (e.g. 2D plane into a 1D line or point), meaning the matrix is non-invertible (singular).',
    intervalDays: 2,
    easeFactor: 2.5,
    repetitions: 1,
    nextReviewDate: new Date().toISOString(),
    status: 'learning'
  }
];

export const mockDiagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: 'diag_01',
    subject: 'math',
    topicId: 'diff_01',
    topicTitle: 'Composite Derivatives (Chain Rule)',
    question: 'If $y = e^{\\cos(2x)}$, what is $\\frac{dy}{dx}$?',
    equation: 'y = e^{\\cos(2x)}',
    options: [
      {
        id: 'opt_a',
        text: '-\\sin(2x) e^{\\cos(2x)}',
        isCorrect: false,
        misconceptionFeedback: 'Forgot the innermost derivative of $2x$, which gives a factor of 2.'
      },
      {
        id: 'opt_b',
        text: '-2\\sin(2x) e^{\\cos(2x)}',
        isCorrect: true
      },
      {
        id: 'opt_c',
        text: '\\cos(2x) e^{\\cos(2x) - 1}',
        isCorrect: false,
        misconceptionFeedback: 'Applied the power rule instead of the exponential derivative rule.'
      },
      {
        id: 'opt_d',
        text: '2\\cos(2x) e^{\\sin(2x)}',
        isCorrect: false,
        misconceptionFeedback: 'Incorrectly flipped sign and changed exponent term.'
      }
    ],
    hint: 'There are three nested functions: exponential $\\to$ cosine $\\to$ linear ($2x$).'
  },
  {
    id: 'diag_02',
    subject: 'math',
    topicId: 'trig_01',
    topicTitle: 'Trigonometric Transformations',
    question: 'What is the period of the function $g(t) = 4\\sin\\left(\\frac{\\pi t}{3} - \\frac{\\pi}{2}\\right)$?',
    options: [
      { id: 'opt_1', text: '3 seconds', isCorrect: false, misconceptionFeedback: 'Calculated $\\pi / \\omega$ instead of $2\\pi / \\omega$.' },
      { id: 'opt_2', text: '6 seconds', isCorrect: true },
      { id: 'opt_3', text: '$\\frac{2}{3}$ seconds', isCorrect: false, misconceptionFeedback: 'Multiplied frequencies rather than dividing period by angular frequency.' },
      { id: 'opt_4', text: '12 seconds', isCorrect: false, misconceptionFeedback: 'Confused amplitude with frequency divisor.' }
    ],
    hint: 'Period $T = \\frac{2\\pi}{\\omega}$ where $\\omega = \\frac{\\pi}{3}$.'
  },
  {
    id: 'diag_03',
    subject: 'math',
    topicId: 'vec_01',
    topicTitle: 'Matrix Inverses & Determinants',
    question: 'Under what condition does a $2 \\times 2$ matrix $M = \\begin{bmatrix} a & b \\\\ c & d \\end{bmatrix}$ have no inverse?',
    options: [
      { id: 'opt_m1', text: 'When $a + d = 0$', isCorrect: false, misconceptionFeedback: 'Confused zero trace with zero determinant.' },
      { id: 'opt_m2', text: 'When $ad - bc = 0$', isCorrect: true },
      { id: 'opt_m3', text: 'When $ab = cd$', isCorrect: false, misconceptionFeedback: 'Cross multiplication was set up incorrectly.' },
      { id: 'opt_m4', text: 'When $a = 0$ or $d = 0$', isCorrect: false, misconceptionFeedback: 'Matrices with zero diagonal elements can still be fully invertible.' }
    ],
    hint: 'Recall that matrix inverse requires dividing by $\\det(M) = ad - bc$.'
  }
];

export const mockHomeworkProblems: HomeworkProblem[] = [
  {
    id: 'hw_01',
    title: 'Differentiating $h(x) = (3x^2 - 5)^4$',
    subject: 'math',
    rawExpression: 'h(x) = (3x^2 - 5)^4',
    conceptTested: 'Chain Rule on Power Functions',
    remedialConceptId: 'diff_01',
    steps: [
      {
        stepNumber: 1,
        expression: 'Let u = 3x^2 - 5, so h(u) = u^4',
        explanation: 'Identify the inner function $u(x)$ and outer function $h(u)$.',
        isError: false
      },
      {
        stepNumber: 2,
        expression: 'h\'(u) = 4u^3 = 4(3x^2 - 5)^3',
        explanation: 'Differentiate outer function with respect to $u$.',
        isError: false
      },
      {
        stepNumber: 3,
        expression: 'h\'(x) = 4(3x^2 - 5)^3',
        explanation: 'Concluded differentiation here without multiplying by u\'(x).',
        isError: true,
        errorType: 'Omission of Inner Derivative (Chain Rule Failure)',
        correctionHint: 'You must multiply by $\\frac{du}{dx} = \\frac{d}{dx}(3x^2 - 5) = 6x$. Correct answer is $24x(3x^2 - 5)^3$.'
      }
    ]
  },
  {
    id: 'hw_02',
    title: 'Solving Trig Equation: $2\\sin^2(x) - 1 = 0$',
    subject: 'math',
    rawExpression: '2\\sin^2(x) - 1 = 0',
    conceptTested: 'Trig Algebraic Isolation',
    remedialConceptId: 'trig_01',
    steps: [
      {
        stepNumber: 1,
        expression: '2\\sin^2(x) = 1 \\implies \\sin^2(x) = 1/2',
        explanation: 'Isolate $\\sin^2(x)$.',
        isError: false
      },
      {
        stepNumber: 2,
        expression: '\\sin(x) = 1/\\sqrt{2} = \\sqrt{2}/2',
        explanation: 'Taking square root of both sides.',
        isError: true,
        errorType: 'Lost Negative Root ($\\pm$ omission)',
        correctionHint: 'Taking the square root gives $\\sin(x) = \\pm \\frac{\\sqrt{2}}{2}$, generating 4 quadrant solutions, not just 2!'
      }
    ]
  }
];

export const mockCareerPaths: CareerPath[] = [
  {
    id: 'career_game_engine',
    title: '3D Game Physics & Graphics Engine Dev',
    icon: 'Gamepad2',
    industry: 'Interactive Media & Simulation',
    matchScore: 94,
    avgSalary: '$142,000 / yr',
    growthRate: '+18% (High Demand)',
    description: 'Design real-time collision detection, ray-tracing illumination, and fluid dynamics engines powering Unreal/Unity.',
    connectedSyllabusTopics: [
      {
        topicId: 'vec_01',
        topicTitle: 'Vector Spaces & Matrices',
        howItIsUsed: 'Every 3D camera rotation and character bone animation is computed via $4\\times4$ homogeneous transformation matrices and quaternions.'
      },
      {
        topicId: 'diff_01',
        topicTitle: 'Derivatives & Kinematics',
        howItIsUsed: 'Verlet integration calculates velocity and acceleration vectors at 120 FPS for ragdoll physics.'
      }
    ],
    miniSimulation: {
      scenario: 'You are writing the physics loop for a vehicle jumping off a ramp in a racing game.',
      challengeQuestion: 'To calculate the vehicle’s angular acceleration during rotation, which mathematical operation is required?',
      options: [
        { id: 'c1', text: 'Second derivative of angular position with respect to time (\\alpha = d^2\\theta / dt^2)', isCorrect: true, feedback: 'Spot on! Angular acceleration is the 2nd time derivative of orientation.' },
        { id: 'c2', text: 'Matrix determinant of velocity', isCorrect: false, feedback: 'Determinant measures spatial scaling, not rotational acceleration.' },
        { id: 'c3', text: 'Single integral of position', isCorrect: false, feedback: 'Integration accumulates area, while acceleration requires differentiation.' }
      ]
    }
  },
  {
    id: 'career_biotech_ai',
    title: 'Computational Biology & Protein Folding AI',
    icon: 'Dna',
    industry: 'BioTech & Pharmaceuticals',
    matchScore: 89,
    avgSalary: '$158,000 / yr',
    growthRate: '+24% (Very High)',
    description: 'Use machine learning and energy landscape gradients to predict how amino acid chains fold into 3D drug targets.',
    connectedSyllabusTopics: [
      {
        topicId: 'opt_01',
        topicTitle: 'Optimization & Critical Points',
        howItIsUsed: 'Proteins naturally fold into minimum free energy states ($dG = 0$), modeled via multi-dimensional gradient descent.'
      },
      {
        topicId: 'trig_01',
        topicTitle: 'Trigonometric Torsion Angles',
        howItIsUsed: 'Ramachandran plots model phi ($\phi$) and psi ($\psi$) dihedral bond angles along the protein backbone.'
      }
    ],
    miniSimulation: {
      scenario: 'An AI model is searching for the lowest free-energy conformation of an antibody binding site.',
      challengeQuestion: 'At the stable folded state of minimum energy, what must the gradient vector $\\nabla E$ equal?',
      options: [
        { id: 'b1', text: '\\nabla E = \\vec{0} (Gradient is zero at local minima)', isCorrect: true, feedback: 'Correct! Zero gradient signifies the lowest stationary energy conformation.' },
        { id: 'b2', text: '\\nabla E = \\infty', isCorrect: false, feedback: 'Infinite gradient means unstable forces tearing the molecule apart.' },
        { id: 'b3', text: '\\nabla E = 1', isCorrect: false, feedback: 'A nonzero gradient produces a net force causing atoms to move.' }
      ]
    }
  },
  {
    id: 'career_robotics',
    title: 'Autonomous Robotics & Control Systems',
    icon: 'Bot',
    industry: 'Aerospace & Automation',
    matchScore: 86,
    avgSalary: '$138,000 / yr',
    growthRate: '+15%',
    description: 'Program PID controllers, Kalman filters, and inverse kinematics for robotic arms and self-driving drones.',
    connectedSyllabusTopics: [
      {
        topicId: 'diff_01',
        topicTitle: 'Derivatives & PID Controllers',
        howItIsUsed: 'The "D" in PID control calculates the instantaneous error derivative to prevent drones from overshooting target altitudes.'
      },
      {
        topicId: 'vec_01',
        topicTitle: 'Matrix Transformations',
        howItIsUsed: 'Forward kinematics maps joint angles to 3D gripper position in Cartesian coordinates.'
      }
    ],
    miniSimulation: {
      scenario: 'A drone hovering in high winds starts oscillating wildly around its target altitude.',
      challengeQuestion: 'Which control parameter in the derivative loop should be tuned to dampen the oscillations?',
      options: [
        { id: 'r1', text: 'Increase the Derivative gain (Kd) to resist sudden velocity changes', isCorrect: true, feedback: 'Exactly right. Derivative control acts like a virtual damper or shock absorber.' },
        { id: 'r2', text: 'Set integral gain to zero only', isCorrect: false, feedback: 'Integral gain eliminates steady-state bias, but derivative gain handles rapid damping.' }
      ]
    }
  }
];

export const mockClassroomMetrics: StudentClassroomMetric[] = [
  {
    studentId: 'st_01',
    studentName: 'Maya Lin',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 78,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '10 mins ago',
    topicScores: { alg_01: 95, func_01: 88, trig_01: 72, lim_01: 92, diff_01: 42, vec_01: 68 }
  },
  {
    studentId: 'st_02',
    studentName: 'Ethan Zhang',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 91,
    status: 'thriving',
    gapTopicsCount: 0,
    lastActive: '1 hour ago',
    topicScores: { alg_01: 98, func_01: 95, trig_01: 90, lim_01: 94, diff_01: 86, vec_01: 85 }
  },
  {
    studentId: 'st_03',
    studentName: 'Sophia Rodriguez',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 56,
    status: 'needs_support',
    gapTopicsCount: 3,
    lastActive: 'Yesterday',
    topicScores: { alg_01: 80, func_01: 62, trig_01: 45, lim_01: 58, diff_01: 35, vec_01: 55 }
  },
  {
    studentId: 'st_04',
    studentName: 'Lucas Vance',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 44,
    status: 'at_risk',
    gapTopicsCount: 4,
    lastActive: '3 days ago',
    topicScores: { alg_01: 65, func_01: 48, trig_01: 38, lim_01: 40, diff_01: 28, vec_01: 42 }
  },
  {
    studentId: 'st_05',
    studentName: 'Aria Patel',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 84,
    status: 'thriving',
    gapTopicsCount: 1,
    lastActive: '25 mins ago',
    topicScores: { alg_01: 92, func_01: 90, trig_01: 82, lim_01: 88, diff_01: 65, vec_01: 88 }
  }
];

export const mockWorksheets: DifferentiatedWorksheet[] = [
  {
    id: 'ws_01',
    title: 'Tiered Differentiation: Chain Rule Mastery',
    subject: 'math',
    topicTitle: 'Derivatives & Chain Rule',
    createdAt: '2026-08-04T10:00:00Z',
    tier1Foundational: {
      targetStudents: ['Lucas Vance', 'Sophia Rodriguez'],
      description: 'Scaffolded practice decomposing $u(x)$ step-by-step with guided hints.',
      problems: [
        'Decompose $y = (4x + 1)^3$. What is the inner function $u(x)$ and its derivative $u\'(x)$?',
        'Differentiate $f(x) = \\sin(5x)$ using the 2-step template $[\\text{outer derivative}] \\times [\\text{inner derivative}]$.',
        'Find $\\frac{dy}{dx}$ for $y = \\sqrt{2x^2 + 7}$.'
      ]
    },
    tier2Intermediate: {
      targetStudents: ['Maya Lin', 'Aria Patel'],
      description: 'Multi-layer composite functions with mixed trigonometric and exponential terms.',
      problems: [
        'Differentiate $g(x) = e^{\\tan(3x^2)}$.',
        'Calculate the equation of the tangent line to $y = (x^2 - 1)^4$ at $x = 2$.',
        'If $f(x) = \\ln(\\cos(x))$, evaluate $f\'(\\pi / 4)$.'
      ]
    },
    tier3Extension: {
      targetStudents: ['Ethan Zhang'],
      description: 'Proof-based and inverse function differentiation challenges.',
      problems: [
        'Derive the derivative formula for $y = \\arcsin(x)$ using implicit differentiation and the chain rule.',
        'Given $h(x) = f(g(k(x)))$ where all functions are differentiable, prove the triple chain rule formula.',
        'Find all local extrema for $f(x) = x^2 e^{-x^2}$.'
      ]
    }
  }
];

export const mockParentSummary: ParentWeeklySummary = {
  weekLabel: 'Week of Aug 1 - Aug 5, 2026',
  overallHealth: 'steady',
  hoursLearned: 3.8,
  masteryGainPercent: 12,
  cardsMasteredCount: 18,
  headlineSummary: 'Maya had a high-engagement week in STEM! She mastered 90%+ of Limits & Continuity concepts and maintained an active 8-day recall streak.',
  celebrations: [
    'Achieved Level 3 Scholar rank with 420 XP earned.',
    'Flawless diagnostic score in Limits and Function Transformations.',
    'Completed 18 recall cards ahead of schedule.'
  ],
  focusAreas: [
    {
      subject: 'AP Calculus',
      topic: 'Composite Chain Rule',
      homeActionTip: 'Ask Maya to explain what "peeling an onion" has to do with nested calculus functions.'
    },
    {
      subject: 'Trigonometry',
      topic: 'Double Angle Formulas',
      homeActionTip: 'Encourage a quick 10-minute flashcard review on the Waypoint mobile deck before bed.'
    }
  ],
  dinnerTablePrompts: [
    {
      prompt: '"Hey Maya, I heard in video game graphics they use matrix math to rotate 3D cameras. How does that connect to what you learned in vectors this week?"',
      context: 'Maya explored the 3D Game Physics career roadmap where matrices handle camera viewport transformations.',
      followUp: 'Ask her to show you how a $2\\times2$ matrix rotates a coordinate on paper!'
    },
    {
      prompt: '"What was the most surprising thing you taught the AI tutor in Feynman Mode today?"',
      context: 'Maya used the Feynman technique to teach the Socratic AI how continuous limits work.',
      followUp: 'Ask her if she can explain it to you using the car speedometer analogy.'
    }
  ]
};
