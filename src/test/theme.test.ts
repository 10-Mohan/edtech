import { describe, it, expect } from 'vitest';
import { MONOCHROME_THEMES } from '../components/common/ThemeSelectorModal';

describe('Monochrome Single-Tone Theme Engine', () => {
  it('contains exactly 9 distinct monochrome color themes', () => {
    expect(MONOCHROME_THEMES.length).toBe(9);
  });

  it('includes classic and modern themes with valid hex swatches', () => {
    const ids = MONOCHROME_THEMES.map(t => t.id);
    expect(ids).toContain('indigo');
    expect(ids).toContain('emerald');
    expect(ids).toContain('teal');
    expect(ids).toContain('coral');
    expect(ids).toContain('plum');
    expect(ids).toContain('slate');
    expect(ids).toContain('amber');
    expect(ids).toContain('rose');
    expect(ids).toContain('graphite');

    MONOCHROME_THEMES.forEach(theme => {
      expect(theme.name).toBeDefined();
      expect(theme.swatch).toMatch(/^#[0-9a-fA-F]{6}$/);
      expect(theme.subname).toBe('single-tone');
    });
  });
});
