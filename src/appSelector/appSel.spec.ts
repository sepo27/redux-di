import { appSel } from './appSel';

describe('appSel', () => {
  it('remembers the path', () => {
    const sel = appSel(['foo', 'bar']);

    expect(sel._path).toEqual(['foo', 'bar']); // eslint-disable-line no-underscore-dangle
  });

  it('implements toStrPath', () => {
    const sel = appSel(['foo', 'bar']);

    expect(sel.toStrPath()).toEqual('foo.bar'); // eslint-disable-line no-underscore-dangle
  });

  it('selects the value', () => {
    const sel = appSel(['foo', 'bar']);
    expect(sel({ foo: { bar: 'the value' } })).toEqual('the value');
  });
});
