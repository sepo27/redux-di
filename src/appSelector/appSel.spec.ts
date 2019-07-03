import { appSel } from './appSel';

describe('appSel', () => {
  it('remembers the path', () => {
    const sel = appSel(['foo', 'bar']);

    expect(sel._path).toEqual(['foo', 'bar']); // eslint-disable-line no-underscore-dangle
  });

  it('implements toString()', () => {
    const sel = appSel(['foo', 'bar']);

    expect(sel.toString()).toEqual('foo.bar'); // eslint-disable-line no-underscore-dangle
  });

  it('selects the value', () => {
    const sel = appSel(['foo', 'bar']);
    expect(sel({ foo: { bar: 'the value' } })).toEqual('the value');
  });

  xit('spawns nested selector', () => {
    const
      fooSel = appSel(['foo']),
      fooBarSel = fooSel.spawn(['bar']);

    expect(fooBarSel({ foo: { bar: 'the bar' } })).toEqual('the bar');
  });
});
