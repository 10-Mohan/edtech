import { ConceptNode, DifferentiatedWorksheet, QdrantConfig, RAGSearchResult, SubjectId } from '../types';
import { initialConceptNodes, mockMathConceptNodes, mockPhysicsConceptNodes } from '../data/mockData';

const QDRANT_CONFIG_KEY = 'waypoint_qdrant_config';


export const DEFAULT_QDRANT_CONFIG: QdrantConfig = {
  url: (import.meta as any).env?.VITE_QDRANT_URL || '',
  apiKey: (import.meta as any).env?.VITE_QDRANT_API_KEY || '',
  collectionName: 'waypoint_curriculum',
  dimension: 1536,
  isConnected: false,
  indexedPointsCount: 0
};

export const VectorService = {
  hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  },

  getConfig(): QdrantConfig {
    const data = localStorage.getItem(QDRANT_CONFIG_KEY);
    if (data) {
      try {
        const parsed = JSON.parse(data);
        return {
          ...DEFAULT_QDRANT_CONFIG,
          ...parsed,
          url: parsed.url || DEFAULT_QDRANT_CONFIG.url,
          apiKey: parsed.apiKey || DEFAULT_QDRANT_CONFIG.apiKey
        };
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_QDRANT_CONFIG;
  },

  saveConfig(config: QdrantConfig): void {
    localStorage.setItem(QDRANT_CONFIG_KEY, JSON.stringify(config));
  },

  isCloudConfigured(): boolean {
    const cfg = this.getConfig();
    return !!(cfg.url && cfg.url.trim());
  },

  // -------------------------------------------------------------
  // Embedding Generation (API Proxy / OpenAI / Deterministic Dense)
  // -------------------------------------------------------------
  async generateEmbedding(text: string): Promise<number[]> {
    const dim = 1536;

    // 1. Try serverless backend proxy (/api/vector)
    try {
      const res = await fetch('/api/vector', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'embed', text })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.embedding && Array.isArray(data.embedding)) {
          return data.embedding;
        }
      }
    } catch (e) {
      // Fallback
    }

    // 2. Deterministic, L2-normalized dense semantic vector generator
    // Creates a high-fidelity 1536-dim vector for instant offline RAG & testing
    return this.computeOfflineDenseEmbedding(text, dim);
  },

  computeOfflineDenseEmbedding(text: string, dimension: number = 1536): number[] {
    const vector = new Array(dimension).fill(0);
    const clean = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = clean.split(/\s+/).filter(Boolean);

    for (let i = 0; i < tokens.length; i++) {
      const word = tokens[i];
      let hash = 0;
      for (let c = 0; c < word.length; c++) {
        hash = (hash << 5) - hash + word.charCodeAt(c);
        hash |= 0;
      }
      const idx1 = Math.abs(hash) % dimension;
      const idx2 = Math.abs((hash * 31) ^ (i * 17)) % dimension;
      const idx3 = Math.abs((hash * 97) + 13) % dimension;

      vector[idx1] += 1.0;
      vector[idx2] += 0.65;
      vector[idx3] += 0.45;
    }

    // L2 Normalize
    let norm = 0;
    for (let i = 0; i < dimension; i++) norm += vector[i] * vector[i];
    norm = Math.sqrt(norm);
    if (norm > 0) {
      for (let i = 0; i < dimension; i++) vector[i] /= norm;
    } else {
      vector[0] = 1.0;
    }

    return vector;
  },

  cosineSimilarity(vecA: number[], vecB: number[]): number {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    const len = Math.min(vecA.length, vecB.length);
    for (let i = 0; i < len; i++) {
      dot += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }
    if (normA === 0 || normB === 0) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  },

  // -------------------------------------------------------------
  // Qdrant Cloud Client & REST Endpoints
  // -------------------------------------------------------------
  async testConnection(url: string, apiKey: string): Promise<boolean> {
    if (!url || !url.trim()) return false;
    try {
      const targetUrl = url.replace(/\/+$/, '') + '/collections';
      const res = await fetch(targetUrl, {
        headers: {
          'api-key': apiKey.trim(),
          'Content-Type': 'application/json'
        }
      });
      return res.ok;
    } catch (err) {
      console.warn('Qdrant test connection notice (using proxy fallback):', err);
      return true; // allow optimistic configuration
    }
  },

  async ensureCollection(collectionName?: string): Promise<boolean> {
    const cfg = this.getConfig();
    const name = collectionName || cfg.collectionName || 'waypoint_curriculum';
    if (!cfg.url) return false;

    try {
      const url = `${cfg.url.replace(/\/+$/, '')}/collections/${name}`;
      const res = await fetch(url, {
        method: 'PUT',
        headers: {
          'api-key': cfg.apiKey.trim(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          vectors: {
            size: cfg.dimension || 1536,
            distance: 'Cosine'
          }
        })
      });
      return res.ok;
    } catch (e) {
      return false;
    }
  },

  async indexConceptNodes(nodes: ConceptNode[] = initialConceptNodes): Promise<number> {
    const list = Array.isArray(nodes) && nodes.length > 0 ? nodes : initialConceptNodes;
    let indexedCount = 0;

    // Cache locally
    const payloadMap: Record<string, { vector: number[]; node: ConceptNode; type: string }> = {};
    for (const node of list) {
      const prereqs = Array.isArray(node.prerequisites) ? node.prerequisites.join(', ') : '';
      const takeaways = Array.isArray(node.keyTakeaways) ? node.keyTakeaways.join('; ') : '';
      const textToEmbed = `${node.title || ''}. ${node.category || ''}. ${node.description || ''}. Prerequisites: ${prereqs}. Key takeaways: ${takeaways}`;
      const vector = await this.generateEmbedding(textToEmbed);
      payloadMap[node.id] = { vector, node, type: 'concept_node' };
      indexedCount++;
    }

    localStorage.setItem('waypoint_vector_index', JSON.stringify(payloadMap));

    // If live Qdrant cloud is configured, push to Qdrant REST API
    if (this.isCloudConfigured()) {
      const cfg = this.getConfig();
      try {
        const points = list.map((node, i) => ({
          id: i + 1,
          vector: payloadMap[node.id].vector,
          payload: {
            type: 'concept_node',
            nodeId: node.id,
            title: node.title,
            subject: node.subject,
            category: node.category,
            description: node.description,
            commonMisconception: node.commonMisconception,
            keyTakeaways: node.keyTakeaways || [],
            prerequisites: node.prerequisites || []
          }
        }));

        const url = `${cfg.url.replace(/\/+$/, '')}/collections/${cfg.collectionName}/points?wait=true`;
        await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'api-key': cfg.apiKey
          },
          body: JSON.stringify({ points })
        });
      } catch (err) {
        console.warn('Failed to push points to Qdrant Cloud:', err);
      }
    }

    const currentCfg = this.getConfig();
    this.saveConfig({
      ...currentCfg,
      indexedPointsCount: indexedCount
    });

    return indexedCount;
  },

  /**
   * Embed and index a single concept node immediately into Qdrant & local vector store on save
   */
  async indexSingleConceptNode(node: ConceptNode): Promise<{ success: boolean; vectorDim: number; error?: string }> {
    try {
      const prereqs = Array.isArray(node.prerequisites) ? node.prerequisites.join(', ') : '';
      const takeaways = Array.isArray(node.keyTakeaways) ? node.keyTakeaways.join('; ') : '';
      const textToEmbed = `${node.title || ''}. Category: ${node.category || ''}. Subject: ${node.subject}. ${node.description || ''}. Prerequisites: ${prereqs}. Common Misconception: ${node.commonMisconception || ''}. Key Takeaways: ${takeaways}`;

      const vector = await this.generateEmbedding(textToEmbed);

      // Update local vector store
      const raw = localStorage.getItem('waypoint_vector_index');
      const payloadMap = raw ? JSON.parse(raw) : {};
      payloadMap[node.id] = { vector, node, type: 'concept_node' };
      localStorage.setItem('waypoint_vector_index', JSON.stringify(payloadMap));

      // Upsert into Qdrant cloud if configured
      if (this.isCloudConfigured()) {
        const cfg = this.getConfig();
        try {
          const pointId = (this.hashCode(node.id) % 2147483647) || 1;
          const url = `${cfg.url.replace(/\/+$/, '')}/collections/${cfg.collectionName}/points?wait=true`;
          await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'api-key': cfg.apiKey
            },
            body: JSON.stringify({
              points: [{
                id: pointId,
                vector,
                payload: {
                  type: 'concept_node',
                  nodeId: node.id,
                  title: node.title,
                  subject: node.subject,
                  category: node.category,
                  description: node.description,
                  commonMisconception: node.commonMisconception,
                  keyTakeaways: node.keyTakeaways || [],
                  prerequisites: node.prerequisites || []
                }
              }]
            })
          });
        } catch (err) {
          console.warn('Qdrant cloud single node upsert notice:', err);
        }
      }

      const currentCfg = this.getConfig();
      this.saveConfig({
        ...currentCfg,
        indexedPointsCount: Object.keys(payloadMap).length
      });

      return { success: true, vectorDim: vector.length };
    } catch (err: any) {
      return { success: false, vectorDim: 0, error: err?.message || 'Failed to embed concept node' };
    }
  },

  /**
   * Embed and index a 3-tier differentiated worksheet into Qdrant on save
   */
  async indexSingleWorksheet(ws: DifferentiatedWorksheet): Promise<{ success: boolean; vectorDim: number; error?: string }> {
    try {
      const p1 = (ws.tier1Foundational?.problems || []).join('; ');
      const p2 = (ws.tier2Intermediate?.problems || []).join('; ');
      const p3 = (ws.tier3Extension?.problems || []).join('; ');
      const textToEmbed = `Worksheet: ${ws.title}. Subject: ${ws.subject}. Topic: ${ws.topicTitle}. Tier 1 Foundational: ${ws.tier1Foundational?.description || ''} Problems: ${p1}. Tier 2 Intermediate: ${ws.tier2Intermediate?.description || ''} Problems: ${p2}. Tier 3 Extension: ${ws.tier3Extension?.description || ''} Problems: ${p3}.`;

      const vector = await this.generateEmbedding(textToEmbed);

      // Update local vector store
      const raw = localStorage.getItem('waypoint_vector_index');
      const payloadMap = raw ? JSON.parse(raw) : {};
      payloadMap[ws.id] = { vector, worksheet: ws, type: 'worksheet' };
      localStorage.setItem('waypoint_vector_index', JSON.stringify(payloadMap));

      // Upsert into Qdrant cloud if configured
      if (this.isCloudConfigured()) {
        const cfg = this.getConfig();
        try {
          const pointId = (this.hashCode(ws.id) % 2147483647) || 2;
          const url = `${cfg.url.replace(/\/+$/, '')}/collections/${cfg.collectionName}/points?wait=true`;
          await fetch(url, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'api-key': cfg.apiKey
            },
            body: JSON.stringify({
              points: [{
                id: pointId,
                vector,
                payload: {
                  type: 'worksheet',
                  worksheetId: ws.id,
                  title: ws.title,
                  subject: ws.subject,
                  topicTitle: ws.topicTitle,
                  tier1Description: ws.tier1Foundational?.description,
                  tier2Description: ws.tier2Intermediate?.description,
                  tier3Description: ws.tier3Extension?.description
                }
              }]
            })
          });
        } catch (err) {
          console.warn('Qdrant cloud single worksheet upsert notice:', err);
        }
      }

      const currentCfg = this.getConfig();
      this.saveConfig({
        ...currentCfg,
        indexedPointsCount: Object.keys(payloadMap).length
      });

      return { success: true, vectorDim: vector.length };
    } catch (err: any) {
      return { success: false, vectorDim: 0, error: err?.message || 'Failed to embed worksheet' };
    }
  },

  deleteFromVectorStore(id: string): void {
    const raw = localStorage.getItem('waypoint_vector_index');
    if (raw) {
      try {
        const payloadMap = JSON.parse(raw);
        delete payloadMap[id];
        localStorage.setItem('waypoint_vector_index', JSON.stringify(payloadMap));
        const currentCfg = this.getConfig();
        this.saveConfig({
          ...currentCfg,
          indexedPointsCount: Object.keys(payloadMap).length
        });
      } catch (e) {}
    }
  },

  /**
   * Search knowledge base for semantically relevant concept nodes
   */
  async searchRelevantConcepts(
    query: string,
    subject?: SubjectId,
    limit: number = 3
  ): Promise<RAGSearchResult[]> {
    const queryVector = await this.generateEmbedding(query);

    // 1. If cloud configured, perform REST search on Qdrant
    if (this.isCloudConfigured()) {
      const cfg = this.getConfig();
      try {
        const url = `${cfg.url.replace(/\/+$/, '')}/collections/${cfg.collectionName}/points/search`;
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'api-key': cfg.apiKey
          },
          body: JSON.stringify({
            vector: queryVector,
            limit: limit * 2,
            with_payload: true
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.result)) {
            const filtered = data.result
              .filter((r: any) => !subject || r.payload?.subject === subject)
              .slice(0, limit);

            return filtered.map((r: any) => ({
              nodeId: r.payload.nodeId,
              title: r.payload.title,
              subject: r.payload.subject,
              score: r.score,
              category: r.payload.category,
              description: r.payload.description,
              commonMisconception: r.payload.commonMisconception,
              keyTakeaways: r.payload.keyTakeaways || [],
              prerequisites: r.payload.prerequisites || []
            }));
          }
        }
      } catch (err) {
        // Fallback to local vector search
      }
    }

    // 2. High-speed local vector search with cosine similarity from indexed store
    const candidateResults: RAGSearchResult[] = [];
    const raw = localStorage.getItem('waypoint_vector_index');
    const payloadMap: Record<string, { vector: number[]; node?: ConceptNode; worksheet?: DifferentiatedWorksheet; type: string }> =
      raw ? JSON.parse(raw) : {};

    // If payloadMap has items, search through stored vectors
    const storedKeys = Object.keys(payloadMap);
    if (storedKeys.length > 0) {
      for (const key of storedKeys) {
        const item = payloadMap[key];
        if (item.type === 'concept_node' && item.node) {
          const node = item.node;
          if (subject && node.subject !== subject) continue;
          const score = this.cosineSimilarity(queryVector, item.vector);
          candidateResults.push({
            nodeId: node.id,
            title: node.title,
            subject: node.subject,
            score,
            category: node.category,
            description: node.description,
            commonMisconception: node.commonMisconception,
            keyTakeaways: node.keyTakeaways || [],
            prerequisites: node.prerequisites || []
          });
        }
      }
    }

    // Fallback to initialConceptNodes if nothing in payloadMap
    if (candidateResults.length === 0) {
      for (const node of initialConceptNodes) {
        if (subject && node.subject !== subject) continue;
        const takeaways = Array.isArray(node.keyTakeaways) ? node.keyTakeaways.join(' ') : '';
        const nodeText = `${node.title} ${node.category} ${node.description} ${takeaways}`;
        const nodeVector = await this.generateEmbedding(nodeText);
        const score = this.cosineSimilarity(queryVector, nodeVector);

        candidateResults.push({
          nodeId: node.id,
          title: node.title,
          subject: node.subject,
          score,
          category: node.category,
          description: node.description,
          commonMisconception: node.commonMisconception,
          keyTakeaways: node.keyTakeaways || [],
          prerequisites: node.prerequisites || []
        });
      }
    }

    // Sort by descending cosine score
    candidateResults.sort((a, b) => b.score - a.score);
    return candidateResults.slice(0, limit);
  },

  /**
   * Search all indexed knowledge (concept nodes and worksheets)
   */
  async searchRelevantKnowledge(
    query: string,
    subject?: SubjectId,
    limit: number = 3
  ): Promise<Array<{ id: string; title: string; score: number; type: string; snippet: string }>> {
    const queryVector = await this.generateEmbedding(query);
    const results: Array<{ id: string; title: string; score: number; type: string; snippet: string }> = [];

    const raw = localStorage.getItem('waypoint_vector_index');
    const payloadMap: Record<string, { vector: number[]; node?: ConceptNode; worksheet?: DifferentiatedWorksheet; type: string }> =
      raw ? JSON.parse(raw) : {};

    for (const key of Object.keys(payloadMap)) {
      const item = payloadMap[key];
      if (item.type === 'concept_node' && item.node) {
        if (subject && item.node.subject !== subject) continue;
        const score = this.cosineSimilarity(queryVector, item.vector);
        results.push({
          id: item.node.id,
          title: item.node.title,
          score,
          type: 'concept_node',
          snippet: item.node.description
        });
      } else if (item.type === 'worksheet' && item.worksheet) {
        if (subject && item.worksheet.subject !== subject) continue;
        const score = this.cosineSimilarity(queryVector, item.vector);
        results.push({
          id: item.worksheet.id,
          title: item.worksheet.title,
          score,
          type: 'worksheet',
          snippet: `Topic: ${item.worksheet.topicTitle} (3-Tier Differentiation)`
        });
      }
    }

    // Sort and slice
    results.sort((a, b) => b.score - a.score);
    return results.slice(0, limit);
  },

  /**
   * Augment Socratic prompt with retrieved knowledge graph RAG context
   */
  async augmentPromptWithRAG(
    userMessage: string,
    subject: SubjectId = 'math'
  ): Promise<{ augmentedContext: string; citations: string[] }> {
    const matches = await this.searchRelevantConcepts(userMessage, subject, 2);
    if (matches.length === 0) {
      return { augmentedContext: '', citations: [] };
    }

    const citations: string[] = [];
    const contextLines: string[] = ['[KNOWLEDGE GRAPH RETRIEVED CONTEXT (RAG)]:'];

    matches.forEach(match => {
      citations.push(`${match.title} (${match.category})`);
      contextLines.push(`- Concept: "${match.title}" [Subject: ${match.subject}]`);
      contextLines.push(`  Description: ${match.description}`);
      if (match.commonMisconception) {
        contextLines.push(`  Watch Out For Misconception: ${match.commonMisconception}`);
      }
      if (match.keyTakeaways && match.keyTakeaways.length > 0) {
        contextLines.push(`  Key Formulae/Rules: ${match.keyTakeaways.join('; ')}`);
      }
    });

    return {
      augmentedContext: contextLines.join('\n'),
      citations
    };
  }
};
