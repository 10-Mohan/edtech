import {
  AuthUser,
  CareerPath,
  ConceptNode,
  DiagnosticQuestion,
  DifferentiatedWorksheet,
  HomeworkProblem,
  ParentWeeklySummary,
  RecallCard,
  StudentClassroomMetric,
  StudentComprehensiveReport,
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

export const mockMathConceptNodes: ConceptNode[] = initialConceptNodes.filter(n => n.subject === 'math');
export const mockPhysicsConceptNodes: ConceptNode[] = initialConceptNodes.filter(n => n.subject === 'physics');


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
    parentName: 'Elena Lin',
    parentEmail: 'elena.lin@parent.waypoint.edu',
    studentEmail: 'maya.lin@student.waypoint.edu',
    streakDays: 8,
    xp: 420,
    level: 3,
    studyHoursWeekly: 4.5,
    attendanceRate: 96.8,
    topicScores: { alg_01: 95, func_01: 88, trig_01: 72, lim_01: 92, diff_01: 42, vec_01: 68 }
  },
  {
    studentId: 'st_02',
    studentName: 'Ethan Zhang',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 94,
    status: 'thriving',
    gapTopicsCount: 0,
    lastActive: '1 hour ago',
    parentName: 'Arthur Zhang',
    parentEmail: 'arthur.zhang@parent.waypoint.edu',
    studentEmail: 'ethan.zhang@student.waypoint.edu',
    streakDays: 19,
    xp: 890,
    level: 5,
    studyHoursWeekly: 6.2,
    attendanceRate: 99.1,
    topicScores: { alg_01: 98, func_01: 96, trig_01: 94, lim_01: 95, diff_01: 90, vec_01: 92 }
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
    parentName: 'Carlos Rodriguez',
    parentEmail: 'carlos.r@parent.waypoint.edu',
    studentEmail: 'sophia.r@student.waypoint.edu',
    streakDays: 4,
    xp: 260,
    level: 2,
    studyHoursWeekly: 2.8,
    attendanceRate: 91.5,
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
    parentName: 'Rebecca Vance',
    parentEmail: 'rebecca.vance@parent.waypoint.edu',
    studentEmail: 'lucas.vance@student.waypoint.edu',
    streakDays: 2,
    xp: 180,
    level: 1,
    studyHoursWeekly: 1.5,
    attendanceRate: 88.0,
    topicScores: { alg_01: 65, func_01: 48, trig_01: 38, lim_01: 40, diff_01: 28, vec_01: 42 }
  },
  {
    studentId: 'st_05',
    studentName: 'Aria Patel',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 91,
    status: 'thriving',
    gapTopicsCount: 0,
    lastActive: '25 mins ago',
    parentName: 'Dev Patel',
    parentEmail: 'dev.patel@parent.waypoint.edu',
    studentEmail: 'aria.patel@student.waypoint.edu',
    streakDays: 14,
    xp: 750,
    level: 4,
    studyHoursWeekly: 5.5,
    attendanceRate: 98.5,
    topicScores: { alg_01: 94, func_01: 92, trig_01: 88, lim_01: 91, diff_01: 86, vec_01: 94 }
  },
  {
    studentId: 'st_06',
    studentName: 'Leo Chen',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 82,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '45 mins ago',
    parentName: 'Wei Chen',
    parentEmail: 'wei.chen@parent.waypoint.edu',
    studentEmail: 'leo.chen@student.waypoint.edu',
    streakDays: 11,
    xp: 580,
    level: 3,
    studyHoursWeekly: 4.2,
    attendanceRate: 97.4,
    topicScores: { alg_01: 90, func_01: 85, trig_01: 82, lim_01: 88, diff_01: 68, vec_01: 80 }
  },
  {
    studentId: 'st_07',
    studentName: 'Liam Walker',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 76,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '2 hours ago',
    parentName: 'Sarah Walker',
    parentEmail: 'sarah.w@parent.waypoint.edu',
    studentEmail: 'liam.walker@student.waypoint.edu',
    streakDays: 7,
    xp: 430,
    level: 3,
    studyHoursWeekly: 3.9,
    attendanceRate: 95.8,
    topicScores: { alg_01: 88, func_01: 80, trig_01: 74, lim_01: 82, diff_01: 58, vec_01: 72 }
  },
  {
    studentId: 'st_08',
    studentName: 'Emma Wilson',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 80,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '3 hours ago',
    parentName: 'James Wilson',
    parentEmail: 'james.wilson@parent.waypoint.edu',
    studentEmail: 'emma.wilson@student.waypoint.edu',
    streakDays: 9,
    xp: 510,
    level: 3,
    studyHoursWeekly: 4.1,
    attendanceRate: 96.5,
    topicScores: { alg_01: 92, func_01: 86, trig_01: 78, lim_01: 84, diff_01: 64, vec_01: 78 }
  },
  {
    studentId: 'st_09',
    studentName: 'Noah Davis',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 59,
    status: 'needs_support',
    gapTopicsCount: 2,
    lastActive: 'Yesterday',
    parentName: 'Michelle Davis',
    parentEmail: 'michelle.d@parent.waypoint.edu',
    studentEmail: 'noah.davis@student.waypoint.edu',
    streakDays: 3,
    xp: 290,
    level: 2,
    studyHoursWeekly: 2.5,
    attendanceRate: 92.0,
    topicScores: { alg_01: 78, func_01: 68, trig_01: 55, lim_01: 62, diff_01: 38, vec_01: 48 }
  },
  {
    studentId: 'st_10',
    studentName: 'Olivia Martinez',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 92,
    status: 'thriving',
    gapTopicsCount: 0,
    lastActive: '20 mins ago',
    parentName: 'Javier Martinez',
    parentEmail: 'javier.m@parent.waypoint.edu',
    studentEmail: 'olivia.m@student.waypoint.edu',
    streakDays: 16,
    xp: 820,
    level: 5,
    studyHoursWeekly: 5.8,
    attendanceRate: 98.9,
    topicScores: { alg_01: 96, func_01: 94, trig_01: 90, lim_01: 92, diff_01: 88, vec_01: 92 }
  },
  {
    studentId: 'st_11',
    studentName: 'Marcus Vance',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 89,
    status: 'thriving',
    gapTopicsCount: 0,
    lastActive: '15 mins ago',
    parentName: 'Rebecca Vance',
    parentEmail: 'rebecca.vance@parent.waypoint.edu',
    studentEmail: 'marcus.v@student.waypoint.edu',
    streakDays: 12,
    xp: 690,
    level: 4,
    studyHoursWeekly: 4.9,
    attendanceRate: 97.8,
    topicScores: { alg_01: 95, func_01: 90, trig_01: 86, lim_01: 90, diff_01: 84, vec_01: 88 }
  },
  {
    studentId: 'st_12',
    studentName: 'Chloe Bennett',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 93,
    status: 'thriving',
    gapTopicsCount: 0,
    lastActive: '50 mins ago',
    parentName: 'Robert Bennett',
    parentEmail: 'robert.b@parent.waypoint.edu',
    studentEmail: 'chloe.b@student.waypoint.edu',
    streakDays: 18,
    xp: 860,
    level: 5,
    studyHoursWeekly: 6.0,
    attendanceRate: 99.0,
    topicScores: { alg_01: 98, func_01: 95, trig_01: 92, lim_01: 94, diff_01: 89, vec_01: 91 }
  },
  {
    studentId: 'st_13',
    studentName: 'Jordan Lee',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 38,
    status: 'at_risk',
    gapTopicsCount: 5,
    lastActive: '4 days ago',
    parentName: 'Sung Lee',
    parentEmail: 'sung.lee@parent.waypoint.edu',
    studentEmail: 'jordan.lee@student.waypoint.edu',
    streakDays: 1,
    xp: 130,
    level: 1,
    studyHoursWeekly: 1.1,
    attendanceRate: 85.2,
    topicScores: { alg_01: 45, func_01: 32, trig_01: 30, lim_01: 35, diff_01: 24, vec_01: 38 }
  },
  {
    studentId: 'st_14',
    studentName: 'Daniel Kim',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 88,
    status: 'thriving',
    gapTopicsCount: 0,
    lastActive: '1 hour ago',
    parentName: 'Min-Jun Kim',
    parentEmail: 'minjun.kim@parent.waypoint.edu',
    studentEmail: 'daniel.kim@student.waypoint.edu',
    streakDays: 13,
    xp: 680,
    level: 4,
    studyHoursWeekly: 4.8,
    attendanceRate: 98.1,
    topicScores: { alg_01: 94, func_01: 90, trig_01: 84, lim_01: 89, diff_01: 82, vec_01: 89 }
  },
  {
    studentId: 'st_15',
    studentName: 'Benjamin Scott',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 74,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '5 hours ago',
    parentName: 'Rachel Scott',
    parentEmail: 'rachel.scott@parent.waypoint.edu',
    studentEmail: 'benjamin.s@student.waypoint.edu',
    streakDays: 6,
    xp: 390,
    level: 2,
    studyHoursWeekly: 3.4,
    attendanceRate: 94.7,
    topicScores: { alg_01: 85, func_01: 78, trig_01: 70, lim_01: 80, diff_01: 52, vec_01: 70 }
  },
  {
    studentId: 'st_16',
    studentName: 'Harper Clark',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 79,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '30 mins ago',
    parentName: 'David Clark',
    parentEmail: 'david.clark@parent.waypoint.edu',
    studentEmail: 'harper.c@student.waypoint.edu',
    streakDays: 8,
    xp: 480,
    level: 3,
    studyHoursWeekly: 4.0,
    attendanceRate: 96.2,
    topicScores: { alg_01: 91, func_01: 84, trig_01: 76, lim_01: 85, diff_01: 62, vec_01: 77 }
  },
  {
    studentId: 'st_17',
    studentName: 'Zoe Cooper',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 62,
    status: 'needs_support',
    gapTopicsCount: 2,
    lastActive: 'Yesterday',
    parentName: 'Thomas Cooper',
    parentEmail: 'thomas.c@parent.waypoint.edu',
    studentEmail: 'zoe.cooper@student.waypoint.edu',
    streakDays: 4,
    xp: 310,
    level: 2,
    studyHoursWeekly: 2.6,
    attendanceRate: 93.1,
    topicScores: { alg_01: 82, func_01: 70, trig_01: 48, lim_01: 65, diff_01: 44, vec_01: 58 }
  },
  {
    studentId: 'st_18',
    studentName: 'Julian Chen',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 90,
    status: 'thriving',
    gapTopicsCount: 0,
    lastActive: '12 mins ago',
    parentName: 'Linda Chen',
    parentEmail: 'linda.chen@parent.waypoint.edu',
    studentEmail: 'julian.c@student.waypoint.edu',
    streakDays: 15,
    xp: 760,
    level: 4,
    studyHoursWeekly: 5.2,
    attendanceRate: 98.4,
    topicScores: { alg_01: 95, func_01: 92, trig_01: 86, lim_01: 91, diff_01: 85, vec_01: 90 }
  },
  {
    studentId: 'st_19',
    studentName: 'Grace Taylor',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 87,
    status: 'thriving',
    gapTopicsCount: 0,
    lastActive: '1 hour ago',
    parentName: 'Christopher Taylor',
    parentEmail: 'chris.t@parent.waypoint.edu',
    studentEmail: 'grace.t@student.waypoint.edu',
    streakDays: 11,
    xp: 670,
    level: 4,
    studyHoursWeekly: 4.7,
    attendanceRate: 97.9,
    topicScores: { alg_01: 92, func_01: 89, trig_01: 85, lim_01: 88, diff_01: 81, vec_01: 87 }
  },
  {
    studentId: 'st_20',
    studentName: 'Caleb Ward',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 42,
    status: 'at_risk',
    gapTopicsCount: 4,
    lastActive: '2 days ago',
    parentName: 'Patricia Ward',
    parentEmail: 'patricia.w@parent.waypoint.edu',
    studentEmail: 'caleb.ward@student.waypoint.edu',
    streakDays: 2,
    xp: 160,
    level: 1,
    studyHoursWeekly: 1.4,
    attendanceRate: 87.5,
    topicScores: { alg_01: 50, func_01: 38, trig_01: 35, lim_01: 38, diff_01: 22, vec_01: 36 }
  },
  {
    studentId: 'st_21',
    studentName: 'Mason Hall',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 72,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '6 hours ago',
    parentName: 'Brian Hall',
    parentEmail: 'brian.hall@parent.waypoint.edu',
    studentEmail: 'mason.hall@student.waypoint.edu',
    streakDays: 5,
    xp: 370,
    level: 2,
    studyHoursWeekly: 3.2,
    attendanceRate: 94.0,
    topicScores: { alg_01: 84, func_01: 76, trig_01: 68, lim_01: 78, diff_01: 50, vec_01: 68 }
  },
  {
    studentId: 'st_22',
    studentName: 'Evelyn Adams',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 81,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '40 mins ago',
    parentName: 'Jennifer Adams',
    parentEmail: 'jennifer.a@parent.waypoint.edu',
    studentEmail: 'evelyn.a@student.waypoint.edu',
    streakDays: 10,
    xp: 540,
    level: 3,
    studyHoursWeekly: 4.3,
    attendanceRate: 97.0,
    topicScores: { alg_01: 91, func_01: 85, trig_01: 80, lim_01: 86, diff_01: 66, vec_01: 79 }
  },
  {
    studentId: 'st_23',
    studentName: 'Alexander Wright',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 75,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '4 hours ago',
    parentName: 'Richard Wright',
    parentEmail: 'richard.w@parent.waypoint.edu',
    studentEmail: 'alex.wright@student.waypoint.edu',
    streakDays: 6,
    xp: 410,
    level: 3,
    studyHoursWeekly: 3.6,
    attendanceRate: 95.0,
    topicScores: { alg_01: 86, func_01: 79, trig_01: 72, lim_01: 81, diff_01: 54, vec_01: 71 }
  },
  {
    studentId: 'st_24',
    studentName: 'Elijah Reed',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 54,
    status: 'needs_support',
    gapTopicsCount: 3,
    lastActive: 'Yesterday',
    parentName: 'Karen Reed',
    parentEmail: 'karen.reed@parent.waypoint.edu',
    studentEmail: 'elijah.reed@student.waypoint.edu',
    streakDays: 3,
    xp: 250,
    level: 2,
    studyHoursWeekly: 2.2,
    attendanceRate: 90.8,
    topicScores: { alg_01: 76, func_01: 60, trig_01: 42, lim_01: 54, diff_01: 32, vec_01: 50 }
  },
  {
    studentId: 'st_25',
    studentName: 'Abigail Mitchell',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 77,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '1 hour ago',
    parentName: 'Matthew Mitchell',
    parentEmail: 'matthew.m@parent.waypoint.edu',
    studentEmail: 'abigail.m@student.waypoint.edu',
    streakDays: 7,
    xp: 450,
    level: 3,
    studyHoursWeekly: 3.8,
    attendanceRate: 96.0,
    topicScores: { alg_01: 89, func_01: 82, trig_01: 75, lim_01: 83, diff_01: 60, vec_01: 74 }
  },
  {
    studentId: 'st_26',
    studentName: 'Lucas Miller',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 83,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '35 mins ago',
    parentName: 'Laura Miller',
    parentEmail: 'laura.m@parent.waypoint.edu',
    studentEmail: 'lucas.m@student.waypoint.edu',
    streakDays: 10,
    xp: 570,
    level: 3,
    studyHoursWeekly: 4.4,
    attendanceRate: 97.2,
    topicScores: { alg_01: 92, func_01: 87, trig_01: 81, lim_01: 87, diff_01: 70, vec_01: 82 }
  },
  {
    studentId: 'st_27',
    studentName: 'Isaac Newton Lee',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 95,
    status: 'thriving',
    gapTopicsCount: 0,
    lastActive: '5 mins ago',
    parentName: 'Dr. H. Lee',
    parentEmail: 'h.lee@parent.waypoint.edu',
    studentEmail: 'isaac.lee@student.waypoint.edu',
    streakDays: 21,
    xp: 940,
    level: 6,
    studyHoursWeekly: 6.8,
    attendanceRate: 99.5,
    topicScores: { alg_01: 99, func_01: 98, trig_01: 95, lim_01: 97, diff_01: 93, vec_01: 94 }
  },
  {
    studentId: 'st_28',
    studentName: 'Emily Perez',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 73,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '3 hours ago',
    parentName: 'Hector Perez',
    parentEmail: 'hector.perez@parent.waypoint.edu',
    studentEmail: 'emily.perez@student.waypoint.edu',
    streakDays: 5,
    xp: 380,
    level: 2,
    studyHoursWeekly: 3.3,
    attendanceRate: 94.5,
    topicScores: { alg_01: 85, func_01: 77, trig_01: 69, lim_01: 79, diff_01: 53, vec_01: 69 }
  },
  {
    studentId: 'st_29',
    studentName: 'Mia Howard',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 66,
    status: 'needs_support',
    gapTopicsCount: 2,
    lastActive: 'Yesterday',
    parentName: 'Nancy Howard',
    parentEmail: 'nancy.howard@parent.waypoint.edu',
    studentEmail: 'mia.howard@student.waypoint.edu',
    streakDays: 4,
    xp: 340,
    level: 2,
    studyHoursWeekly: 2.9,
    attendanceRate: 93.8,
    topicScores: { alg_01: 84, func_01: 72, trig_01: 56, lim_01: 70, diff_01: 48, vec_01: 58 }
  },
  {
    studentId: 'st_30',
    studentName: 'Henry Evans',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 78,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '2 hours ago',
    parentName: 'George Evans',
    parentEmail: 'george.evans@parent.waypoint.edu',
    studentEmail: 'henry.evans@student.waypoint.edu',
    streakDays: 8,
    xp: 460,
    level: 3,
    studyHoursWeekly: 4.0,
    attendanceRate: 96.1,
    topicScores: { alg_01: 90, func_01: 83, trig_01: 76, lim_01: 84, diff_01: 61, vec_01: 76 }
  },
  {
    studentId: 'st_31',
    studentName: 'Ella Turner',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 84,
    status: 'on_track',
    gapTopicsCount: 0,
    lastActive: '30 mins ago',
    parentName: 'Stephanie Turner',
    parentEmail: 'stephanie.t@parent.waypoint.edu',
    studentEmail: 'ella.turner@student.waypoint.edu',
    streakDays: 11,
    xp: 610,
    level: 4,
    studyHoursWeekly: 4.6,
    attendanceRate: 97.6,
    topicScores: { alg_01: 93, func_01: 88, trig_01: 83, lim_01: 89, diff_01: 74, vec_01: 84 }
  },
  {
    studentId: 'st_32',
    studentName: 'Sophia Wang',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 89,
    status: 'thriving',
    gapTopicsCount: 0,
    lastActive: '15 mins ago',
    parentName: 'Victor Wang',
    parentEmail: 'victor.wang@parent.waypoint.edu',
    studentEmail: 'sophia.wang@student.waypoint.edu',
    streakDays: 13,
    xp: 710,
    level: 4,
    studyHoursWeekly: 5.0,
    attendanceRate: 98.2,
    topicScores: { alg_01: 95, func_01: 91, trig_01: 87, lim_01: 90, diff_01: 83, vec_01: 88 }
  },
  {
    studentId: 'st_33',
    studentName: 'Logan Cox',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 58,
    status: 'needs_support',
    gapTopicsCount: 3,
    lastActive: '2 days ago',
    parentName: 'Daniel Cox',
    parentEmail: 'daniel.cox@parent.waypoint.edu',
    studentEmail: 'logan.cox@student.waypoint.edu',
    streakDays: 3,
    xp: 270,
    level: 2,
    studyHoursWeekly: 2.3,
    attendanceRate: 91.2,
    topicScores: { alg_01: 78, func_01: 64, trig_01: 44, lim_01: 58, diff_01: 39, vec_01: 52 }
  },
  {
    studentId: 'st_34',
    studentName: 'Ava Brooks',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 46,
    status: 'at_risk',
    gapTopicsCount: 4,
    lastActive: '3 days ago',
    parentName: 'Melissa Brooks',
    parentEmail: 'melissa.b@parent.waypoint.edu',
    studentEmail: 'ava.brooks@student.waypoint.edu',
    streakDays: 2,
    xp: 190,
    level: 1,
    studyHoursWeekly: 1.6,
    attendanceRate: 88.5,
    topicScores: { alg_01: 66, func_01: 50, trig_01: 34, lim_01: 42, diff_01: 30, vec_01: 40 }
  },
  {
    studentId: 'st_35',
    studentName: 'Samuel Jackson',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 86,
    status: 'thriving',
    gapTopicsCount: 0,
    lastActive: '1 hour ago',
    parentName: 'Brenda Jackson',
    parentEmail: 'brenda.j@parent.waypoint.edu',
    studentEmail: 'samuel.j@student.waypoint.edu',
    streakDays: 12,
    xp: 660,
    level: 4,
    studyHoursWeekly: 4.8,
    attendanceRate: 97.7,
    topicScores: { alg_01: 94, func_01: 89, trig_01: 84, lim_01: 88, diff_01: 79, vec_01: 86 }
  },
  {
    studentId: 'st_36',
    studentName: 'Sebastian Diaz',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 71,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '5 hours ago',
    parentName: 'Antonio Diaz',
    parentEmail: 'antonio.diaz@parent.waypoint.edu',
    studentEmail: 'sebastian.d@student.waypoint.edu',
    streakDays: 5,
    xp: 360,
    level: 2,
    studyHoursWeekly: 3.1,
    attendanceRate: 93.9,
    topicScores: { alg_01: 83, func_01: 75, trig_01: 67, lim_01: 77, diff_01: 49, vec_01: 67 }
  },
  {
    studentId: 'st_37',
    studentName: 'Scarlett Parker',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 82,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '50 mins ago',
    parentName: 'Kimberly Parker',
    parentEmail: 'kimberly.p@parent.waypoint.edu',
    studentEmail: 'scarlett.p@student.waypoint.edu',
    streakDays: 9,
    xp: 550,
    level: 3,
    studyHoursWeekly: 4.3,
    attendanceRate: 97.1,
    topicScores: { alg_01: 91, func_01: 86, trig_01: 80, lim_01: 87, diff_01: 67, vec_01: 81 }
  },
  {
    studentId: 'st_38',
    studentName: 'Jack Collins',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 77,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '2 hours ago',
    parentName: 'Timothy Collins',
    parentEmail: 'tim.collins@parent.waypoint.edu',
    studentEmail: 'jack.collins@student.waypoint.edu',
    streakDays: 7,
    xp: 440,
    level: 3,
    studyHoursWeekly: 3.7,
    attendanceRate: 95.9,
    topicScores: { alg_01: 89, func_01: 81, trig_01: 74, lim_01: 83, diff_01: 59, vec_01: 73 }
  },
  {
    studentId: 'st_39',
    studentName: 'Rachel Green',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 91,
    status: 'thriving',
    gapTopicsCount: 0,
    lastActive: '18 mins ago',
    parentName: 'Cynthia Green',
    parentEmail: 'cynthia.g@parent.waypoint.edu',
    studentEmail: 'rachel.green@student.waypoint.edu',
    streakDays: 15,
    xp: 790,
    level: 4,
    studyHoursWeekly: 5.4,
    attendanceRate: 98.7,
    topicScores: { alg_01: 96, func_01: 93, trig_01: 89, lim_01: 92, diff_01: 86, vec_01: 91 }
  },
  {
    studentId: 'st_40',
    studentName: 'Lily Murphy',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    grade: '11th Grade',
    overallMastery: 79,
    status: 'on_track',
    gapTopicsCount: 1,
    lastActive: '1 hour ago',
    parentName: 'Andrew Murphy',
    parentEmail: 'andrew.murphy@parent.waypoint.edu',
    studentEmail: 'lily.murphy@student.waypoint.edu',
    streakDays: 8,
    xp: 490,
    level: 3,
    studyHoursWeekly: 4.1,
    attendanceRate: 96.4,
    topicScores: { alg_01: 91, func_01: 85, trig_01: 77, lim_01: 85, diff_01: 63, vec_01: 78 }
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

export const mockAuthUsers: AuthUser[] = [
  {
    id: 'stu_maya',
    email: 'maya.lin@student.waypoint.edu',
    name: 'Maya Lin',
    role: 'student',
    password: 'demo123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'Grade 11 AP Scholar'
  },
  {
    id: 'parent_elena',
    email: 'elena.lin@parent.waypoint.edu',
    name: 'Elena Lin',
    role: 'parent',
    password: 'demo123',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    title: 'Parent of Maya Lin',
    linkedStudentId: 'stu_maya'
  },
  {
    id: 'teach_vance',
    email: 'dr.vance@faculty.waypoint.edu',
    name: 'Dr. Eleanor Vance',
    role: 'teacher',
    password: 'demo123',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'AP STEM & Mathematics Department Head'
  }
];

export const mockStudentComprehensiveReport: StudentComprehensiveReport = {
  studentId: 'stu_maya',
  studentName: 'Maya Lin',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  grade: 'Grade 11 (AP Advanced STEM)',
  school: 'Oakwood Horizon STEM Academy',
  academicYear: '2025 - 2026 Academic Term',
  studentEmail: 'maya.lin@student.waypoint.edu',
  parentEmail: 'elena.lin@parent.waypoint.edu',
  parentName: 'Elena Lin',

  attendance: {
    overallRate: 96.8,
    presentDays: 48,
    totalDays: 50,
    excusedAbsences: 2,
    unexcusedAbsences: 0,
    tardies: 1,
    recentLog: [
      { date: 'Aug 05, 2026', status: 'present', subject: 'AP Calculus AB', note: 'Active participation in Socratic session' },
      { date: 'Aug 04, 2026', status: 'present', subject: 'AP Physics C: Mechanics', note: 'Completed lab on rotational inertia' },
      { date: 'Aug 03, 2026', status: 'tardy', subject: 'AP Computer Science A', note: 'Late by 5 mins (bus transit delay)' },
      { date: 'Aug 02, 2026', status: 'present', subject: 'AP Chemistry', note: 'Lab practical: Acid-base titration' },
      { date: 'Aug 01, 2026', status: 'present', subject: 'AP Calculus AB', note: 'Derivatives diagnostic completed' },
      { date: 'Jul 31, 2026', status: 'excused', subject: 'All Periods', note: 'Excused: Medical appointment' }
    ]
  },

  subjectBreakdown: [
    {
      subject: 'AP Calculus AB',
      score: 94,
      gradeLetter: 'A',
      rankInClass: 'Top 5%',
      strengths: [
        'Exceptional intuition for Limits and Epsilon-Delta definitions',
        'Strong graphical interpretation of tangent curves',
        'Consistent daily active recall practice on formula cards'
      ],
      weakSections: [
        'Composite Function Chain Rule (occasional internal derivative omission)',
        'Trig substitution in indefinite integrals'
      ],
      teacherName: 'Dr. Eleanor Vance',
      teacherRemarks: 'Maya exhibits tremendous curiosity. Once she cements the nested chain rule reflex, her mastery will be flawless.'
    },
    {
      subject: 'AP Computer Science A',
      score: 96,
      gradeLetter: 'A+',
      rankInClass: 'Top 3%',
      strengths: [
        'Recursion and tree traversal algorithms',
        'Clean object-oriented design and Java syntax',
        'Independent project on 2D physics simulation'
      ],
      weakSections: [
        '2D Matrix array boundary conditions in edge cases'
      ],
      teacherName: 'Prof. Marcus Brody',
      teacherRemarks: 'Maya is performing well ahead of the grade standard. Her analytical reasoning is outstanding.'
    },
    {
      subject: 'AP Physics C: Mechanics',
      score: 88,
      gradeLetter: 'A-',
      rankInClass: 'Top 12%',
      strengths: [
        'Kinematics, trajectory equations, and vector decomposition',
        'Newtonian conservation of momentum and energy'
      ],
      weakSections: [
        'Torque integration on non-uniform rods',
        'Rotational moment of inertia derivations'
      ],
      teacherName: 'Dr. Sarah Jenkins',
      teacherRemarks: 'Great problem-solving mindset. We are working together on multi-variable torque diagrams.'
    },
    {
      subject: 'AP Chemistry',
      score: 81,
      gradeLetter: 'B+',
      rankInClass: 'Top 25%',
      strengths: [
        'Atomic electron configurations and Periodic trends',
        'Thermodynamics and enthalpy cycle calculations'
      ],
      weakSections: [
        'Acid-Base buffer equilibrium and ICE tables',
        'Electrochemistry Nernst equation calculations'
      ],
      teacherName: 'Mr. David Kim',
      teacherRemarks: 'Good lab technique. With extra spaced repetition on equilibrium formulas, she will easily reach an A.'
    },
    {
      subject: 'AP Biology & Genetics',
      score: 89,
      gradeLetter: 'A-',
      rankInClass: 'Top 10%',
      strengths: [
        'Cellular respiration and ATP synthesis pathways',
        'DNA transcription, translation, and CRISPR mechanics'
      ],
      weakSections: [
        'Population genetics Hardy-Weinberg equilibrium problems'
      ],
      teacherName: 'Ms. Clara Thorne',
      teacherRemarks: 'Excellent conceptual grasp. Maya connects biological systems with computational modeling very naturally.'
    }
  ],

  weakAreasRadar: [
    {
      topic: 'Composite Chain Rule Derivatives',
      subject: 'AP Calculus AB',
      severity: 'critical',
      misconceptionSummary: 'Forgets to multiply by the inner derivative $g\'(x)$ when differentiating $f(g(x))$.',
      recommendedHomeAction: 'Prompt Maya to use the "box method" or "onion peeling" metaphor when tackling composite problems.'
    },
    {
      topic: 'Acid-Base Buffer Equilibrium (ICE Tables)',
      subject: 'AP Chemistry',
      severity: 'moderate',
      misconceptionSummary: 'Confuses initial concentrations with equilibrium concentrations in Henderson-Hasselbalch approximations.',
      recommendedHomeAction: 'Encourage 10 minutes on the Waypoint Chemistry Flashcard deck on equilibrium constants.'
    },
    {
      topic: 'Rotational Inertia on Non-Uniform Masses',
      subject: 'AP Physics C',
      severity: 'mild',
      misconceptionSummary: 'Sets up $dm = \\lambda dx$ correctly but forgets limits of integration around center of mass.',
      recommendedHomeAction: 'Ask Maya to show you how a figure skater spins faster by pulling in their arms.'
    }
  ],

  studyHabits: {
    weeklyFocusHours: 4.5,
    activeRecallStreakDays: 8,
    masteredCardsCount: 24,
    socraticSessionsCompleted: 7,
    completionRate: 96
  }
};

export const mockLeoStudentReport: StudentComprehensiveReport = {
  studentId: 'stu_leo',
  studentName: 'Leo Lin',
  avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
  grade: 'Grade 9 (STEM Foundations & Geometry)',
  school: 'Oakwood Horizon Junior High',
  academicYear: '2025 - 2026 Academic Term',
  studentEmail: 'leo.lin@student.waypoint.edu',
  parentEmail: 'elena.lin@parent.waypoint.edu',
  parentName: 'Elena Lin',

  attendance: {
    overallRate: 98.4,
    presentDays: 49,
    totalDays: 50,
    excusedAbsences: 1,
    unexcusedAbsences: 0,
    tardies: 0,
    recentLog: [
      { date: 'Aug 05, 2026', status: 'present', subject: 'Honors Geometry', note: 'Mastered circle theorem proofs' },
      { date: 'Aug 04, 2026', status: 'present', subject: 'Integrated Science', note: 'Lab on kinetic energy transformations' },
      { date: 'Aug 03, 2026', status: 'present', subject: 'Intro to Python', note: 'Built an interactive text adventure game' }
    ]
  },

  subjectBreakdown: [
    {
      subject: 'Honors Geometry & Trigonometry',
      score: 92,
      gradeLetter: 'A',
      rankInClass: 'Top 8%',
      strengths: [
        'Congruent triangle proofs and coordinate geometry',
        'Special right triangles and Pythagorean triples'
      ],
      weakSections: [
        '3D solid surface area vs volume conversions'
      ],
      teacherName: 'Ms. Rebecca Ross',
      teacherRemarks: 'Leo is doing great in geometric logic. Consistently participates and helps peers.'
    },
    {
      subject: 'Intro to Python & Algorithmic Thinking',
      score: 98,
      gradeLetter: 'A+',
      rankInClass: 'Top 1%',
      strengths: [
        'Loops, dictionaries, functions, and boolean logic',
        'Exceptional problem decomposition'
      ],
      weakSections: [],
      teacherName: 'Mr. David Lin',
      teacherRemarks: 'Leo is coding with university-level elegance. Highly recommended for advanced tracks.'
    }
  ],

  weakAreasRadar: [
    {
      topic: '3D Solid Surface Area vs Volume',
      subject: 'Honors Geometry',
      severity: 'moderate',
      misconceptionSummary: 'Confuses square unit scaling with cubic unit scaling during geometry proofs.',
      recommendedHomeAction: 'Have Leo calculate paint needed for a cardboard box vs how much sand it can hold.'
    }
  ],

  studyHabits: {
    weeklyFocusHours: 3.8,
    activeRecallStreakDays: 14,
    masteredCardsCount: 31,
    socraticSessionsCompleted: 9,
    completionRate: 99
  }
};

export function synthesizeReportFromMetric(metric: StudentClassroomMetric): StudentComprehensiveReport {
  const attendanceRate = metric.attendanceRate || 96.0;
  const presentDays = Math.round((attendanceRate / 100) * 50);
  const excused = Math.max(0, 50 - presentDays - (metric.status === 'at_risk' ? 2 : 1));
  const unexcused = 50 - presentDays - excused;

  // Derive weak areas from topic scores
  const weakAreas: StudentComprehensiveReport['weakAreasRadar'] = [];
  const scores = metric.topicScores || {};

  if ((scores.diff_01 ?? 100) < 75) {
    weakAreas.push({
      topic: 'Composite Chain Rule Derivatives',
      subject: 'AP Calculus AB',
      severity: (scores.diff_01 ?? 0) < 50 ? 'critical' : 'moderate',
      misconceptionSummary: 'Drops inner derivative g\'(x) during nested composite differentiation f(g(x)).',
      recommendedHomeAction: 'Prompt student to use the "onion peeling" or box method to decompose inner from outer functions.'
    });
  }

  if ((scores.trig_01 ?? 100) < 75) {
    weakAreas.push({
      topic: 'Trigonometric Identities & Equations',
      subject: 'Trigonometry & Precalc',
      severity: (scores.trig_01 ?? 0) < 50 ? 'critical' : 'moderate',
      misconceptionSummary: 'Confuses double-angle identities with compound angle addition formulas.',
      recommendedHomeAction: 'Encourage a quick 10-minute flashcard review on unit circle angles and identities.'
    });
  }

  if ((scores.lim_01 ?? 100) < 75) {
    weakAreas.push({
      topic: 'Limits & Continuity',
      subject: 'AP Calculus AB',
      severity: (scores.lim_01 ?? 0) < 50 ? 'critical' : 'moderate',
      misconceptionSummary: 'Struggles with one-sided vs two-sided limit evaluation at asymptotic discontinuities.',
      recommendedHomeAction: 'Trace left and right curve approaches on a piece of paper to verify limit convergence.'
    });
  }

  if ((scores.func_01 ?? 100) < 75) {
    weakAreas.push({
      topic: 'Function Transformations',
      subject: 'Algebra & Precalc',
      severity: (scores.func_01 ?? 0) < 50 ? 'critical' : 'moderate',
      misconceptionSummary: 'Reverses horizontal phase shifts f(x - c) versus f(x + c).',
      recommendedHomeAction: 'Explain why modifying the input variable directly moves the graph in the inverse direction.'
    });
  }

  if ((scores.vec_01 ?? 100) < 75) {
    weakAreas.push({
      topic: 'Vectors & 3D Geometry',
      subject: 'Physics & Precalc',
      severity: (scores.vec_01 ?? 0) < 50 ? 'critical' : 'moderate',
      misconceptionSummary: 'Confuses scalar dot product magnitude with orthogonal cross product normal vectors.',
      recommendedHomeAction: 'Ask student to demonstrate the right-hand rule for 3D torque and rotational vectors.'
    });
  }

  if (weakAreas.length === 0) {
    weakAreas.push({
      topic: 'Multivariable Calculus Extension',
      subject: 'AP Calculus BC',
      severity: 'mild',
      misconceptionSummary: 'Occasional algebraic simplifications in 3D partial derivatives.',
      recommendedHomeAction: 'Encourage tackling advanced challenge proofs on Waypoint extension worksheets.'
    });
  }

  const calcScore = Math.min(99, Math.max(40, Math.round(metric.overallMastery + ((scores.diff_01 || 70) - 70) * 0.2)));
  const csScore = Math.min(99, Math.max(50, Math.round(metric.overallMastery + 4)));
  const physScore = Math.min(99, Math.max(45, Math.round(metric.overallMastery - 2)));
  const chemScore = Math.min(99, Math.max(45, Math.round(metric.overallMastery - 5)));

  const getGrade = (s: number) => s >= 93 ? 'A+' : s >= 88 ? 'A' : s >= 82 ? 'A-' : s >= 78 ? 'B+' : s >= 72 ? 'B' : s >= 65 ? 'C+' : s >= 55 ? 'C' : 'D';
  const getRank = (s: number) => s >= 90 ? 'Top 5%' : s >= 80 ? 'Top 20%' : s >= 70 ? 'Top 45%' : s >= 60 ? 'Middle 50%' : 'Needs Intervention';

  return {
    studentId: metric.studentId,
    studentName: metric.studentName,
    avatar: metric.avatar,
    grade: metric.grade || '11th Grade (AP Advanced STEM)',
    school: 'Oakwood Horizon STEM Academy',
    academicYear: '2025 - 2026 Academic Term',
    studentEmail: metric.studentEmail || `${metric.studentName.toLowerCase().replace(/\s+/g, '.')}@student.waypoint.edu`,
    parentEmail: metric.parentEmail || `${(metric.parentName || 'parent').toLowerCase().replace(/\s+/g, '.')}@parent.waypoint.edu`,
    parentName: metric.parentName || 'Parent / Guardian',
    attendance: {
      overallRate: attendanceRate,
      presentDays: presentDays,
      totalDays: 50,
      excusedAbsences: excused,
      unexcusedAbsences: unexcused,
      tardies: metric.status === 'at_risk' ? 3 : metric.status === 'needs_support' ? 2 : 0,
      recentLog: [
        { date: 'Aug 05, 2026', status: 'present', subject: 'AP Calculus AB', note: 'Interactive Socratic recall session' },
        { date: 'Aug 04, 2026', status: 'present', subject: 'AP Physics C', note: 'Mechanics laboratory on rotational inertia' },
        { date: 'Aug 03, 2026', status: unexcused > 0 ? 'absent' : 'present', subject: 'AP Computer Science A', note: unexcused > 0 ? 'Unexcused absence' : 'Recursion module completed' },
        { date: 'Aug 02, 2026', status: 'present', subject: 'AP Chemistry', note: 'Acid-base buffer equilibrium check' },
        { date: 'Aug 01, 2026', status: 'present', subject: 'AP Calculus AB', note: 'Concept diagnostic quiz' }
      ]
    },
    subjectBreakdown: [
      {
        subject: 'AP Calculus AB',
        score: calcScore,
        gradeLetter: getGrade(calcScore),
        rankInClass: getRank(calcScore),
        strengths: calcScore >= 80 ? ['Limits and continuity proof structure', 'Analytical curve sketching'] : ['Basic polynomial differentiation'],
        weakSections: (scores.diff_01 ?? 75) < 75 ? ['Nested Chain Rule', 'Implicit differentiation'] : [],
        teacherName: 'Dr. Eleanor Vance',
        teacherRemarks: metric.status === 'thriving' 
          ? `${metric.studentName} is demonstrating university-level mastery and analytical rigor.`
          : metric.status === 'on_track'
          ? `${metric.studentName} has strong steady momentum. Focused revision on chain rule derivatives will solidify an A.`
          : `${metric.studentName} needs targeted scaffolded practice and 1-on-1 tutoring on core calculus definitions.`
      },
      {
        subject: 'AP Computer Science A',
        score: csScore,
        gradeLetter: getGrade(csScore),
        rankInClass: getRank(csScore),
        strengths: ['Algorithmic decomposition', 'Object-oriented data structures'],
        weakSections: csScore < 70 ? ['2D Array boundary iterations'] : [],
        teacherName: 'Prof. Marcus Brody',
        teacherRemarks: `${metric.studentName} is actively engaged in coding lab challenges.`
      },
      {
        subject: 'AP Physics C: Mechanics',
        score: physScore,
        gradeLetter: getGrade(physScore),
        rankInClass: getRank(physScore),
        strengths: ['Kinematics vector modeling', 'Energy conservation equations'],
        weakSections: physScore < 75 ? ['Rotational moment of inertia integrals'] : [],
        teacherName: 'Dr. Sarah Jenkins',
        teacherRemarks: `Good laboratory intuition. Extra practice on angular momentum recommended.`
      },
      {
        subject: 'AP Chemistry',
        score: chemScore,
        gradeLetter: getGrade(chemScore),
        rankInClass: getRank(chemScore),
        strengths: ['Atomic structure and periodic trends'],
        weakSections: chemScore < 75 ? ['Equilibrium ICE tables'] : [],
        teacherName: 'Mr. David Kim',
        teacherRemarks: `Steady progress in chemical stoichiometry.`
      }
    ],
    weakAreasRadar: weakAreas,
    studyHabits: {
      weeklyFocusHours: metric.studyHoursWeekly || (metric.overallMastery / 20),
      activeRecallStreakDays: metric.streakDays || 5,
      masteredCardsCount: Math.round(metric.overallMastery * 0.3),
      socraticSessionsCompleted: Math.round(metric.overallMastery / 12),
      completionRate: Math.min(100, Math.round(metric.overallMastery + 5))
    }
  };
}

export function generateParentSummaryForStudent(report: StudentComprehensiveReport): ParentWeeklySummary {
  const isHigh = report.subjectBreakdown[0].score >= 85;
  return {
    weekLabel: 'Week of Aug 1 - Aug 5, 2026',
    overallHealth: isHigh ? 'steady' : 'needs_attention',
    hoursLearned: report.studyHabits.weeklyFocusHours,
    masteryGainPercent: isHigh ? 14 : 8,
    cardsMasteredCount: report.studyHabits.masteredCardsCount,
    headlineSummary: `${report.studentName} has logged ${report.studyHabits.weeklyFocusHours} hours this week with an active ${report.studyHabits.activeRecallStreakDays}-day streak!`,
    celebrations: [
      `Maintained a ${report.attendance.overallRate}% classroom attendance rate.`,
      `Completed ${report.studyHabits.socraticSessionsCompleted} interactive Socratic AI sessions.`,
      `Mastered ${report.studyHabits.masteredCardsCount} active recall flashcards.`
    ],
    focusAreas: report.weakAreasRadar.slice(0, 2).map(w => ({
      subject: w.subject,
      topic: w.topic,
      homeActionTip: w.recommendedHomeAction
    })),
    dinnerTablePrompts: [
      {
        prompt: `"Hey ${report.studentName.split(' ')[0]}, tell me about what you discovered in ${report.subjectBreakdown[0].subject} this week!"`,
        context: `${report.studentName} spent time reviewing ${report.weakAreasRadar[0]?.topic || 'core STEM concepts'}.`,
        followUp: 'Ask them to explain how they broke down difficult problems in Socratic mode!'
      },
      {
        prompt: `"What was the most exciting thing you built or practiced on Waypoint today?"`,
        context: `${report.studentName} is on a ${report.studyHabits.activeRecallStreakDays}-day active learning streak.`,
        followUp: 'Celebrate their consistency and encourage keeping the streak going!'
      }
    ]
  };
}

// Build 40-student reports map dynamically
export const mockStudentReportsMap: Record<string, StudentComprehensiveReport> = {
  'stu_maya_01': mockStudentComprehensiveReport,
  'stu_maya': mockStudentComprehensiveReport,
  'stu_leo_02': mockLeoStudentReport,
  'stu_leo': mockLeoStudentReport
};

// Populate all 40 students into the report map
mockClassroomMetrics.forEach(metric => {
  if (!mockStudentReportsMap[metric.studentId]) {
    mockStudentReportsMap[metric.studentId] = synthesizeReportFromMetric(metric);
  }
  // Also map by name key for easy lookup
  const nameKey = `stu_${metric.studentName.toLowerCase().replace(/\s+/g, '_')}`;
  if (!mockStudentReportsMap[nameKey]) {
    mockStudentReportsMap[nameKey] = mockStudentReportsMap[metric.studentId];
  }
});

export const mockStudentReport = mockStudentReportsMap['st_01'] || mockStudentComprehensiveReport;
export const mockConceptNodes = initialConceptNodes;
export const mockRecallCards = initialRecallCards;
export const mockUserProfile = initialStudentProfile;

export function getComprehensiveReportForStudent(studentIdOrName: string): StudentComprehensiveReport {
  if (mockStudentReportsMap[studentIdOrName]) {
    return mockStudentReportsMap[studentIdOrName];
  }
  const matched = mockClassroomMetrics.find(m => 
    m.studentId.toLowerCase() === studentIdOrName.toLowerCase() || 
    m.studentName.toLowerCase() === studentIdOrName.toLowerCase()
  );
  if (matched) {
    return synthesizeReportFromMetric(matched);
  }
  return mockStudentComprehensiveReport;
}



