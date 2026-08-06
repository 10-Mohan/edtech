import { describe, it, expect } from 'vitest';
import { CurriculumGeneratorService } from '../services/curriculumGenerator';

describe('Curriculum & Differentiated Worksheet Generator', () => {
  it('generates structured knowledge graph nodes for any STEM subject', async () => {
    const curriculum = await CurriculumGeneratorService.generateCourseCurriculum({
      subject: 'physics',
      courseTitle: 'AP Physics C: Mechanics',
      targetLevel: 'ap_advanced',
      keyUnits: ['Rotational dynamics', 'Torque', 'Moment of inertia'],
      generateQuestions: true
    });

    expect(curriculum).toBeDefined();
    expect(Array.isArray(curriculum.nodes)).toBe(true);
    expect(curriculum.nodes.length).toBeGreaterThanOrEqual(4);

    const firstNode = curriculum.nodes[0];
    expect(firstNode.id).toBeDefined();
    expect(firstNode.title).toBeDefined();
    expect(firstNode.category).toBeDefined();
    expect(firstNode.description).toBeDefined();
    expect(firstNode.keyTakeaways.length).toBeGreaterThan(0);
  });

  it('generates a 3-tier differentiated worksheet with foundational, intermediate, and extension tiers', async () => {
    const worksheet = await CurriculumGeneratorService.generateDifferentiatedWorksheetAI(
      'Chain Rule for Composite Functions',
      'math'
    );

    expect(worksheet.title).toContain('Chain Rule');
    expect(worksheet.tier1Foundational.problems.length).toBeGreaterThan(0);
    expect(worksheet.tier2Intermediate.problems.length).toBeGreaterThan(0);
    expect(worksheet.tier3Extension.problems.length).toBeGreaterThan(0);

    // Verify targeted students and scaffolding descriptions
    expect(worksheet.tier1Foundational.targetStudents.length).toBeGreaterThan(0);
    expect(worksheet.tier3Extension.targetStudents.length).toBeGreaterThan(0);
  });
});
