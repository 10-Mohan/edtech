import React, { useState } from 'react';
import { ChatMessage, ConceptNode } from '../../types';
import {
  evaluateFeynmanExplanationAsync,
  generateSocraticResponseAsync
} from '../../services/aiEngine';
import { AIProviderService } from '../../services/aiProvider';
import { MathRenderer } from '../common/MathRenderer';
import {
  Send,
  Sparkles,
  Bot,
  User,
  GraduationCap,
  MessageSquare,
  Award,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Zap,
  Activity
} from 'lucide-react';

interface SocraticTutorProps {
  initialTopic?: ConceptNode | null;
  onAddXP: (amount: number) => void;
}

export const SocraticTutor: React.FC<SocraticTutorProps> = ({
  initialTopic,
  onAddXP
}) => {
  const [tutorMode, setTutorMode] = useState<'socratic' | 'feynman'>('socratic');
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  const isLiveAI = AIProviderService.isLiveProviderActive();
  const providerName = AIProviderService.getActiveProviderName();

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_01',
      sender: 'assistant',
      text: initialTopic
        ? `Hello! I see you are exploring **${initialTopic.title}**. What specific problem or intuition would you like to investigate together?`
        : `Hello! I'm your Waypoint AI Tutor. Would you like to investigate a tough topic using step-by-step **Socratic Inquiry**, or test your mastery by **teaching me in Feynman Mode**?`,
      timestamp: 'Just now',
      mode: 'socratic'
    }
  ]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isTyping) return;

    const userText = inputMessage.trim();
    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: 'Just now',
      mode: tutorMode
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);

    try {
      if (tutorMode === 'feynman') {
        const feedback = await evaluateFeynmanExplanationAsync(
          initialTopic ? initialTopic.title : 'Calculus Concepts',
          userText
        );
        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: feedback ? `${feedback.praise} ${feedback.suggestion || ''}` : 'Thank you for your explanation!',
          timestamp: 'Just now',
          mode: 'feynman',
          feynmanFeedback: feedback
        };
        setMessages(prev => [...prev, aiMsg]);
        onAddXP(30);
      } else {
        const reply = await generateSocraticResponseAsync(userText, initialTopic?.title);
        const aiMsg: ChatMessage = {
          id: `ai_${Date.now()}`,
          sender: 'assistant',
          text: reply,
          timestamp: 'Just now',
          mode: 'socratic'
        };
        setMessages(prev => [...prev, aiMsg]);
        onAddXP(15);
      }
    } catch (err) {
      console.error('Tutor error:', err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputMessage(prompt);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Top Mode Selection Header */}
      <div className="glass-panel" style={{ padding: '24px 28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>AI Pedagogical Companion</h1>
              <span className={`badge ${tutorMode === 'socratic' ? 'badge-indigo' : 'badge-emerald'}`}>
                {tutorMode === 'socratic' ? 'Socratic Inquiry' : 'Feynman Teach-Back'}
              </span>
              <span className={`badge ${isLiveAI ? 'badge-emerald' : 'badge-cyan'}`} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Activity size={12} />
                {isLiveAI ? `Live LLM: ${providerName}` : 'Deterministic Heuristic'}
              </span>
            </div>
            <p style={{ margin: 0 }}>
              {tutorMode === 'socratic'
                ? 'The AI asks targeted questions to guide you to first-principles understanding rather than giving away answers.'
                : 'Teach the concept in your own words as if explaining to a beginner. The AI will grade your clarity and detect missing key mechanisms.'}
            </p>
          </div>

          {/* Mode Switcher */}
          <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', padding: '4px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <button
              onClick={() => setTutorMode('socratic')}
              className="btn btn-sm"
              style={{
                background: tutorMode === 'socratic' ? 'var(--primary-gradient)' : 'transparent',
                color: tutorMode === 'socratic' ? '#fff' : 'var(--text-muted)'
              }}
            >
              <MessageSquare size={15} />
              <span>Socratic Mode</span>
            </button>
            <button
              onClick={() => setTutorMode('feynman')}
              className="btn btn-sm"
              style={{
                background: tutorMode === 'feynman' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'transparent',
                color: tutorMode === 'feynman' ? '#fff' : 'var(--text-muted)'
              }}
            >
              <GraduationCap size={15} />
              <span>Feynman Mode ("Teach Me")</span>
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div
        className="glass-panel"
        style={{
          minHeight: '480px',
          maxHeight: '600px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '24px',
          position: 'relative'
        }}
      >
        <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px', paddingRight: '6px' }}>
          {messages.map(msg => {
            const isAi = msg.sender === 'assistant';

            return (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '14px',
                  alignItems: 'flex-start',
                  maxWidth: isAi ? '85%' : '75%',
                  alignSelf: isAi ? 'flex-start' : 'flex-end',
                  flexDirection: isAi ? 'row' : 'row-reverse'
                }}
              >
                {/* Avatar Icon */}
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '10px',
                    background: isAi ? (msg.mode === 'feynman' ? 'linear-gradient(135deg, #10b981, #059669)' : 'var(--primary-gradient)') : 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                    flexShrink: 0
                  }}
                >
                  {isAi ? <Bot size={18} /> : <User size={18} />}
                </div>

                {/* Message Bubble */}
                <div
                  style={{
                    background: isAi ? 'var(--bg-glass-card)' : 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                    border: isAi ? '1px solid var(--border-medium)' : 'none',
                    borderRadius: 'var(--radius-lg)',
                    padding: '14px 18px',
                    boxShadow: 'var(--shadow-sm)',
                    color: '#f8fafc'
                  }}
                >
                  <div style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                    <MathRenderer text={msg.text} />
                  </div>

                  {/* Feynman Feedback Rubric Card if present */}
                  {msg.feynmanFeedback && (
                    <div
                      className="animate-fade-in"
                      style={{
                        marginTop: '14px',
                        padding: '14px',
                        background: 'rgba(16, 185, 129, 0.08)',
                        border: '1px solid rgba(16, 185, 129, 0.25)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#6ee7b7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Award size={15} /> Feynman Rubric Score
                        </span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <span className="badge badge-emerald">
                            Comprehension: {msg.feynmanFeedback.comprehensionScore}%
                          </span>
                          <span className="badge badge-cyan">
                            Clarity: {msg.feynmanFeedback.clarityScore}%
                          </span>
                        </div>
                      </div>

                      <div style={{ fontSize: '0.8125rem', marginBottom: '8px' }}>
                        <strong style={{ color: '#94a3b8' }}>Missing Key Nuances:</strong>
                        <ul style={{ paddingLeft: '18px', marginTop: '4px', color: '#cbd5e1' }}>
                          {msg.feynmanFeedback.missingKeyPoints.map((pt, i) => (
                            <li key={i}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  <div style={{ fontSize: '0.68rem', color: isAi ? 'var(--text-dim)' : 'rgba(255, 255, 255, 0.7)', marginTop: '6px', textAlign: isAi ? 'left' : 'right' }}>
                    {msg.timestamp}
                  </div>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', color: 'var(--text-dim)', fontSize: '0.8125rem', paddingLeft: '50px' }}>
              <Sparkles size={14} className="animate-spin" />
              <span>Waypoint AI is formulating a pedagogical response...</span>
            </div>
          )}
        </div>

        {/* Quick Suggestion Chips */}
        <div style={{ paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            <button
              onClick={() => handleQuickPrompt('Why do we need the chain rule when differentiating composite functions?')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
            >
              <Lightbulb size={12} color="#fbbf24" /> Why does the Chain Rule work?
            </button>
            <button
              onClick={() => handleQuickPrompt('How does a matrix rotate coordinate vectors geometrically?')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
            >
              <Zap size={12} color="#22d3ee" /> Matrix Transformation Intuition
            </button>
            <button
              onClick={() => handleQuickPrompt('Can you test if I understand Limits using an edge case?')}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: '0.75rem', borderRadius: 'var(--radius-full)' }}
            >
              <Sparkles size={12} color="#a855f7" /> Test my understanding of Limits
            </button>
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              placeholder={
                tutorMode === 'socratic'
                  ? 'Ask a question or share your line of thinking...'
                  : 'Explain the concept simply in your own words...'
              }
              style={{
                flex: 1,
                padding: '12px 18px',
                borderRadius: 'var(--radius-lg)',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-medium)',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={isTyping}
              className="btn btn-primary"
              style={{ padding: '0 20px' }}
            >
              <Send size={16} />
              <span>Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
