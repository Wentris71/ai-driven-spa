import {cn, tv} from './cn';

describe('cn', () => {
  it('joins conditional classes', () => {
    expect(cn('a', false && 'b', 'c')).toBe('a c');
  });

  it('resolves conflicts between custom color tokens', () => {
    expect(cn('bg-surface', 'bg-surface-alt')).toBe('bg-surface-alt');
  });

  it('resolves conflicts between type-* utilities', () => {
    expect(cn('type-body-md', 'type-title-lg')).toBe('type-title-lg');
  });
});

describe('tv', () => {
  it('builds variants with project merge config', () => {
    const button = tv({
      base: 'bg-surface',
      variants: {tone: {primary: 'bg-primary'}},
    });
    expect(button({tone: 'primary'})).toBe('bg-primary');
  });
});
