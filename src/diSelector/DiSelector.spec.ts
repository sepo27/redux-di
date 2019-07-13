import { DiSelector } from './DiSelector';
import { ReduxDiError } from '../utils/ReduxDiError';
import { dummyAction, UPDATE_ACTION, updateAction } from '../../tests/actions';

describe('DiSelector resolves absolute', () => {
  it('str path', () => {
    const selector = new DiSelector('@foo');

    expect(selector.path).toEqual(['foo']);
    expect(selector.isAbsolute).toBeTruthy();
    expect(selector.isRelative).toBeFalsy();
  });

  it('compound str path', () => {
    const selector = new DiSelector('@foo.bar.baz');

    expect(selector.path).toEqual(['foo', 'bar', 'baz']);
    expect(selector.isAbsolute).toBeTruthy();
    expect(selector.isRelative).toBeFalsy();
  });

  it('arr path', () => {
    const selector = new DiSelector(['@foo']);

    expect(selector.path).toEqual(['foo']);
    expect(selector.isAbsolute).toBeTruthy();
    expect(selector.isRelative).toBeFalsy();
  });

  it('compound arr path', () => {
    const selector = new DiSelector(['@foo', 'bar', 'baz']);

    expect(selector.path).toEqual(['foo', 'bar', 'baz']);
    expect(selector.isAbsolute).toBeTruthy();
    expect(selector.isRelative).toBeFalsy();
  });
});

describe('DiSelector resolves relative', () => {
  it('str path', () => {
    const selector = new DiSelector('.foo');

    expect(selector.path).toEqual(['foo']);
    expect(selector.isRelative).toBeTruthy();
    expect(selector.isAbsolute).toBeFalsy();
  });

  it('compound str path', () => {
    const selector = new DiSelector('.foo.bar.baz');

    expect(selector.path).toEqual(['foo', 'bar', 'baz']);
    expect(selector.isRelative).toBeTruthy();
    expect(selector.isAbsolute).toBeFalsy();
  });

  it('arr path', () => {
    const selector = new DiSelector(['.foo']);

    expect(selector.path).toEqual(['foo']);
    expect(selector.isRelative).toBeTruthy();
    expect(selector.isAbsolute).toBeFalsy();
  });

  it('compound arr path', () => {
    const selector = new DiSelector(['.foo', 'bar', 'baz']);

    expect(selector.path).toEqual(['foo', 'bar', 'baz']);
    expect(selector.isRelative).toBeTruthy();
    expect(selector.isAbsolute).toBeFalsy();
  });
});

describe('DiSelector selects with', () => {
  it('default selector', () => {
    const selector = new DiSelector('@foo.bar');

    expect(selector.select({ baz: 'fox' })).toEqual({ baz: 'fox' });
  });

  it('custom selector', () => {
    const selector = new DiSelector('@foo.bar', {
      select: val => val.baz.fox,
    });

    expect(selector.select({ baz: { fox: 'val' } })).toEqual('val');
  });
});

describe('DiSelector errors out', () => {
  it('for invalid str path prefix', () => {
    '!#$%^&*()-'.split('').forEach(prefix => {
      expect(() => new DiSelector(`${prefix}foo`))
        .toThrow(new ReduxDiError(`Invalid path prefix: ${prefix}`));
    });
  });

  it('for invalid compound str path prefix', () => {
    '!#$%^&*()-'.split('').forEach(prefix => {
      expect(() => new DiSelector(`${prefix}foo.bar`))
        .toThrow(new ReduxDiError(`Invalid path prefix: ${prefix}`));
    });
  });

  it('for invalid arr path prefix', () => {
    '!#$%^&*()-'.split('').forEach(prefix => {
      expect(() => new DiSelector([`${prefix}foo`]))
        .toThrow(new ReduxDiError(`Invalid path prefix: ${prefix}`));
    });
  });

  it('for invalid compound arr path prefix', () => {
    '!#$%^&*()-'.split('').forEach(prefix => {
      expect(() => new DiSelector([`${prefix}foo`, 'bar']))
        .toThrow(new ReduxDiError(`Invalid path prefix: ${prefix}`));
    });
  });

  it('for empty str path', () => {
    expect(() => new DiSelector('')).toThrowError(new ReduxDiError('Empty path given to DiSelector'));
  });

  it('for empty arr path', () => {
    expect(() => new DiSelector([])).toThrowError(new ReduxDiError('Empty path given to DiSelector'));
  });
});

describe('DiSelector.toString()', () => {
  it('from str path', () => {
    const selector = new DiSelector('@bar.baz');
    expect(selector.toString()).toBe('@bar.baz');
  });

  it('from arr path', () => {
    const selector = new DiSelector(['.foo', 'bar']);
    expect(selector.toString()).toBe('.foo.bar');
  });
});

describe('DiSelector with predicate', () => {
  it('initializes default truthy predicate', () => {
    const selector = new DiSelector('@foo');
    expect(selector.predicate({ dependency: 'dummy', action: dummyAction() })).toBe(true);
  });

  it('initializes default truthy predicate when passing selector', () => {
    const selector = new DiSelector('@foo', {
      select: v => v,
    });
    expect(selector.predicate({ dependency: 'dummy', action: dummyAction() })).toBe(true);
  });

  it('is constructed with custom predicate', () => {
    const
      selector = new DiSelector('@foo', {
        predicate: ({ dependency, action }) => (
          dependency === 'bar' && action.type === UPDATE_ACTION
        ),
      });

    expect(selector.predicate({ dependency: 'bar', action: updateAction() })).toBe(true);
  });
});
