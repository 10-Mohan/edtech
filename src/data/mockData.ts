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
  id: 'usr_aarav_01',
  name: 'Aarav Sharma',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  role: 'student',
  grade: 'CSE Year 1 - Section A',
  xp: 420,
  level: 3,
  streakDays: 8,
  dailyGoalMinutes: 30,
  completedMinutesToday: 18,
  cardsReviewedToday: 12
};

export const initialConceptNodes: ConceptNode[] = [
  // 1. Engineering Mathematics
  {
    id: 'lim_01',
    title: 'Limits & Continuity',
    subject: 'math',
    category: 'Engineering Mathematics',
    status: 'mastered',
    masteryScore: 92,
    prerequisites: [],
    x: 80,
    y: 70,
    description: 'Epsilon-delta definitions, one-sided limits, squeeze theorem, and indeterminate forms (L’Hôpital’s Rule).',
    estimatedStudyMins: 30,
    keyTakeaways: ['L’Hôpital’s rule on 0/0 and inf/inf forms', 'Continuity criteria at boundary points']
  },
  {
    id: 'diff_01',
    title: 'Derivatives & Chain Rule',
    subject: 'math',
    category: 'Engineering Mathematics',
    status: 'weak',
    masteryScore: 42,
    prerequisites: ['lim_01'],
    x: 280,
    y: 70,
    description: 'Product, quotient, and composite chain rules with applications to engineering rate problems and tangent gradients.',
    estimatedStudyMins: 45,
    commonMisconception: 'Forgetting to multiply by the internal derivative during composite differentiation d/dx[f(g(x))].',
    keyTakeaways: ['Geometric interpretation of gradient vector', 'Multi-layer composite chain rule execution']
  },
  {
    id: 'int_01',
    title: 'Definite & Indefinite Integration',
    subject: 'math',
    category: 'Engineering Mathematics',
    status: 'in_progress',
    masteryScore: 68,
    prerequisites: ['diff_01'],
    x: 480,
    y: 70,
    description: 'Integration by parts, substitution, partial fractions, and the Fundamental Theorem of Calculus.',
    estimatedStudyMins: 40,
    keyTakeaways: ['Integration by parts formula: int u dv = uv - int v du', 'Improper integral convergence tests']
  },
  {
    id: 'diffeq_01',
    title: 'Differential Equations',
    subject: 'math',
    category: 'Engineering Mathematics',
    status: 'in_progress',
    masteryScore: 55,
    prerequisites: ['int_01'],
    x: 680,
    y: 70,
    description: 'First-order separable and linear ODEs, integrating factors, and second-order constant coefficient equations.',
    estimatedStudyMins: 50,
    commonMisconception: 'Forgetting the integrating factor e^(int P(x)dx) when solving dy/dx + P(x)y = Q(x).',
    keyTakeaways: ['Integrating factor method for 1st-order linear ODEs', 'Characteristic equations for harmonic oscillators']
  },
  {
    id: 'laplace_01',
    title: 'Laplace Transforms',
    subject: 'math',
    category: 'Engineering Mathematics',
    status: 'locked',
    masteryScore: 0,
    prerequisites: ['diffeq_01'],
    x: 880,
    y: 70,
    description: 'Transform properties, shifting theorems, convolution, and solving initial value problems in circuit/control analysis.',
    estimatedStudyMins: 50,
    keyTakeaways: ['Mapping time-domain differential equations into s-domain algebraic equations', 'Inverse Laplace via partial fractions']
  },

  // 2. Data Structures
  {
    id: 'ds_arr_01',
    title: 'Arrays & Dynamic Sizing',
    subject: 'cs',
    category: 'Data Structures',
    status: 'mastered',
    masteryScore: 95,
    prerequisites: [],
    x: 80,
    y: 170,
    description: 'Contiguous memory allocation, O(1) random indexing, dynamic array amortized analysis, and 2D row-major addressing.',
    estimatedStudyMins: 25,
    keyTakeaways: ['Memory pointer arithmetic and cache locality', 'Amortized O(1) doubling strategy for dynamic arrays']
  },
  {
    id: 'ds_ll_01',
    title: 'Linked Lists & Node Pointers',
    subject: 'cs',
    category: 'Data Structures',
    status: 'mastered',
    masteryScore: 88,
    prerequisites: ['ds_arr_01'],
    x: 280,
    y: 170,
    description: 'Singly, doubly, and circular linked lists with pointer manipulation, dynamic insertion, and deletion.',
    estimatedStudyMins: 35,
    keyTakeaways: ['Pointer reassignment order during insertion', 'Memory overhead of node pointers vs contiguous arrays']
  },
  {
    id: 'ds_sq_01',
    title: 'Stacks and Queues',
    subject: 'cs',
    category: 'Data Structures',
    status: 'in_progress',
    masteryScore: 74,
    prerequisites: ['ds_ll_01'],
    x: 480,
    y: 170,
    description: 'LIFO and FIFO data structures, array-based circular buffers, stack evaluation of postfix expressions, and BFS/DFS foundations.',
    estimatedStudyMins: 30,
    commonMisconception: 'Modulo wrap-around index errors when implementing circular queue enqueue operations (rear = (rear + 1) % MAX).',
    keyTakeaways: ['Call-stack mechanics during recursive execution', 'Circular queue pointer wrap-around math']
  },
  {
    id: 'ds_tree_01',
    title: 'Trees & Binary Search Trees',
    subject: 'cs',
    category: 'Data Structures',
    status: 'in_progress',
    masteryScore: 60,
    prerequisites: ['ds_sq_01'],
    x: 680,
    y: 170,
    description: 'Hierarchical node representations, binary trees, BST invariant properties, in-order traversals, and balance factors.',
    estimatedStudyMins: 45,
    commonMisconception: 'Assuming that in-order traversal of any binary tree is sorted (only guaranteed for Binary Search Trees).',
    keyTakeaways: ['BST search complexity O(log n) average vs O(n) worst case', 'Recursive traversal: pre-order, in-order, post-order']
  },
  {
    id: 'ds_graph_01',
    title: 'Graphs & Traversal Algorithms',
    subject: 'cs',
    category: 'Data Structures',
    status: 'locked',
    masteryScore: 0,
    prerequisites: ['ds_tree_01'],
    x: 880,
    y: 170,
    description: 'Adjacency list and matrix representations, Breadth-First Search (BFS), Depth-First Search (DFS), and cycle detection.',
    estimatedStudyMins: 50,
    keyTakeaways: ['Space complexity of adjacency list O(V + E) vs matrix O(V^2)', 'Queue-based BFS for unweighted shortest paths']
  },

  // 3. Physics
  {
    id: 'phy_kin_01',
    title: 'Kinematics & Vector Motion',
    subject: 'physics',
    category: 'Engineering Physics',
    status: 'mastered',
    masteryScore: 90,
    prerequisites: [],
    x: 80,
    y: 270,
    description: '1D/2D particle motion, projectile trajectories, position-velocity-acceleration calculus, and relative reference frames.',
    estimatedStudyMins: 30,
    keyTakeaways: ['Constant acceleration kinematic formulas', 'Independence of orthogonal x and y velocity components']
  },
  {
    id: 'phy_newt_01',
    title: 'Newton’s Laws of Motion',
    subject: 'physics',
    category: 'Engineering Physics',
    status: 'mastered',
    masteryScore: 85,
    prerequisites: ['phy_kin_01'],
    x: 280,
    y: 270,
    description: 'Free-body diagrams, static/kinetic friction, centripetal forces, and Newton’s second law F = dp/dt = ma.',
    estimatedStudyMins: 35,
    keyTakeaways: ['Rigorous free-body diagram isolation', 'Centripetal acceleration a_c = v^2 / r']
  },
  {
    id: 'phy_eng_01',
    title: 'Work and Energy',
    subject: 'physics',
    category: 'Engineering Physics',
    status: 'in_progress',
    masteryScore: 78,
    prerequisites: ['phy_newt_01'],
    x: 480,
    y: 270,
    description: 'Work-energy theorem, conservative vs non-conservative forces, gravitational/spring potential energy, and mechanical conservation.',
    estimatedStudyMins: 35,
    keyTakeaways: ['Work as line integral of force dot displacement', 'Conservation of total mechanical energy E = K + U']
  },
  {
    id: 'phy_osc_01',
    title: 'Oscillations & SHM',
    subject: 'physics',
    category: 'Engineering Physics',
    status: 'in_progress',
    masteryScore: 65,
    prerequisites: ['phy_eng_01'],
    x: 680,
    y: 270,
    description: 'Simple harmonic motion differential equation d^2x/dt^2 + omega^2 x = 0, mass-spring systems, and damped/forced resonators.',
    estimatedStudyMins: 40,
    commonMisconception: 'Confusing angular frequency omega (rad/s) with cyclic frequency f (Hz): omega = 2*pi*f.',
    keyTakeaways: ['Harmonic motion solution x(t) = A cos(omega t + phi)', 'Resonance conditions in physical oscillators']
  },
  {
    id: 'phy_wave_01',
    title: 'Waves & Superposition',
    subject: 'physics',
    category: 'Engineering Physics',
    status: 'locked',
    masteryScore: 0,
    prerequisites: ['phy_osc_01'],
    x: 880,
    y: 270,
    description: 'Wave equation, transverse/longitudinal waves, boundary reflections, interference, standing waves, and Doppler shift.',
    estimatedStudyMins: 45,
    keyTakeaways: ['Wave speed equation v = f * lambda', 'Constructive vs destructive interference phase conditions']
  },

  // 4. Basic Electronics
  {
    id: 'elec_ohm_01',
    title: 'Ohm’s Law & Resistive Networks',
    subject: 'physics',
    category: 'Basic Electronics',
    status: 'mastered',
    masteryScore: 94,
    prerequisites: [],
    x: 80,
    y: 370,
    description: 'Current density, conductivity, resistance, series/parallel combinations, and power dissipation P = V*I = I^2*R.',
    estimatedStudyMins: 25,
    keyTakeaways: ['Ohmic conductor linear V-I relationship', 'Voltage divider and current divider rules']
  },
  {
    id: 'elec_kcl_01',
    title: 'Kirchhoff’s Laws',
    subject: 'physics',
    category: 'Basic Electronics',
    status: 'mastered',
    masteryScore: 82,
    prerequisites: ['elec_ohm_01'],
    x: 280,
    y: 370,
    description: 'Kirchhoff’s Current Law (conservation of charge) and Voltage Law (conservation of energy) for nodal and mesh analysis.',
    estimatedStudyMins: 35,
    keyTakeaways: ['Nodal analysis using sum of node currents = 0', 'Mesh analysis loop voltage polarities']
  },
  {
    id: 'elec_diode_01',
    title: 'Diodes & Rectification',
    subject: 'physics',
    category: 'Basic Electronics',
    status: 'in_progress',
    masteryScore: 70,
    prerequisites: ['elec_kcl_01'],
    x: 480,
    y: 370,
    description: 'PN junction physics, forward/reverse bias, Shockley equation, Zener breakdown, half-wave, and bridge rectifiers.',
    estimatedStudyMins: 40,
    keyTakeaways: ['Silicon diode 0.7V forward threshold drop', 'Full-wave bridge rectifier ripple factor and filtering']
  },
  {
    id: 'elec_trans_01',
    title: 'Transistors (BJT & MOSFET)',
    subject: 'physics',
    category: 'Basic Electronics',
    status: 'in_progress',
    masteryScore: 58,
    prerequisites: ['elec_diode_01'],
    x: 680,
    y: 370,
    description: 'BJT operation modes (cutoff, active, saturation), current gain beta, DC biasing, and MOSFET channel conduction.',
    estimatedStudyMins: 45,
    commonMisconception: 'Assuming a BJT is in linear amplification mode without verifying that V_CE > V_CE(sat) ~ 0.2V.',
    keyTakeaways: ['BJT current relation I_C = beta * I_B in active region', 'Transistor as a solid-state digital switch vs analog amplifier']
  },
  {
    id: 'elec_opamp_01',
    title: 'Operational Amplifiers (Op-Amps)',
    subject: 'physics',
    category: 'Basic Electronics',
    status: 'locked',
    masteryScore: 0,
    prerequisites: ['elec_trans_01'],
    x: 880,
    y: 370,
    description: 'Ideal op-amp characteristics, virtual ground, inverting and non-inverting amplifiers, summing amplifiers, and integrators.',
    estimatedStudyMins: 45,
    keyTakeaways: ['Golden op-amp rules: zero input currents and virtual short', 'Closed-loop inverting gain A_v = -R_f / R_in']
  }
];

export const mockMathConceptNodes: ConceptNode[] = initialConceptNodes.filter(n => n.subject === 'math');
export const mockPhysicsConceptNodes: ConceptNode[] = initialConceptNodes.filter(n => n.subject === 'physics');
export const mockCsConceptNodes: ConceptNode[] = initialConceptNodes.filter(n => n.subject === 'cs');


export const initialRecallCards: RecallCard[] = [
  // Engineering Mathematics
  {
    id: 'card_math_01',
    topicId: 'lim_01',
    subject: 'math',
    front: 'Evaluate the standard engineering limit: $\\lim_{x \\to 0} \\frac{\\sin(5x)}{x}$',
    back: '$\\lim_{x \\to 0} \\frac{\\sin(5x)}{x} = 5 \\cdot \\lim_{x \\to 0} \\frac{\\sin(5x)}{5x} = 5 \\cdot 1 = 5$.',
    equation: '\\lim_{u \\to 0} \\frac{\\sin(u)}{u} = 1',
    hint: 'Multiply numerator and denominator by 5 to match the sinusoidal argument.',
    intervalDays: 7,
    easeFactor: 2.7,
    repetitions: 4,
    nextReviewDate: new Date(Date.now() + 86400000 * 4).toISOString(),
    status: 'mastered'
  },
  {
    id: 'card_math_02',
    topicId: 'diff_01',
    subject: 'math',
    front: 'What is the derivative of $f(x) = e^{-3x^2}$ with respect to $x$?',
    back: 'By the Chain Rule: $f\'(x) = e^{-3x^2} \\cdot \\frac{d}{dx}(-3x^2) = -6x e^{-3x^2}$.',
    equation: '\\frac{d}{dx}[e^{u(x)}] = e^{u(x)} \\cdot u\'(x)',
    hint: 'Differentiate the outer exponential first, then multiply by the derivative of $-3x^2$.',
    intervalDays: 1,
    easeFactor: 2.5,
    repetitions: 0,
    nextReviewDate: new Date().toISOString(),
    status: 'learning'
  },
  {
    id: 'card_math_03',
    topicId: 'int_01',
    subject: 'math',
    front: 'State the Integration by Parts formula derived from the product rule.',
    back: '$\\int u \\, dv = uv - \\int v \\, du$',
    equation: '\\int u \\frac{dv}{dx} dx = uv - \\int v \\frac{du}{dx} dx',
    hint: 'Follow the LIATE mnemonic rule to select $u$ (Logarithmic, Inverse trig, Algebraic, Trigonometric, Exponential).',
    intervalDays: 3,
    easeFactor: 2.6,
    repetitions: 2,
    nextReviewDate: new Date().toISOString(),
    status: 'review'
  },

  // Data Structures
  {
    id: 'card_ds_01',
    topicId: 'ds_arr_01',
    subject: 'cs',
    front: 'What is the time complexity of accessing element $A[i]$ in a contiguous 1D array?',
    back: '$O(1)$ worst and average case, because memory address is calculated in constant time: $\\text{Address} = \\text{Base} + i \\times \\text{size}$.',
    equation: '\\text{Address}(A[i]) = \\text{BaseAddress} + i \\cdot \\text{sizeof}(T)',
    hint: 'No traversal is needed; pointer arithmetic jumps directly to the memory offset.',
    intervalDays: 5,
    easeFactor: 2.6,
    repetitions: 3,
    nextReviewDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'mastered'
  },
  {
    id: 'card_ds_02',
    topicId: 'ds_ll_01',
    subject: 'cs',
    front: 'Why is inserting at the head of a Singly Linked List $O(1)$, while inserting at the tail is $O(n)$ without a tail pointer?',
    back: 'Head insertion only updates `newNode.next = head` and `head = newNode`. Without a tail reference, finding the end requires traversing all $n$ nodes.',
    hint: 'Consider whether you have direct reference to the target insertion node.',
    intervalDays: 2,
    easeFactor: 2.5,
    repetitions: 1,
    nextReviewDate: new Date().toISOString(),
    status: 'learning'
  },
  {
    id: 'card_ds_03',
    topicId: 'ds_sq_01',
    subject: 'cs',
    front: 'In an array-based Circular Queue of capacity $N$, what formula advances the `rear` pointer?',
    back: '$\\text{rear} = (\\text{rear} + 1) \\pmod N$',
    equation: '\\text{rear}_{\\text{new}} = (\\text{rear}_{\\text{old}} + 1) \\% N',
    hint: 'Use the modulo operator to wrap back to index 0 when the boundary is reached.',
    intervalDays: 3,
    easeFactor: 2.5,
    repetitions: 2,
    nextReviewDate: new Date().toISOString(),
    status: 'review'
  },

  // Physics
  {
    id: 'card_phy_01',
    topicId: 'phy_kin_01',
    subject: 'physics',
    front: 'State the kinematic relation between final velocity $v$, initial velocity $u$, uniform acceleration $a$, and displacement $s$.',
    back: '$v^2 = u^2 + 2as$',
    equation: 'v^2 = u^2 + 2as',
    hint: 'Obtained by eliminating time $t$ from $v = u + at$ and $s = ut + \\frac{1}{2}at^2$.',
    intervalDays: 6,
    easeFactor: 2.7,
    repetitions: 3,
    nextReviewDate: new Date(Date.now() + 86400000 * 3).toISOString(),
    status: 'mastered'
  },
  {
    id: 'card_phy_02',
    topicId: 'phy_newt_01',
    subject: 'physics',
    front: 'What is Newton’s Second Law in general differential form for variable momentum?',
    back: '$\\vec{F}_{\\text{net}} = \\frac{d\\vec{p}}{dt}$. If mass $m$ is constant, this simplifies to $\\vec{F} = m\\vec{a}$.',
    equation: '\\vec{F}_{\\text{net}} = \\frac{d(m\\vec{v})}{dt} = m\\frac{d\\vec{v}}{dt} + \\vec{v}\\frac{dm}{dt}',
    hint: 'Force is the time rate of change of linear momentum.',
    intervalDays: 2,
    easeFactor: 2.5,
    repetitions: 1,
    nextReviewDate: new Date().toISOString(),
    status: 'learning'
  },
  {
    id: 'card_phy_03',
    topicId: 'phy_eng_01',
    subject: 'physics',
    front: 'State the Work-Energy Theorem for a particle of mass $m$.',
    back: 'The net work done by all forces equals the change in kinetic energy: $W_{\\text{net}} = \\Delta K = \\frac{1}{2}mv_f^2 - \\frac{1}{2}mv_i^2$.',
    equation: 'W_{\\text{net}} = \\int_{x_i}^{x_f} F_{\\text{net}} \\, dx = \\Delta K',
    hint: 'Integrate $F = m \\frac{dv}{dt}$ with respect to displacement $dx$.',
    intervalDays: 4,
    easeFactor: 2.6,
    repetitions: 2,
    nextReviewDate: new Date().toISOString(),
    status: 'review'
  },

  // Basic Electronics
  {
    id: 'card_elec_01',
    topicId: 'elec_ohm_01',
    subject: 'physics',
    front: 'State Ohm’s Law in microscopic (point) form relating current density $\\vec{J}$ and electric field $\\vec{E}$.',
    back: '$\\vec{J} = \\sigma \\vec{E}$, where $\\sigma$ is electrical conductivity ($1/\\rho$).',
    equation: '\\vec{J} = \\sigma \\vec{E} = \\frac{1}{\\rho}\\vec{E}',
    hint: 'Microscopic form relates current per unit area to the local driving electric field.',
    intervalDays: 5,
    easeFactor: 2.6,
    repetitions: 3,
    nextReviewDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    status: 'mastered'
  },
  {
    id: 'card_elec_02',
    topicId: 'elec_kcl_01',
    subject: 'physics',
    front: 'What physical conservation law is Kirchhoff’s Current Law (KCL) based upon?',
    back: 'Conservation of electric charge: $\\sum I_{\\text{in}} = \\sum I_{\\text{out}}$ at any circuit node with no charge accumulation.',
    equation: '\\sum_{k=1}^n I_k = 0',
    hint: 'Charge cannot build up indefinitely at an infinitesimal node.',
    intervalDays: 2,
    easeFactor: 2.5,
    repetitions: 1,
    nextReviewDate: new Date().toISOString(),
    status: 'learning'
  },
  {
    id: 'card_elec_03',
    topicId: 'elec_trans_01',
    subject: 'physics',
    front: 'In an NPN Bipolar Junction Transistor (BJT) active mode, how are $I_C$, $I_B$, and $I_E$ related?',
    back: '$I_C = \\beta I_B$ and $I_E = I_C + I_B = (1 + \\beta)I_B$, where $\\beta$ is the common-emitter DC current gain.',
    equation: 'I_C = \\beta I_B, \\quad I_E = (\\beta + 1)I_B',
    hint: 'Emitter current equals the sum of base current and collector current by KCL.',
    intervalDays: 3,
    easeFactor: 2.5,
    repetitions: 2,
    nextReviewDate: new Date().toISOString(),
    status: 'review'
  }
];

export const mockDiagnosticQuestions: DiagnosticQuestion[] = [
  {
    id: 'diag_01',
    subject: 'math',
    topicId: 'diff_01',
    topicTitle: 'Composite Derivatives (Chain Rule)',
    question: 'If $y = e^{\\cos(2x)}$, what is the derivative $\\frac{dy}{dx}$?',
    equation: 'y = e^{\\cos(2x)}',
    options: [
      {
        id: 'opt_a',
        text: '-\\sin(2x) e^{\\cos(2x)}',
        isCorrect: false,
        misconceptionFeedback: 'Forgot the innermost derivative of $2x$, which gives an essential factor of 2.'
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
        misconceptionFeedback: 'Applied algebraic power rule instead of the exponential derivative identity.'
      },
      {
        id: 'opt_d',
        text: '2\\cos(2x) e^{\\sin(2x)}',
        isCorrect: false,
        misconceptionFeedback: 'Incorrectly swapped trigonometric functions and exponent sign.'
      }
    ],
    hint: 'Apply three layers: exponential derivative -> cosine derivative -> internal linear rate ($2x$).'
  },
  {
    id: 'diag_02',
    subject: 'cs',
    topicId: 'ds_sq_01',
    topicTitle: 'Circular Queue Index Arithmetic',
    question: 'In an array-based Circular Queue with capacity $N = 8$, if `rear` is currently at index 7, what is the next `rear` index after one enqueue operation?',
    equation: '\\text{rear}_{\\text{next}} = (\\text{rear} + 1) \\% N',
    options: [
      { id: 'opt_1', text: 'Index 8', isCorrect: false, misconceptionFeedback: 'Index 8 causes an Out-of-Bounds array exception because valid indices are 0 to 7.' },
      { id: 'opt_2', text: 'Index 0', isCorrect: true },
      { id: 'opt_3', text: 'Index 1', isCorrect: false, misconceptionFeedback: 'Skipped index 0 during wrap-around.' },
      { id: 'opt_4', text: 'Index -1', isCorrect: false, misconceptionFeedback: 'Queue pointers are positive non-negative indices.' }
    ],
    hint: 'Evaluate $(7 + 1) \\pmod 8 = 8 \\pmod 8 = 0$.'
  },
  {
    id: 'diag_03',
    subject: 'physics',
    topicId: 'elec_kcl_01',
    topicTitle: 'Kirchhoff’s Current Law (KCL)',
    question: 'At a circuit junction, three branches enter carrying currents $I_1 = 3\\text{ A}$, $I_2 = 4\\text{ A}$, and $I_3 = 2\\text{ A}$. A single fourth branch leaves the node. What must its outgoing current $I_4$ be?',
    equation: '\\sum I_{\\text{in}} = \\sum I_{\\text{out}}',
    options: [
      { id: 'opt_m1', text: '5 A', isCorrect: false, misconceptionFeedback: 'Subtracted branch currents rather than summing entering streams.' },
      { id: 'opt_m2', text: '9 A', isCorrect: true },
      { id: 'opt_m3', text: '1 A', isCorrect: false, misconceptionFeedback: 'Incorrect polarity convention applied at junction.' },
      { id: 'opt_m4', text: '12 A', isCorrect: false, misconceptionFeedback: 'Multiplied current values instead of applying nodal summation.' }
    ],
    hint: 'By conservation of charge, total entering current equals total leaving current: $3 + 4 + 2 = I_4$.'
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
    id: 'career_swe',
    title: 'Software Engineer',
    icon: 'Code',
    industry: 'Systems & Enterprise Software',
    matchScore: 96,
    avgSalary: '₹18,00,000 / yr',
    growthRate: '+24% (Very High)',
    description: 'Design high-performance distributed systems, scalable cloud microservices, and optimize core data structure access latency.',
    connectedSyllabusTopics: [
      {
        topicId: 'ds_arr_01',
        topicTitle: 'Arrays & Dynamic Sizing',
        howItIsUsed: 'Cache-friendly contiguous array traversals minimize CPU cache misses in high-throughput backend services.'
      },
      {
        topicId: 'ds_tree_01',
        topicTitle: 'Trees & Binary Search Trees',
        howItIsUsed: 'Database indices (B-Trees and LSM-Trees) rely on hierarchical tree branching for logarithmic lookups.'
      }
    ],
    miniSimulation: {
      scenario: 'You are architecting a caching layer for a high-concurrency microservice handling 100,000 requests per second.',
      challengeQuestion: 'Which data structure allows O(1) average lookup and O(1) eviction for a Least-Recently-Used (LRU) cache?',
      options: [
        { id: 'swe_1', text: 'Doubly Linked List combined with a Hash Map', isCorrect: true, feedback: 'Perfect! Hash Map gives O(1) key access while Doubly Linked List allows O(1) node detachment and head promotion.' },
        { id: 'swe_2', text: 'Single sorted array with binary search', isCorrect: false, feedback: 'Binary search is O(log n) lookup and array element shifting takes O(n).' },
        { id: 'swe_3', text: 'Binary Search Tree', isCorrect: false, feedback: 'BST operations take O(log n) time, which is too slow for sub-millisecond LRU eviction.' }
      ]
    }
  },
  {
    id: 'career_embedded',
    title: 'Embedded Systems Engineer',
    icon: 'Cpu',
    industry: 'Automotive, Robotics & IoT',
    matchScore: 91,
    avgSalary: '₹15,00,000 / yr',
    growthRate: '+18% (High Demand)',
    description: 'Program bare-metal microcontrollers, real-time operating systems (RTOS), and interface low-level hardware sensors via I2C/SPI.',
    connectedSyllabusTopics: [
      {
        topicId: 'elec_kcl_01',
        topicTitle: 'Kirchhoff’s Laws',
        howItIsUsed: 'Power rail budgeting and sensor input voltage divider networks depend on KCL and KVL nodal analysis.'
      },
      {
        topicId: 'ds_sq_01',
        topicTitle: 'Stacks and Queues',
        howItIsUsed: 'Interrupt Service Routines (ISRs) utilize circular ring buffers (queues) for asynchronous UART packet receipt.'
      }
    ],
    miniSimulation: {
      scenario: 'An automotive MCU receives rapid sensor pulses via a GPIO interrupt pin in high-temperature engine control.',
      challengeQuestion: 'To prevent data corruption without blocking the main CPU loop, which queue architecture is used?',
      options: [
        { id: 'emb_1', text: 'Lock-free circular ring buffer with atomic head/tail pointers', isCorrect: true, feedback: 'Correct! Circular buffers prevent dynamic allocation overhead and allow safe lock-free ISR writes.' },
        { id: 'emb_2', text: 'Dynamically reallocated vector with malloc', isCorrect: false, feedback: 'Dynamic memory allocation in ISRs causes non-deterministic latency and heap fragmentation.' },
        { id: 'emb_3', text: 'Recursively traversed linked list', isCorrect: false, feedback: 'Linked list dynamic pointers can cause stack overflows and slow pointer chases.' }
      ]
    }
  },
  {
    id: 'career_data_science',
    title: 'Data Scientist',
    icon: 'BarChart3',
    industry: 'Machine Learning & Predictive Analytics',
    matchScore: 93,
    avgSalary: '₹19,00,000 / yr',
    growthRate: '+28% (Top Growth)',
    description: 'Develop predictive statistical models, deep neural network training pipelines, and loss function optimization algorithms.',
    connectedSyllabusTopics: [
      {
        topicId: 'diff_01',
        topicTitle: 'Derivatives & Chain Rule',
        howItIsUsed: 'Backpropagation in deep neural networks is the multi-variable application of the composite chain rule computing gradients dL/dw.'
      },
      {
        topicId: 'lim_01',
        topicTitle: 'Limits & Continuity',
        howItIsUsed: 'Gradient descent convergence proofs and continuous activation functions rely on asymptotic limit behavior.'
      }
    ],
    miniSimulation: {
      scenario: 'You are training a 50-layer deep neural network and observe gradients shrinking to near zero during backpropagation.',
      challengeQuestion: 'What calculus phenomenon is causing this "vanishing gradient" problem?',
      options: [
        { id: 'ds_1', text: 'Repeated multiplication of small fractional inner derivatives through the chain rule', isCorrect: true, feedback: 'Spot on! By the chain rule, multiplying many terms < 1 causes exponential gradient decay toward zero.' },
        { id: 'ds_2', text: 'Matrix determinants becoming infinite', isCorrect: false, feedback: 'Vanishing gradients describe underflow toward zero, not unbounded explosion.' },
        { id: 'ds_3', text: 'Discontinuous jump limits at output neurons', isCorrect: false, feedback: 'Modern activation functions like ReLU/GELU are piecewise continuous.' }
      ]
    }
  },
  {
    id: 'career_vlsi',
    title: 'VLSI Design Engineer',
    icon: 'CircuitBoard',
    industry: 'Semiconductor & ASIC Hardware',
    matchScore: 89,
    avgSalary: '₹22,00,000 / yr',
    growthRate: '+20% (Booming Industry)',
    description: 'Design sub-3nm silicon architectures, CMOS logic gates, FPGA accelerators, and verify timing closure on multi-billion transistor SoCs.',
    connectedSyllabusTopics: [
      {
        topicId: 'elec_trans_01',
        topicTitle: 'Transistors (BJT & MOSFET)',
        howItIsUsed: 'CMOS logic gates are built from complementary pull-up PMOS and pull-down NMOS transistor networks.'
      },
      {
        topicId: 'elec_ohm_01',
        topicTitle: 'Ohm’s Law & Resistive Networks',
        howItIsUsed: 'Parasitic RC wire delays (Elmore delay model) dictate maximum clock frequency on silicon dies.'
      }
    ],
    miniSimulation: {
      scenario: 'You are designing a high-speed CMOS inverter gate for a smartphone AI processor.',
      challengeQuestion: 'Why is static DC power consumption virtually zero in a steady-state CMOS inverter?',
      options: [
        { id: 'vlsi_1', text: 'One of the complementary transistors (NMOS or PMOS) is always turned OFF in steady state', isCorrect: true, feedback: 'Exactly! Either the pull-up or pull-down path is open, so no direct current path exists from Vdd to ground.' },
        { id: 'vlsi_2', text: 'Transistors have zero electrical resistance', isCorrect: false, feedback: 'Semiconductor channels always possess finite on-resistance.' },
        { id: 'vlsi_3', text: 'Threshold voltages are negative for both devices', isCorrect: false, feedback: 'Enhancement-mode MOSFETs require positive gate-source voltage for NMOS and negative for PMOS.' }
      ]
    }
  }
];

export const mockClassroomMetrics: StudentClassroomMetric[] = [
  {
    studentId: 'st_01',
    studentName: 'Aarav Sharma',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 78,
    status: 'on_track',
    trend: 'stable',
    activeTier: 2,
    gapTopicsCount: 1,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Aarav)',
    parentEmail: 'aarav.sharma.mentor@waypoint.edu',
    studentEmail: 'aarav.sharma@student.waypoint.edu',
    streakDays: 8,
    xp: 420,
    level: 3,
    studyHoursWeekly: 4.5,
    attendanceRate: 96.8,
    topicScores: { lim_01: 84, diff_01: 76, int_01: 70, ds_arr_01: 82, ds_ll_01: 76, elec_ohm_01: 73 }
  },
  {
    studentId: 'st_02',
    studentName: 'Rohan Iyer',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 82,
    status: 'on_track',
    trend: 'improving',
    activeTier: 2,
    gapTopicsCount: 1,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Rohan)',
    parentEmail: 'rohan.iyer.mentor@waypoint.edu',
    studentEmail: 'rohan.iyer@student.waypoint.edu',
    streakDays: 12,
    xp: 510,
    level: 3,
    studyHoursWeekly: 5.2,
    attendanceRate: 98,
    topicScores: { lim_01: 88, diff_01: 87, int_01: 74, ds_arr_01: 86, ds_ll_01: 80, elec_ohm_01: 77 }
  },
  {
    studentId: 'st_03',
    studentName: 'Priya Patel',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 64,
    status: 'needs_support',
    trend: 'stable',
    activeTier: 1,
    gapTopicsCount: 3,
    lastActive: '1 day ago',
    parentName: 'Mentor (Priya)',
    parentEmail: 'priya.patel.mentor@waypoint.edu',
    studentEmail: 'priya.patel@student.waypoint.edu',
    streakDays: 4,
    xp: 310,
    level: 2,
    studyHoursWeekly: 3.5,
    attendanceRate: 92.5,
    topicScores: { lim_01: 70, diff_01: 62, int_01: 56, ds_arr_01: 68, ds_ll_01: 62, elec_ohm_01: 59 }
  },
  {
    studentId: 'st_04',
    studentName: 'Arjun Nair',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 36,
    status: 'at_risk',
    trend: 'declining',
    activeTier: 1,
    gapTopicsCount: 5,
    lastActive: '3 days ago',
    parentName: 'Mentor (Arjun)',
    parentEmail: 'arjun.nair.mentor@waypoint.edu',
    studentEmail: 'arjun.nair@student.waypoint.edu',
    streakDays: 1,
    xp: 140,
    level: 1,
    studyHoursWeekly: 1.8,
    attendanceRate: 78.4,
    topicScores: { lim_01: 42, diff_01: 25, int_01: 30, ds_arr_01: 40, ds_ll_01: 34, elec_ohm_01: 31 }
  },
  {
    studentId: 'st_05',
    studentName: 'Ananya Deshmukh',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 91,
    status: 'thriving',
    trend: 'improving',
    activeTier: 3,
    gapTopicsCount: 0,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Ananya)',
    parentEmail: 'ananya.deshmukh.mentor@waypoint.edu',
    studentEmail: 'ananya.deshmukh@student.waypoint.edu',
    streakDays: 15,
    xp: 780,
    level: 4,
    studyHoursWeekly: 6.5,
    attendanceRate: 99.2,
    topicScores: { lim_01: 97, diff_01: 96, int_01: 83, ds_arr_01: 95, ds_ll_01: 89, elec_ohm_01: 86 }
  },
  {
    studentId: 'st_06',
    studentName: 'Vikram Malhotra',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 88,
    status: 'thriving',
    trend: 'stable',
    activeTier: 3,
    gapTopicsCount: 0,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Vikram)',
    parentEmail: 'vikram.malhotra.mentor@waypoint.edu',
    studentEmail: 'vikram.malhotra@student.waypoint.edu',
    streakDays: 11,
    xp: 640,
    level: 4,
    studyHoursWeekly: 5.8,
    attendanceRate: 97.5,
    topicScores: { lim_01: 94, diff_01: 86, int_01: 80, ds_arr_01: 92, ds_ll_01: 86, elec_ohm_01: 83 }
  },
  {
    studentId: 'st_07',
    studentName: 'Sneha Kulkarni',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 73,
    status: 'on_track',
    trend: 'improving',
    activeTier: 2,
    gapTopicsCount: 2,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Sneha)',
    parentEmail: 'sneha.kulkarni.mentor@waypoint.edu',
    studentEmail: 'sneha.kulkarni@student.waypoint.edu',
    streakDays: 7,
    xp: 390,
    level: 3,
    studyHoursWeekly: 4.2,
    attendanceRate: 95,
    topicScores: { lim_01: 79, diff_01: 78, int_01: 65, ds_arr_01: 77, ds_ll_01: 71, elec_ohm_01: 68 }
  },
  {
    studentId: 'st_08',
    studentName: 'Aditya Verma',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 76,
    status: 'on_track',
    trend: 'stable',
    activeTier: 2,
    gapTopicsCount: 2,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Aditya)',
    parentEmail: 'aditya.verma.mentor@waypoint.edu',
    studentEmail: 'aditya.verma@student.waypoint.edu',
    streakDays: 6,
    xp: 410,
    level: 3,
    studyHoursWeekly: 4,
    attendanceRate: 94.6,
    topicScores: { lim_01: 82, diff_01: 74, int_01: 68, ds_arr_01: 80, ds_ll_01: 74, elec_ohm_01: 71 }
  },
  {
    studentId: 'st_09',
    studentName: 'Neha Gupta',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 34,
    status: 'at_risk',
    trend: 'declining',
    activeTier: 1,
    gapTopicsCount: 6,
    lastActive: '3 days ago',
    parentName: 'Mentor (Neha)',
    parentEmail: 'neha.gupta.mentor@waypoint.edu',
    studentEmail: 'neha.gupta@student.waypoint.edu',
    streakDays: 2,
    xp: 120,
    level: 1,
    studyHoursWeekly: 1.5,
    attendanceRate: 76,
    topicScores: { lim_01: 40, diff_01: 25, int_01: 30, ds_arr_01: 38, ds_ll_01: 32, elec_ohm_01: 29 }
  },
  {
    studentId: 'st_10',
    studentName: 'Siddharth Rao',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 92,
    status: 'thriving',
    trend: 'improving',
    activeTier: 3,
    gapTopicsCount: 0,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Siddharth)',
    parentEmail: 'siddharth.rao.mentor@waypoint.edu',
    studentEmail: 'siddharth.rao@student.waypoint.edu',
    streakDays: 14,
    xp: 820,
    level: 4,
    studyHoursWeekly: 7,
    attendanceRate: 98.5,
    topicScores: { lim_01: 98, diff_01: 97, int_01: 84, ds_arr_01: 96, ds_ll_01: 90, elec_ohm_01: 87 }
  },
  {
    studentId: 'st_11',
    studentName: 'Ishaan Joshi',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 89,
    status: 'thriving',
    trend: 'stable',
    activeTier: 3,
    gapTopicsCount: 0,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Ishaan)',
    parentEmail: 'ishaan.joshi.mentor@waypoint.edu',
    studentEmail: 'ishaan.joshi@student.waypoint.edu',
    streakDays: 10,
    xp: 690,
    level: 4,
    studyHoursWeekly: 5.5,
    attendanceRate: 97,
    topicScores: { lim_01: 95, diff_01: 87, int_01: 81, ds_arr_01: 93, ds_ll_01: 87, elec_ohm_01: 84 }
  },
  {
    studentId: 'st_12',
    studentName: 'Kavya Reddy',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 94,
    status: 'thriving',
    trend: 'improving',
    activeTier: 3,
    gapTopicsCount: 0,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Kavya)',
    parentEmail: 'kavya.reddy.mentor@waypoint.edu',
    studentEmail: 'kavya.reddy@student.waypoint.edu',
    streakDays: 18,
    xp: 910,
    level: 4,
    studyHoursWeekly: 7.5,
    attendanceRate: 100,
    topicScores: { lim_01: 99, diff_01: 98, int_01: 86, ds_arr_01: 98, ds_ll_01: 92, elec_ohm_01: 89 }
  },
  {
    studentId: 'st_13',
    studentName: 'Rahul Mehra',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 31,
    status: 'at_risk',
    trend: 'declining',
    activeTier: 1,
    gapTopicsCount: 7,
    lastActive: '3 days ago',
    parentName: 'Mentor (Rahul)',
    parentEmail: 'rahul.mehra.mentor@waypoint.edu',
    studentEmail: 'rahul.mehra@student.waypoint.edu',
    streakDays: 0,
    xp: 90,
    level: 1,
    studyHoursWeekly: 1.2,
    attendanceRate: 72.5,
    topicScores: { lim_01: 37, diff_01: 25, int_01: 30, ds_arr_01: 35, ds_ll_01: 29, elec_ohm_01: 26 }
  },
  {
    studentId: 'st_14',
    studentName: 'Pooja Hegde',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 86,
    status: 'thriving',
    trend: 'stable',
    activeTier: 3,
    gapTopicsCount: 1,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Pooja)',
    parentEmail: 'pooja.hegde.mentor@waypoint.edu',
    studentEmail: 'pooja.hegde@student.waypoint.edu',
    streakDays: 9,
    xp: 620,
    level: 4,
    studyHoursWeekly: 5,
    attendanceRate: 96,
    topicScores: { lim_01: 92, diff_01: 84, int_01: 78, ds_arr_01: 90, ds_ll_01: 84, elec_ohm_01: 81 }
  },
  {
    studentId: 'st_15',
    studentName: 'Abhinav Menon',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 74,
    status: 'on_track',
    trend: 'stable',
    activeTier: 2,
    gapTopicsCount: 2,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Abhinav)',
    parentEmail: 'abhinav.menon.mentor@waypoint.edu',
    studentEmail: 'abhinav.menon@student.waypoint.edu',
    streakDays: 6,
    xp: 380,
    level: 3,
    studyHoursWeekly: 3.9,
    attendanceRate: 94,
    topicScores: { lim_01: 80, diff_01: 72, int_01: 66, ds_arr_01: 78, ds_ll_01: 72, elec_ohm_01: 69 }
  },
  {
    studentId: 'st_16',
    studentName: 'Riya Sen',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 79,
    status: 'on_track',
    trend: 'improving',
    activeTier: 2,
    gapTopicsCount: 1,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Riya)',
    parentEmail: 'riya.sen.mentor@waypoint.edu',
    studentEmail: 'riya.sen@student.waypoint.edu',
    streakDays: 8,
    xp: 460,
    level: 3,
    studyHoursWeekly: 4.6,
    attendanceRate: 96.5,
    topicScores: { lim_01: 85, diff_01: 84, int_01: 71, ds_arr_01: 83, ds_ll_01: 77, elec_ohm_01: 74 }
  },
  {
    studentId: 'st_17',
    studentName: 'Tanvi Bhat',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 62,
    status: 'needs_support',
    trend: 'stable',
    activeTier: 1,
    gapTopicsCount: 3,
    lastActive: '1 day ago',
    parentName: 'Mentor (Tanvi)',
    parentEmail: 'tanvi.bhat.mentor@waypoint.edu',
    studentEmail: 'tanvi.bhat@student.waypoint.edu',
    streakDays: 3,
    xp: 290,
    level: 2,
    studyHoursWeekly: 3.2,
    attendanceRate: 91,
    topicScores: { lim_01: 68, diff_01: 60, int_01: 54, ds_arr_01: 66, ds_ll_01: 60, elec_ohm_01: 57 }
  },
  {
    studentId: 'st_18',
    studentName: 'Harshvardhan Jain',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 90,
    status: 'thriving',
    trend: 'improving',
    activeTier: 3,
    gapTopicsCount: 0,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Harshvardhan)',
    parentEmail: 'harshvardhan.jain.mentor@waypoint.edu',
    studentEmail: 'harshvardhan.jain@student.waypoint.edu',
    streakDays: 13,
    xp: 750,
    level: 4,
    studyHoursWeekly: 6.2,
    attendanceRate: 98,
    topicScores: { lim_01: 96, diff_01: 95, int_01: 82, ds_arr_01: 94, ds_ll_01: 88, elec_ohm_01: 85 }
  },
  {
    studentId: 'st_19',
    studentName: 'Meera Nambiar',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 87,
    status: 'thriving',
    trend: 'stable',
    activeTier: 3,
    gapTopicsCount: 1,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Meera)',
    parentEmail: 'meera.nambiar.mentor@waypoint.edu',
    studentEmail: 'meera.nambiar@student.waypoint.edu',
    streakDays: 11,
    xp: 670,
    level: 4,
    studyHoursWeekly: 5.4,
    attendanceRate: 97.2,
    topicScores: { lim_01: 93, diff_01: 85, int_01: 79, ds_arr_01: 91, ds_ll_01: 85, elec_ohm_01: 82 }
  },
  {
    studentId: 'st_20',
    studentName: 'Varun Pillai',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 38,
    status: 'at_risk',
    trend: 'declining',
    activeTier: 1,
    gapTopicsCount: 5,
    lastActive: '3 days ago',
    parentName: 'Mentor (Varun)',
    parentEmail: 'varun.pillai.mentor@waypoint.edu',
    studentEmail: 'varun.pillai@student.waypoint.edu',
    streakDays: 1,
    xp: 150,
    level: 1,
    studyHoursWeekly: 2,
    attendanceRate: 80,
    topicScores: { lim_01: 44, diff_01: 25, int_01: 30, ds_arr_01: 42, ds_ll_01: 36, elec_ohm_01: 33 }
  },
  {
    studentId: 'st_21',
    studentName: 'Divya Sundaram',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 81,
    status: 'on_track',
    trend: 'stable',
    activeTier: 2,
    gapTopicsCount: 1,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Divya)',
    parentEmail: 'divya.sundaram.mentor@waypoint.edu',
    studentEmail: 'divya.sundaram@student.waypoint.edu',
    streakDays: 7,
    xp: 480,
    level: 3,
    studyHoursWeekly: 4.8,
    attendanceRate: 95.8,
    topicScores: { lim_01: 87, diff_01: 79, int_01: 73, ds_arr_01: 85, ds_ll_01: 79, elec_ohm_01: 76 }
  },
  {
    studentId: 'st_22',
    studentName: 'Shreya Ghoshal',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 77,
    status: 'on_track',
    trend: 'improving',
    activeTier: 2,
    gapTopicsCount: 2,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Shreya)',
    parentEmail: 'shreya.ghoshal.mentor@waypoint.edu',
    studentEmail: 'shreya.ghoshal@student.waypoint.edu',
    streakDays: 9,
    xp: 440,
    level: 3,
    studyHoursWeekly: 4.3,
    attendanceRate: 95.2,
    topicScores: { lim_01: 83, diff_01: 82, int_01: 69, ds_arr_01: 81, ds_ll_01: 75, elec_ohm_01: 72 }
  },
  {
    studentId: 'st_23',
    studentName: 'Kartik Narayan',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 68,
    status: 'needs_support',
    trend: 'stable',
    activeTier: 2,
    gapTopicsCount: 3,
    lastActive: '1 day ago',
    parentName: 'Mentor (Kartik)',
    parentEmail: 'kartik.narayan.mentor@waypoint.edu',
    studentEmail: 'kartik.narayan@student.waypoint.edu',
    streakDays: 5,
    xp: 340,
    level: 2,
    studyHoursWeekly: 3.7,
    attendanceRate: 93,
    topicScores: { lim_01: 74, diff_01: 66, int_01: 60, ds_arr_01: 72, ds_ll_01: 66, elec_ohm_01: 63 }
  },
  {
    studentId: 'st_24',
    studentName: 'Nikhil Agarwal',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 93,
    status: 'thriving',
    trend: 'improving',
    activeTier: 3,
    gapTopicsCount: 0,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Nikhil)',
    parentEmail: 'nikhil.agarwal.mentor@waypoint.edu',
    studentEmail: 'nikhil.agarwal@student.waypoint.edu',
    streakDays: 16,
    xp: 880,
    level: 4,
    studyHoursWeekly: 7.2,
    attendanceRate: 99,
    topicScores: { lim_01: 99, diff_01: 98, int_01: 85, ds_arr_01: 97, ds_ll_01: 91, elec_ohm_01: 88 }
  },
  {
    studentId: 'st_25',
    studentName: 'Swati Bose',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 85,
    status: 'thriving',
    trend: 'stable',
    activeTier: 3,
    gapTopicsCount: 1,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Swati)',
    parentEmail: 'swati.bose.mentor@waypoint.edu',
    studentEmail: 'swati.bose@student.waypoint.edu',
    streakDays: 8,
    xp: 600,
    level: 4,
    studyHoursWeekly: 5.1,
    attendanceRate: 96.4,
    topicScores: { lim_01: 91, diff_01: 83, int_01: 77, ds_arr_01: 89, ds_ll_01: 83, elec_ohm_01: 80 }
  },
  {
    studentId: 'st_26',
    studentName: 'Pranav Mukund',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 71,
    status: 'on_track',
    trend: 'stable',
    activeTier: 2,
    gapTopicsCount: 2,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Pranav)',
    parentEmail: 'pranav.mukund.mentor@waypoint.edu',
    studentEmail: 'pranav.mukund@student.waypoint.edu',
    streakDays: 5,
    xp: 370,
    level: 3,
    studyHoursWeekly: 3.8,
    attendanceRate: 94.2,
    topicScores: { lim_01: 77, diff_01: 69, int_01: 63, ds_arr_01: 75, ds_ll_01: 69, elec_ohm_01: 66 }
  },
  {
    studentId: 'st_27',
    studentName: 'Anirudh Chawla',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 65,
    status: 'needs_support',
    trend: 'declining',
    activeTier: 1,
    gapTopicsCount: 4,
    lastActive: '1 day ago',
    parentName: 'Mentor (Anirudh)',
    parentEmail: 'anirudh.chawla.mentor@waypoint.edu',
    studentEmail: 'anirudh.chawla@student.waypoint.edu',
    streakDays: 2,
    xp: 300,
    level: 2,
    studyHoursWeekly: 3,
    attendanceRate: 88.5,
    topicScores: { lim_01: 71, diff_01: 50, int_01: 57, ds_arr_01: 69, ds_ll_01: 63, elec_ohm_01: 60 }
  },
  {
    studentId: 'st_28',
    studentName: 'Shalini Saxena',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 87,
    status: 'thriving',
    trend: 'improving',
    activeTier: 3,
    gapTopicsCount: 0,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Shalini)',
    parentEmail: 'shalini.saxena.mentor@waypoint.edu',
    studentEmail: 'shalini.saxena@student.waypoint.edu',
    streakDays: 12,
    xp: 680,
    level: 4,
    studyHoursWeekly: 5.6,
    attendanceRate: 97.8,
    topicScores: { lim_01: 93, diff_01: 92, int_01: 79, ds_arr_01: 91, ds_ll_01: 85, elec_ohm_01: 82 }
  },
  {
    studentId: 'st_29',
    studentName: 'Gautam Singhal',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 75,
    status: 'on_track',
    trend: 'stable',
    activeTier: 2,
    gapTopicsCount: 2,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Gautam)',
    parentEmail: 'gautam.singhal.mentor@waypoint.edu',
    studentEmail: 'gautam.singhal@student.waypoint.edu',
    streakDays: 6,
    xp: 400,
    level: 3,
    studyHoursWeekly: 4.1,
    attendanceRate: 94.8,
    topicScores: { lim_01: 81, diff_01: 73, int_01: 67, ds_arr_01: 79, ds_ll_01: 73, elec_ohm_01: 70 }
  },
  {
    studentId: 'st_30',
    studentName: 'Deepa Venkat',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 91,
    status: 'thriving',
    trend: 'improving',
    activeTier: 3,
    gapTopicsCount: 0,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Deepa)',
    parentEmail: 'deepa.venkat.mentor@waypoint.edu',
    studentEmail: 'deepa.venkat@student.waypoint.edu',
    streakDays: 14,
    xp: 800,
    level: 4,
    studyHoursWeekly: 6.8,
    attendanceRate: 98.6,
    topicScores: { lim_01: 97, diff_01: 96, int_01: 83, ds_arr_01: 95, ds_ll_01: 89, elec_ohm_01: 86 }
  },
  {
    studentId: 'st_31',
    studentName: 'Tarun Bhattacharya',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 60,
    status: 'needs_support',
    trend: 'stable',
    activeTier: 1,
    gapTopicsCount: 4,
    lastActive: '1 day ago',
    parentName: 'Mentor (Tarun)',
    parentEmail: 'tarun.bhattacharya.mentor@waypoint.edu',
    studentEmail: 'tarun.bhattacharya@student.waypoint.edu',
    streakDays: 3,
    xp: 270,
    level: 2,
    studyHoursWeekly: 2.9,
    attendanceRate: 89,
    topicScores: { lim_01: 66, diff_01: 58, int_01: 52, ds_arr_01: 64, ds_ll_01: 58, elec_ohm_01: 55 }
  },
  {
    studentId: 'st_32',
    studentName: 'Samarth Khandelwal',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 83,
    status: 'on_track',
    trend: 'improving',
    activeTier: 2,
    gapTopicsCount: 1,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Samarth)',
    parentEmail: 'samarth.khandelwal.mentor@waypoint.edu',
    studentEmail: 'samarth.khandelwal@student.waypoint.edu',
    streakDays: 10,
    xp: 530,
    level: 3,
    studyHoursWeekly: 4.9,
    attendanceRate: 96.2,
    topicScores: { lim_01: 89, diff_01: 88, int_01: 75, ds_arr_01: 87, ds_ll_01: 81, elec_ohm_01: 78 }
  },
  {
    studentId: 'st_33',
    studentName: 'Archana Nair',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 35,
    status: 'at_risk',
    trend: 'declining',
    activeTier: 1,
    gapTopicsCount: 6,
    lastActive: '3 days ago',
    parentName: 'Mentor (Archana)',
    parentEmail: 'archana.nair.mentor@waypoint.edu',
    studentEmail: 'archana.nair@student.waypoint.edu',
    streakDays: 1,
    xp: 130,
    level: 1,
    studyHoursWeekly: 1.6,
    attendanceRate: 75.5,
    topicScores: { lim_01: 41, diff_01: 25, int_01: 30, ds_arr_01: 39, ds_ll_01: 33, elec_ohm_01: 30 }
  },
  {
    studentId: 'st_34',
    studentName: 'Manish Tiwari',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 33,
    status: 'at_risk',
    trend: 'declining',
    activeTier: 1,
    gapTopicsCount: 6,
    lastActive: '3 days ago',
    parentName: 'Mentor (Manish)',
    parentEmail: 'manish.tiwari.mentor@waypoint.edu',
    studentEmail: 'manish.tiwari@student.waypoint.edu',
    streakDays: 0,
    xp: 110,
    level: 1,
    studyHoursWeekly: 1.4,
    attendanceRate: 74,
    topicScores: { lim_01: 39, diff_01: 25, int_01: 30, ds_arr_01: 37, ds_ll_01: 31, elec_ohm_01: 28 }
  },
  {
    studentId: 'st_35',
    studentName: 'Nandini Murthy',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 88,
    status: 'thriving',
    trend: 'stable',
    activeTier: 3,
    gapTopicsCount: 0,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Nandini)',
    parentEmail: 'nandini.murthy.mentor@waypoint.edu',
    studentEmail: 'nandini.murthy@student.waypoint.edu',
    streakDays: 11,
    xp: 660,
    level: 4,
    studyHoursWeekly: 5.7,
    attendanceRate: 97.4,
    topicScores: { lim_01: 94, diff_01: 86, int_01: 80, ds_arr_01: 92, ds_ll_01: 86, elec_ohm_01: 83 }
  },
  {
    studentId: 'st_36',
    studentName: 'Rajeshwari Prasad',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 79,
    status: 'on_track',
    trend: 'stable',
    activeTier: 2,
    gapTopicsCount: 1,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Rajeshwari)',
    parentEmail: 'rajeshwari.prasad.mentor@waypoint.edu',
    studentEmail: 'rajeshwari.prasad@student.waypoint.edu',
    streakDays: 7,
    xp: 450,
    level: 3,
    studyHoursWeekly: 4.4,
    attendanceRate: 95.6,
    topicScores: { lim_01: 85, diff_01: 77, int_01: 71, ds_arr_01: 83, ds_ll_01: 77, elec_ohm_01: 74 }
  },
  {
    studentId: 'st_37',
    studentName: 'Chirag Shah',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 72,
    status: 'on_track',
    trend: 'improving',
    activeTier: 2,
    gapTopicsCount: 2,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Chirag)',
    parentEmail: 'chirag.shah.mentor@waypoint.edu',
    studentEmail: 'chirag.shah@student.waypoint.edu',
    streakDays: 6,
    xp: 390,
    level: 3,
    studyHoursWeekly: 3.9,
    attendanceRate: 94.5,
    topicScores: { lim_01: 78, diff_01: 77, int_01: 64, ds_arr_01: 76, ds_ll_01: 70, elec_ohm_01: 67 }
  },
  {
    studentId: 'st_38',
    studentName: 'Alok Pandey',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 66,
    status: 'needs_support',
    trend: 'stable',
    activeTier: 1,
    gapTopicsCount: 3,
    lastActive: '1 day ago',
    parentName: 'Mentor (Alok)',
    parentEmail: 'alok.pandey.mentor@waypoint.edu',
    studentEmail: 'alok.pandey@student.waypoint.edu',
    streakDays: 4,
    xp: 320,
    level: 2,
    studyHoursWeekly: 3.3,
    attendanceRate: 90.5,
    topicScores: { lim_01: 72, diff_01: 64, int_01: 58, ds_arr_01: 70, ds_ll_01: 64, elec_ohm_01: 61 }
  },
  {
    studentId: 'st_39',
    studentName: 'Sunita Das',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 86,
    status: 'thriving',
    trend: 'improving',
    activeTier: 3,
    gapTopicsCount: 1,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Sunita)',
    parentEmail: 'sunita.das.mentor@waypoint.edu',
    studentEmail: 'sunita.das@student.waypoint.edu',
    streakDays: 9,
    xp: 630,
    level: 4,
    studyHoursWeekly: 5.2,
    attendanceRate: 96.8,
    topicScores: { lim_01: 92, diff_01: 91, int_01: 78, ds_arr_01: 90, ds_ll_01: 84, elec_ohm_01: 81 }
  },
  {
    studentId: 'st_40',
    studentName: 'Vivek Vardhan',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    grade: 'CSE Year 1 - Section A',
    overallMastery: 79,
    status: 'on_track',
    trend: 'stable',
    activeTier: 2,
    gapTopicsCount: 1,
    lastActive: '15 mins ago',
    parentName: 'Mentor (Vivek)',
    parentEmail: 'vivek.vardhan.mentor@waypoint.edu',
    studentEmail: 'vivek.vardhan@student.waypoint.edu',
    streakDays: 8,
    xp: 470,
    level: 3,
    studyHoursWeekly: 4.5,
    attendanceRate: 96,
    topicScores: { lim_01: 85, diff_01: 77, int_01: 71, ds_arr_01: 83, ds_ll_01: 77, elec_ohm_01: 74 }
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
      targetStudents: ['Arjun Nair', 'Neha Gupta'],
      description: 'Scaffolded practice decomposing $u(x)$ step-by-step with guided hints.',
      problems: [
        'Decompose $y = (4x + 1)^3$. What is the inner function $u(x)$ and its derivative $u\'(x)$?',
        'Differentiate $f(x) = \\sin(5x)$ using the 2-step template $[\\text{outer derivative}] \\times [\\text{inner derivative}]$.',
        'Find $\\frac{dy}{dx}$ for $y = \\sqrt{2x^2 + 7}$.'
      ]
    },
    tier2Intermediate: {
      targetStudents: ['Aarav Sharma', 'Priya Patel'],
      description: 'Multi-layer composite functions with mixed trigonometric and exponential terms.',
      problems: [
        'Differentiate $g(x) = e^{\\tan(3x^2)}$.',
        'Calculate the equation of the tangent line to $y = (x^2 - 1)^4$ at $x = 2$.',
        'If $f(x) = \\ln(\\cos(x))$, evaluate $f\'(\\pi / 4)$.'
      ]
    },
    tier3Extension: {
      targetStudents: ['Kavya Reddy', 'Siddharth Rao'],
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
  weekLabel: 'Week 4: Mid-Semester Academic Digest',
  overallHealth: 'steady',
  hoursLearned: 4.5,
  masteryGainPercent: 12,
  cardsMasteredCount: 22,
  headlineSummary: 'Aarav maintained steady progress in Engineering Mathematics and Data Structures. He mastered 88%+ of Limits & Derivatives concepts with an active 8-day recall streak.',
  celebrations: [
    'Achieved Level 3 Engineering Scholar rank with 420 XP earned.',
    'Flawless diagnostic score in Limits and Function Derivatives.',
    'Completed 22 active recall flashcards ahead of the lab practical.'
  ],
  focusAreas: [
    {
      subject: 'Engineering Mathematics',
      topic: 'Composite Chain Rule & Differential Equations',
      homeActionTip: 'Check in with Aarav on breaking down multi-variable expressions before the upcoming mid-semester test.'
    },
    {
      subject: 'Basic Electronics',
      topic: 'Kirchhoff’s Current & Voltage Laws',
      homeActionTip: 'Encourage a quick 10-minute circuit nodal analysis review on the Waypoint flashcard deck.'
    }
  ],
  dinnerTablePrompts: [
    {
      prompt: '"How are you managing the pace of coursework and lab submissions across Data Structures and Circuit Theory this week?"',
      context: 'Aarav is balancing theoretical calculus with hands-on programming labs.',
      followUp: 'Discuss time-blocking strategies and prioritizing high-friction topics.'
    },
    {
      prompt: '"How does memory allocation in C++ pointers and linked lists connect to your Software Engineer career track?"',
      context: 'Aarav completed the Data Structures foundation unit this week.',
      followUp: 'Ask him to explain how stack vs heap memory behaves in everyday software.'
    }
  ]
};

export const mockAuthUsers: AuthUser[] = [
  {
    id: 'st_01',
    email: 'maya.lin@student.waypoint.edu',
    name: 'Aarav Sharma',
    role: 'student',
    password: 'demo123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    title: 'CSE Year 1 - Section A',
    linkedStudentId: 'st_01'
  },
  {
    id: 'parent_elena',
    email: 'elena.lin@parent.waypoint.edu',
    name: 'Rajesh Sharma',
    role: 'parent',
    password: 'demo123',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    title: 'Faculty Mentor for Arjun Nair & Aarav Sharma',
    linkedStudentId: 'st_04',
    linkedStudentIds: ['st_04', 'st_01']
  },
  {
    id: 'st_02',
    email: 'leo.chen@student.waypoint.edu',
    name: 'Rohan Iyer',
    role: 'student',
    password: 'demo123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    title: 'CSE Year 1 - Section A',
    linkedStudentId: 'st_02'
  },
  {
    id: 'parent_david',
    email: 'david.chen@parent.waypoint.edu',
    name: 'Suresh Iyer',
    role: 'parent',
    password: 'demo123',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    title: 'Faculty Mentor for Neha Gupta & Rohan Iyer',
    linkedStudentId: 'st_09',
    linkedStudentIds: ['st_09', 'st_02']
  },
  {
    id: 'st_03',
    email: 'ethan.hunt@student.waypoint.edu',
    name: 'Ethan Hunt',
    role: 'student',
    password: 'demo123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    title: 'Grade 11 AP Scholar',
    linkedStudentId: 'st_03'
  },
  {
    id: 'parent_sarah',
    email: 'sarah.hunt@parent.waypoint.edu',
    name: 'Sarah Hunt',
    role: 'parent',
    password: 'demo123',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    title: 'Parent of Ethan Hunt',
    linkedStudentId: 'st_03'
  },
  {
    id: 'teach_vance',
    email: 'dr.vance@faculty.waypoint.edu',
    name: 'Dr. Eleanor Vance',
    role: 'teacher',
    password: 'demo123',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    title: 'Professor & CSE Academic Advisor'
  }
];

export const mockStudentComprehensiveReport: StudentComprehensiveReport = {
  studentId: 'st_01',
  studentName: 'Aarav Sharma',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  grade: 'CSE Year 1 - Section A',
  school: 'Apex Institute of Technology — Department of Computer Science & Engineering',
  academicYear: '2025 - 2026 Academic Term',
  studentEmail: 'maya.lin@student.waypoint.edu',
  parentEmail: 'elena.lin@parent.waypoint.edu',
  parentName: 'Rajesh Sharma',

  attendance: {
    overallRate: 96.8,
    presentDays: 48,
    totalDays: 50,
    excusedAbsences: 2,
    unexcusedAbsences: 0,
    tardies: 1,
    recentLog: [
      { date: 'Aug 05, 2026', status: 'present', subject: 'Engineering Mathematics', note: 'Active participation in Socratic session' },
      { date: 'Aug 04, 2026', status: 'present', subject: 'Physics', note: 'Completed lab on rotational inertia' },
      { date: 'Aug 03, 2026', status: 'tardy', subject: 'Data Structures', note: 'Late by 5 mins (bus transit delay)' },
      { date: 'Aug 02, 2026', status: 'present', subject: 'Basic Electronics', note: 'Lab practical: Acid-base titration' },
      { date: 'Aug 01, 2026', status: 'present', subject: 'Engineering Mathematics', note: 'Derivatives diagnostic completed' },
      { date: 'Jul 31, 2026', status: 'excused', subject: 'All Periods', note: 'Excused: Medical appointment' }
    ]
  },

  subjectBreakdown: [
    {
      subject: 'Engineering Mathematics',
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
      subject: 'Data Structures',
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
      subject: 'Physics',
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
      subject: 'Basic Electronics',
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
      subject: 'Engineering Mathematics',
      severity: 'critical',
      misconceptionSummary: 'Forgets to multiply by the inner derivative $g\'(x)$ when differentiating $f(g(x))$.',
      recommendedHomeAction: 'Prompt Maya to use the "box method" or "onion peeling" metaphor when tackling composite problems.'
    },
    {
      topic: 'Acid-Base Buffer Equilibrium (ICE Tables)',
      subject: 'Basic Electronics',
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
  studentId: 'st_02',
  studentName: 'Rohan Iyer',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  grade: 'Grade 11 (AP Advanced STEM)',
  school: 'Apex Institute of Technology — Department of Computer Science & Engineering',
  academicYear: '2025 - 2026 Academic Term',
  studentEmail: 'leo.chen@student.waypoint.edu',
  parentEmail: 'david.chen@parent.waypoint.edu',
  parentName: 'Suresh Iyer',

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
      subject: 'Engineering Mathematics',
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
      subject: 'Engineering Mathematics',
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
    avatar: metric.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    grade: metric.grade || '11th Grade (AP Advanced STEM)',
    school: 'Apex Institute of Technology — Department of Computer Science & Engineering',
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
        { date: 'Aug 05, 2026', status: 'present', subject: 'Engineering Mathematics', note: 'Interactive Socratic recall session' },
        { date: 'Aug 04, 2026', status: 'present', subject: 'AP Physics C', note: 'Mechanics laboratory on rotational inertia' },
        { date: 'Aug 03, 2026', status: unexcused > 0 ? 'absent' : 'present', subject: 'Data Structures', note: unexcused > 0 ? 'Unexcused absence' : 'Recursion module completed' },
        { date: 'Aug 02, 2026', status: 'present', subject: 'Basic Electronics', note: 'Acid-base buffer equilibrium check' },
        { date: 'Aug 01, 2026', status: 'present', subject: 'Engineering Mathematics', note: 'Concept diagnostic quiz' }
      ]
    },
    subjectBreakdown: [
      {
        subject: 'Engineering Mathematics',
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
        subject: 'Data Structures',
        score: csScore,
        gradeLetter: getGrade(csScore),
        rankInClass: getRank(csScore),
        strengths: ['Algorithmic decomposition', 'Object-oriented data structures'],
        weakSections: csScore < 70 ? ['2D Array boundary iterations'] : [],
        teacherName: 'Prof. Marcus Brody',
        teacherRemarks: `${metric.studentName} is actively engaged in coding lab challenges.`
      },
      {
        subject: 'Physics',
        score: physScore,
        gradeLetter: getGrade(physScore),
        rankInClass: getRank(physScore),
        strengths: ['Kinematics vector modeling', 'Energy conservation equations'],
        weakSections: physScore < 75 ? ['Rotational moment of inertia integrals'] : [],
        teacherName: 'Dr. Sarah Jenkins',
        teacherRemarks: `Good laboratory intuition. Extra practice on angular momentum recommended.`
      },
      {
        subject: 'Basic Electronics',
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
  const firstScore = report?.subjectBreakdown?.[0]?.score ?? 85;
  const isHigh = firstScore >= 85;
  const habits = report?.studyHabits || {
    weeklyFocusHours: 8.5,
    activeRecallStreakDays: 12,
    masteredCardsCount: 38,
    socraticSessionsCompleted: 14,
    completionRate: 94
  };
  const attendance = report?.attendance || {
    overallRate: 96.8,
    presentDays: 48,
    totalDays: 50,
    excusedAbsences: 2,
    unexcusedAbsences: 0,
    tardies: 0,
    recentLog: []
  };
  const studentName = report?.studentName || 'Maya Lin';
  const childFirst = studentName.split(' ')[0] || 'Your child';
  const weakAreas = (report?.weakAreasRadar && report.weakAreasRadar.length > 0)
    ? report.weakAreasRadar
    : [
        {
          topic: 'Nested Chain Rule Derivatives',
          subject: 'Engineering Mathematics',
          severity: 'moderate' as const,
          misconceptionSummary: 'Confuses outer and inner derivative terms when differentiating composite functions.',
          recommendedHomeAction: 'Prompt student to identify the innermost function before differentiating.'
        }
      ];
  const subjects = (report?.subjectBreakdown && report.subjectBreakdown.length > 0)
    ? report.subjectBreakdown
    : [
        {
          subject: 'Engineering Mathematics',
          score: 88,
          gradeLetter: 'A',
          rankInClass: 'Top 15%',
          strengths: ['Derivatives', 'Limits'],
          weakSections: ['Chain Rule'],
          teacherName: 'Dr. Eleanor Vance',
          teacherRemarks: 'Great momentum in calculus.'
        }
      ];

  return {
    weekLabel: 'Week of Aug 1 - Aug 5, 2026',
    overallHealth: isHigh ? 'steady' : 'needs_attention',
    hoursLearned: habits.weeklyFocusHours || 8.5,
    masteryGainPercent: isHigh ? 14 : 8,
    cardsMasteredCount: habits.masteredCardsCount || 38,
    headlineSummary: `${studentName} has logged ${habits.weeklyFocusHours || 8.5} hours this week with an active ${habits.activeRecallStreakDays || 12}-day streak!`,
    celebrations: [
      `Maintained a ${attendance.overallRate}% classroom attendance rate.`,
      `Completed ${habits.socraticSessionsCompleted || 14} interactive Socratic AI sessions.`,
      `Mastered ${habits.masteredCardsCount || 38} active recall flashcards.`
    ],
    focusAreas: weakAreas.slice(0, 2).map(w => ({
      subject: w.subject,
      topic: w.topic,
      homeActionTip: w.recommendedHomeAction || 'Practice problem breakdown together.'
    })),
    dinnerTablePrompts: [
      {
        prompt: `"Hey ${childFirst}, tell me about what you discovered in ${subjects[0]?.subject || 'Calculus'} this week!"`,
        context: `${studentName} spent time reviewing ${weakAreas[0]?.topic || 'core STEM concepts'}.`,
        followUp: 'Ask them to explain how they broke down difficult problems in Socratic mode!'
      },
      {
        prompt: `"What was the most exciting thing you built or practiced on Waypoint today?"`,
        context: `${studentName} is on a ${habits.activeRecallStreakDays || 12}-day active learning streak.`,
        followUp: 'Celebrate their consistency and encourage keeping the streak going!'
      }
    ]
  };
}

// Build 40-student reports map dynamically
export const mockStudentReportsMap: Record<string, StudentComprehensiveReport> = {
  'st_01': mockStudentComprehensiveReport,
  'stu_maya_01': mockStudentComprehensiveReport,
  'stu_maya': mockStudentComprehensiveReport,
  'st_02': mockLeoStudentReport,
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



