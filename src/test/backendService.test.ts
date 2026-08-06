import { describe, it, expect, beforeEach } from 'vitest';
import { BackendService } from '../services/backendService';

describe('Backend Architecture & Multi-Tenant Synchronization', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default seed users across student, parent, and teacher roles', () => {
    const users = BackendService.getUsers();
    expect(users.length).toBeGreaterThanOrEqual(3);

    const student = users.find(u => u.role === 'student');
    const teacher = users.find(u => u.role === 'teacher');
    const parent = users.find(u => u.role === 'parent');

    expect(student).toBeDefined();
    expect(teacher).toBeDefined();
    expect(parent).toBeDefined();
  });

  it('registers new user accounts and links parents to students', () => {
    const newParent = BackendService.registerUser(
      'sarah.connor@parent.waypoint.edu',
      'Sarah Connor',
      'parent',
      'INVITE-MAYA-123'
    );

    expect(newParent.id).toBeDefined();
    expect(newParent.email).toBe('sarah.connor@parent.waypoint.edu');
    expect(newParent.linkedStudentId).toBe('stu_maya_01');
    expect(newParent.linkedStudentIds).toContain('stu_maya_01');
  });

  it('updates mastery scores and allows node creation', () => {
    const initialNodes = BackendService.getConceptNodes();
    expect(initialNodes.length).toBeGreaterThan(0);

    const targetNode = { ...initialNodes[0], masteryScore: 95 };
    const updatedNodes = BackendService.addOrUpdateConceptNode(targetNode, 'teacher');

    const verified = updatedNodes.find(n => n.id === targetNode.id);
    expect(verified?.masteryScore).toBe(95);
  });

  it('retrieves comprehensive multi-student reports for parent portal', () => {
    const mayaReport = BackendService.getStudentReport('stu_maya_01');
    expect(mayaReport).toBeDefined();
    expect(mayaReport.studentName).toContain('Maya');
    expect(mayaReport.attendance.overallRate).toBeGreaterThan(90);
    expect(mayaReport.subjectBreakdown.length).toBeGreaterThan(0);
  });
});
