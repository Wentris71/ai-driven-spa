import {normalizeSlug} from './index';

describe('normalizeSlug', () => {
  it('trims and lowercases', () => {
    expect(normalizeSlug('  Hello-World ')).toBe('hello-world');
  });

  it('leaves a clean slug untouched', () => {
    expect(normalizeSlug('clean-slug')).toBe('clean-slug');
  });
});
