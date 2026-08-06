import { describe, it, expect, beforeEach } from 'vitest';
import { VectorService } from '../services/vectorService';
import { mockMathConceptNodes } from '../data/mockData';

describe('Qdrant Vector Service & Semantic RAG Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Dense Embedding Generation', () => {
    it('generates 1536-dimensional L2-normalized dense vector embeddings', async () => {
      const text = 'Understanding the chain rule for composite functions f(g(x))';
      const vector = await VectorService.generateEmbedding(text);

      expect(vector.length).toBe(1536);

      // Verify L2 norm is approximately 1.0
      let sumSq = 0;
      for (const val of vector) sumSq += val * val;
      const norm = Math.sqrt(sumSq);
      expect(norm).toBeCloseTo(1.0, 3);
    });

    it('computes accurate cosine similarity between identical and distinct vectors', () => {
      const vecA = [1, 0, 0];
      const vecB = [1, 0, 0];
      const vecC = [0, 1, 0];

      const simSame = VectorService.cosineSimilarity(vecA, vecB);
      const simDiff = VectorService.cosineSimilarity(vecA, vecC);

      expect(simSame).toBeCloseTo(1.0, 5);
      expect(simDiff).toBeCloseTo(0.0, 5);
    });
  });

  describe('Curriculum Indexing & Semantic Vector Search', () => {
    it('indexes concept nodes into vector storage', async () => {
      const indexedCount = await VectorService.indexConceptNodes(mockMathConceptNodes);
      expect(indexedCount).toBe(mockMathConceptNodes.length);

      const cfg = VectorService.getConfig();
      expect(cfg.indexedPointsCount).toBe(mockMathConceptNodes.length);
    });

    it('retrieves relevant calculus concept nodes via semantic similarity', async () => {
      await VectorService.indexConceptNodes(mockMathConceptNodes);
      const query = 'How do I take derivatives of nested functions using the chain rule?';
      const results = await VectorService.searchRelevantConcepts(query, 'math', 3);

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].title.toLowerCase()).toContain('chain rule');
      expect(results[0].score).toBeGreaterThan(0);
      expect(results[0].prerequisites).toBeDefined();
    });

    it('augments Socratic tutor prompt with retrieved RAG context', async () => {
      const query = 'How do I differentiate composite functions using the Chain Rule?';
      const { augmentedContext, citations } = await VectorService.augmentPromptWithRAG(query, 'math');

      expect(augmentedContext).toContain('[KNOWLEDGE GRAPH RETRIEVED CONTEXT (RAG)]:');
      expect(augmentedContext).toContain('Chain Rule');
      expect(citations.length).toBeGreaterThan(0);
    });

  });
});
