import { describe, it, expect, beforeEach } from 'vitest';
import { VectorService } from '../services/vectorService';
import { BackendService } from '../services/backendService';
import { ConceptNode, DifferentiatedWorksheet } from '../types';

describe('Curriculum Authoring & Vector Auto-Embedding', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('indexes a single concept node into the vector store and returns embedding metadata', async () => {
    const node: ConceptNode = {
      id: 'test_node_calc_1',
      title: 'Green\'s Theorem & Planar Circulation',
      subject: 'math',
      category: 'Vector Calculus',
      status: 'in_progress',
      masteryScore: 85,
      prerequisites: ['line_integrals', 'double_integrals'],
      x: 300,
      y: 250,
      description: 'Relates circulation line integrals along a closed curve to double integrals over the enclosed region.',
      estimatedStudyMins: 30,
      commonMisconception: 'Incorrect boundary orientation direction',
      keyTakeaways: ['Circulation density = 2D curl', 'Jordan curve orientation convention']
    };

    const res = await VectorService.indexSingleConceptNode(node);
    expect(res.success).toBe(true);
    expect(res.vectorDim).toBe(1536);

    // Semantic search should find this concept
    const searchMatches = await VectorService.searchRelevantKnowledge('circulation around boundary curves', 'math', 3);
    expect(searchMatches.length).toBeGreaterThan(0);
    const found = searchMatches.some(m => m.id === node.id || m.title.includes('Green'));
    expect(found).toBe(true);
  });

  it('indexes a 3-tier differentiated worksheet into the vector store and persists via BackendService', async () => {
    const worksheet: DifferentiatedWorksheet = {
      id: 'ws_taylor_series_test',
      title: 'Taylor Series Polynomial Approximations',
      subject: 'math',
      topicTitle: 'Taylor Series',
      createdAt: '2026-08-07',
      tier1Foundational: {
        targetStudents: ['Review group'],
        description: 'Scaffolded polynomial derivations',
        problems: ['Find the first 3 terms of $e^x$ around $x=0$.']
      },
      tier2Intermediate: {
        targetStudents: ['Core cohort'],
        description: 'Error bound calculations',
        problems: ['Compute the Lagrange error bound for $\\sin(0.1)$.']
      },
      tier3Extension: {
        targetStudents: ['Advanced cohort'],
        description: 'Analytic continuation & complex contour integration',
        problems: ['Prove radius of convergence for complex rational functions.']
      }
    };

    // Save in BackendService
    const updatedWorksheets = BackendService.addOrUpdateWorksheet(worksheet, 'teacher');
    expect(updatedWorksheets.some(w => w.id === worksheet.id)).toBe(true);

    // Index into Vector store
    const res = await VectorService.indexSingleWorksheet(worksheet);
    expect(res.success).toBe(true);
    expect(res.vectorDim).toBe(1536);

    // Search should return the worksheet text
    const searchMatches = await VectorService.searchRelevantKnowledge('Lagrange error bound for sin', 'math', 3);
    expect(searchMatches.length).toBeGreaterThan(0);
  });

  it('supports deletion of worksheets and nodes', () => {
    const ws: DifferentiatedWorksheet = {
      id: 'ws_temp_delete',
      title: 'Temporary Worksheet',
      subject: 'physics',
      topicTitle: 'Kinematics',
      createdAt: '2026-08-07',
      tier1Foundational: { targetStudents: [], description: '', problems: ['p1'] },
      tier2Intermediate: { targetStudents: [], description: '', problems: ['p2'] },
      tier3Extension: { targetStudents: [], description: '', problems: ['p3'] }
    };

    BackendService.addOrUpdateWorksheet(ws, 'teacher');
    expect(BackendService.getWorksheets().some(w => w.id === 'ws_temp_delete')).toBe(true);

    const remaining = BackendService.deleteWorksheet('ws_temp_delete', 'teacher');
    expect(remaining.some(w => w.id === 'ws_temp_delete')).toBe(false);
  });
});
