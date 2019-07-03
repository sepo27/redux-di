import { resolveArrPath } from './path';

describe('resolveArrPath', () => {
  it('resolves arr paths', () => {
    expect(resolveArrPath(['foo'], ['bar'])).toEqual(['foo', 'bar']);
  });
});
