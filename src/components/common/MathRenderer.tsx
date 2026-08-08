import React from 'react';

interface MathRendererProps {
  text: string;
  className?: string;
}

/**
 * Transforms LaTeX math expressions into clean, natural human-readable mathematical notation
 * without raw LaTeX syntax like \frac, \sqrt, curly braces, etc.
 */
export function cleanMathNotation(input: string): string {
  if (!input) return '';

  let res = input;

  // 1. Recursive fraction parser (handles \frac, \\frac, \dfrac, \tfrac, etc.)
  const replaceFractions = (str: string): string => {
    let output = str;
    const fracRegex = /\\*(?:d|t)?frac\s*\{([^{}]+|\{[^{}]*\})\}\s*\{([^{}]+|\{[^{}]*\})\}/gi;
    let matchFound = true;
    let loopLimit = 0;

    while (matchFound && loopLimit < 10) {
      matchFound = false;
      loopLimit++;
      output = output.replace(fracRegex, (_match, num, den) => {
        matchFound = true;
        const cleanNum = cleanMathNotation(num.trim());
        const cleanDen = cleanMathNotation(den.trim());
        if (cleanNum.length <= 4 && cleanDen.length <= 4 && !cleanNum.includes(' ') && !cleanDen.includes(' ')) {
          return `${cleanNum} / ${cleanDen}`;
        }
        return `(${cleanNum} / ${cleanDen})`;
      });
    }

    // Handle loose single-character \frac a b
    output = output.replace(/\\*(?:d|t)?frac\s+([a-zA-Z0-9]+)\s+([a-zA-Z0-9]+)/gi, '$1 / $2');
    output = output.replace(/\\*(?:d|t)?frac\b/gi, '');
    return output;
  };

  res = replaceFractions(res);

  // 2. Square roots: \sqrt{x} -> √(x) or \sqrt[n]{x} -> ⁿ√(x)
  res = res.replace(/\\sqrt\[(.*?)\]\{(.*?)\}/g, '[$1]√($2)');
  res = res.replace(/\\sqrt\{(.*?)\}/g, '√($1)');
  res = res.replace(/\\sqrt\s+([a-zA-Z0-9]+)/g, '√($1)');

  // 3. Limits and Integrals and Sums
  res = res.replace(/\\lim_\{([^}]+)\}/g, 'lim($1)');
  res = res.replace(/\\lim\s+([^\s]+)/g, 'lim($1)');
  res = res.replace(/\\to\b/g, '→');
  res = res.replace(/\\infty\b/g, '∞');
  res = res.replace(/\\sum_\{([^}]+)\}\^\{([^}]+)\}/g, '∑[$1 to $2]');
  res = res.replace(/\\sum/g, '∑');
  res = res.replace(/\\int_\{([^}]+)\}\^\{([^}]+)\}/g, '∫[$1 to $2]');
  res = res.replace(/\\int/g, '∫');

  // 4. Greek letters
  const greekMap: Record<string, string> = {
    '\\pi': 'π',
    '\\Pi': 'Π',
    '\\theta': 'θ',
    '\\Theta': 'Θ',
    '\\alpha': 'α',
    '\\beta': 'β',
    '\\gamma': 'γ',
    '\\Gamma': 'Γ',
    '\\delta': 'δ',
    '\\Delta': 'Δ',
    '\\epsilon': 'ε',
    '\\varepsilon': 'ε',
    '\\lambda': 'λ',
    '\\Lambda': 'Λ',
    '\\mu': 'μ',
    '\\sigma': 'σ',
    '\\Sigma': 'Σ',
    '\\tau': 'τ',
    '\\phi': 'φ',
    '\\Phi': 'Φ',
    '\\psi': 'ψ',
    '\\omega': 'ω',
    '\\Omega': 'Ω'
  };

  for (const [tex, sym] of Object.entries(greekMap)) {
    res = res.replaceAll(tex, sym);
  }

  // 5. Operators & Math symbols
  res = res.replace(/\\cdot/g, ' · ');
  res = res.replace(/\\times/g, ' × ');
  res = res.replace(/\\pm/g, '±');
  res = res.replace(/\\mp/g, '∓');
  res = res.replace(/\\approx/g, '≈');
  res = res.replace(/\\leq/g, '≤');
  res = res.replace(/\\geq/g, '≥');
  res = res.replace(/\\neq/g, '≠');
  res = res.replace(/\\partial/g, '∂');
  res = res.replace(/\\nabla/g, '∇');
  res = res.replace(/\\in\b/g, '∈');
  res = res.replace(/\\notin\b/g, '∉');
  res = res.replace(/\\subset\b/g, '⊂');
  res = res.replace(/\\subseteq\b/g, '⊆');
  res = res.replace(/\\cap\b/g, '∩');
  res = res.replace(/\\cup\b/g, '∪');
  res = res.replace(/\\hat\{i\}/g, 'î');
  res = res.replace(/\\hat\{j\}/g, 'ĵ');
  res = res.replace(/\\hat\{k\}/g, 'k̂');
  res = res.replace(/\\mathbf\{([^}]+)\}/g, '$1');
  res = res.replace(/\\mathrm\{([^}]+)\}/g, '$1');
  res = res.replace(/\\text\{([^}]+)\}/g, '$1');

  // 6. Subscripts and Superscripts
  const superscripts: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
    'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ'
  };

  const subscripts: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
    '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
    'a': 'ₐ', 'e': 'ₑ', 'h': 'ₕ', 'i': 'ᵢ', 'j': 'ⱼ',
    'k': 'ₖ', 'l': 'ₗ', 'm': 'ₘ', 'n': 'ₙ', 'o': 'ₒ',
    'p': 'ₚ', 'r': 'ᵣ', 's': 'ₛ', 't': 'ₜ', 'u': 'ᵤ',
    'v': 'ᵥ', 'x': 'ₓ'
  };

  // Convert ^{...} or ^2
  res = res.replace(/\^{([^}]+)\}/g, (_m, content) => {
    return content.split('').map((c: string) => superscripts[c] || c).join('');
  });
  res = res.replace(/\^([0-9nixy])/g, (_m, c) => superscripts[c] || `^${c}`);

  // Convert _{...} or _1
  res = res.replace(/_{([^}]+)\}/g, (_m, content) => {
    return content.split('').map((c: string) => subscripts[c] || c).join('');
  });
  res = res.replace(/_([0-9aehijklmnoprstuvx])/g, (_m, c) => subscripts[c] || `_${c}`);

  // 7. Cleanup LaTeX wrappers & spacing
  res = res.replace(/\\left\(/g, '(').replace(/\\right\)/g, ')');
  res = res.replace(/\\left\[/g, '[').replace(/\\right\]/g, ']');
  res = res.replace(/\\left\\\{/g, '{').replace(/\\right\\\}/g, '}');
  res = res.replace(/\\quad/g, ' ');
  res = res.replace(/\\,/g, ' ');
  res = res.replace(/\\;/g, ' ');
  res = res.replace(/\\!/g, '');

  // Strip remaining backslashes before common functions
  res = res.replace(/\\(sin|cos|tan|cot|sec|csc|ln|log|exp|det|dim|ker|deg|max|min)\b/g, '$1');

  // Any remaining loose backslashes followed by letters
  res = res.replace(/\\([a-zA-Z]+)/g, '$1');

  return res.trim();
}

/**
 * Clean & beautiful math renderer for formulas and text
 */
export const MathRenderer: React.FC<MathRendererProps> = ({ text, className = '' }) => {
  if (!text) return null;

  // Split by math delimiters: $...$ or $$...$$
  const parts = text.split(/(\$\$[\s\S]+?\$\$|\$.+?\$)/g);

  return (
    <span className={`math-text-container ${className}`}>
      {parts.map((part, idx) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const rawMath = part.slice(2, -2).trim();
          const cleanMath = cleanMathNotation(rawMath);
          return (
            <div
              key={idx}
              className="my-3 py-2 px-4 rounded-lg font-mono text-cyan-300 bg-surface-elevated border border-subtle overflow-x-auto text-center"
              style={{
                background: 'rgba(22, 29, 48, 0.7)',
                color: '#67e8f9',
                fontFamily: 'var(--font-mono)',
                fontSize: '1rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                margin: '10px 0',
                padding: '10px 16px',
                borderRadius: '8px',
                border: '1px solid var(--border-subtle)'
              }}
            >
              {cleanMath}
            </div>
          );
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const rawMath = part.slice(1, -1).trim();
          const cleanMath = cleanMathNotation(rawMath);
          return (
            <span
              key={idx}
              className="inline-block px-1.5 py-0.5 rounded font-mono text-cyan-300 bg-opacity-20"
              style={{
                background: 'rgba(6, 182, 212, 0.12)',
                color: '#22d3ee',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.92em',
                fontWeight: 600,
                borderRadius: '4px',
                padding: '1px 6px',
                margin: '0 2px'
              }}
            >
              {cleanMath}
            </span>
          );
        }

        // Also clean any raw LaTeX that might exist outside delimiters
        const cleanedText = cleanMathNotation(part);
        return <span key={idx}>{cleanedText}</span>;
      })}
    </span>
  );
};
