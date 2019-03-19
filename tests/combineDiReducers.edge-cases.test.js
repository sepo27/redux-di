/* @flow */
/* eslint-disable arrow-body-style */

import type { AnyRealValue, PlainAction } from '../src/types';
import { combineDiReducers, makePlainReducer, makeDiReducer, DiChanges } from '../src';

const
  DUMMY_ACTION = 'DUMMY_ACTION',
  DO_UPDATE_ACTION = 'DO_UPDATE_ACTION';

const
  dummyAction = () => ({type: DUMMY_ACTION}),
  doUpdateAction = () => ({type: DO_UPDATE_ACTION});

describe('exCombineReducers() edge cases', () => {
  it('should error out when invalid reducer type', () => {
    [1, 'str', true, false, NaN, null, undefined].forEach(val => expect(() =>
      combineDiReducers({
        foo: (state: string, action: PlainAction) => `${state} + ${action.type}`,

        bar: val,
      })({ foo: 'foo value', bar: 'var value' }, { type: DUMMY_ACTION })).toThrowError('Invalid reducer type'));
  });

  it('should error out when state at path is not an object', () => {
    const
      state = 'blah',
      tree = {
        bar: (rstate: string, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
        ),
      },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError("Expecting state at '[root]' to be object");
  });

  it('should error out when state at path is not an object #2', () => {
    const
      state = {
        foo: 1,
      },
      tree = {
        foo: {
          bar: (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
          ),
        },
      },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError("Expecting state at '@foo' to be object");
  });

  it('should handle falsy state values', () => {
    const
      state = {
        foo: null,
        bar: 0,
        baz: true,
        fox: 'fox value',
        qux: '',
        abs: {},
        xyz: [],
      },
      tree = {
        foo: makePlainReducer(null, (rstate: string | null, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? rstate && `${rstate} updated` : rstate
        )),
        bar: makePlainReducer(0, (rstate: number, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? rstate + 1 : rstate
        )),
        baz: makePlainReducer(false, (rstate: boolean, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? !rstate : rstate
        )),
        fox: makeDiReducer('initial fox', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => (
          action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate
        )),
        qux: makePlainReducer('', (rstate: string, action: PlainAction) => (
          action.type === DUMMY_ACTION ? `${rstate} updated` : rstate
        )),
        abs: makePlainReducer({}, (rstate: Object, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? {...rstate, key: 'updated'} : rstate
        )),
        xyz: makeDiReducer(
          [],
          {baz: '@baz', foo: '@foo', bar: '@bar'},
          (rstate: Array<AnyRealValue>, action: PlainAction, {baz, foo, bar}) => (
            action.type === DO_UPDATE_ACTION && baz === true ? [...rstate, foo] : [...rstate, bar]
          ),
        ),
      },
      action = doUpdateAction();

    expect(combineDiReducers(tree)(state, action)).toEqual({
      foo: null,
      bar: 1,
      baz: false,
      fox: 'null fox value updated',
      qux: '',
      abs: {key: 'updated'},
      xyz: [1],
    });
  });

  it('should initialze with falsy values', () => {
    const
      state = undefined,
      tree = {
        foo: makePlainReducer(null, (rstate: string | null) => rstate),
        bar: makeDiReducer(0, {}, (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate)),
        baz: makePlainReducer(false, (rstate: boolean) => rstate),
        fox: makeDiReducer('', {}, (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate)),
      },
      action = dummyAction();

    expect(combineDiReducers(tree)(state, action)).toEqual({
      foo: null,
      bar: 0,
      baz: false,
      fox: '',
    });
  });

  it('should error out if NaN is given as initial state value', () => {
    const
      state = undefined,
      tree = { foo: makePlainReducer(NaN, (rstate: number) => rstate) },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError('NaN is invalid initial state value');
  });

  it('should error out if NaN is given as initial state value #2', () => {
    const
      state = undefined,
      tree = { foo: makeDiReducer(NaN, {}, (rstate: number) => rstate) },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError('NaN is invalid initial state value');
  });

  it('should create initial state state', () => {
    const
      state = undefined,
      tree = {
        bar: makePlainReducer(
          'initial bar',
          (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
          ),
        ),
      },
      action = dummyAction();

    expect(combineDiReducers(tree)(state, action)).toEqual({
      bar: 'initial bar',
    });
  });

  it('should create initial state state #2', () => {
    const
      state = undefined,
      tree = {
        bar: makePlainReducer(
          'initial bar',
          (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
          ),
        ),
        baz: makeDiReducer('initial baz', {}, (rstate: string, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
        )),
      },
      action = dummyAction();

    expect(combineDiReducers(tree)(state, action)).toEqual({
      bar: 'initial bar',
      baz: 'initial baz',
    });
  });

  it('should create initial state state #3', () => {
    const
      state = undefined,
      tree = {
        foo: {
          bar: makePlainReducer(
            'initial bar',
            (rstate: string, action: PlainAction) => (
              action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
            ),
          ),
        },
        baz: makeDiReducer('initial baz', {}, (rstate: string, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
        )),
      },
      action = dummyAction();

    expect(combineDiReducers(tree)(state, action)).toEqual({
      foo: {
        bar: 'initial bar',
      },
      baz: 'initial baz',
    });
  });

  it('should create initial state state #4', () => {
    const
      state = undefined,
      tree = {
        foo: {
          bar: makePlainReducer(
            'initial bar',
            () => (rstate: string, action: PlainAction) => (
              action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
            ),
          ),
        },
        baz: {
          fox: makeDiReducer('initial fox', {}, (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
          )),
        },
      },
      action = dummyAction();

    expect(combineDiReducers(tree)(state, action)).toEqual({
      foo: {
        bar: 'initial bar',
      },
      baz: {
        fox: 'initial fox',
      },
    });
  });

  it('should create initial state state #5', () => {
    const
      state = undefined,
      reducerTree = {
        foo: makePlainReducer('initial foo', (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? 'foo updated' : rstate;
        }),
        bar: makeDiReducer(
          'initial bar',
          {foo: '@foo'},
          (rstate: string, action: PlainAction, {foo}, changes: DiChanges) => {
            return changes.yes() ? `bar updated ${foo}` : rstate;
          },
        ),
      },
      action = dummyAction();

    expect(combineDiReducers(reducerTree)(state, action)).toEqual({
      foo: 'initial foo',
      bar: 'initial bar',
    });
  });

  it('should error out if no initial state provided', () => {
    const
      state = undefined,
      tree = {
        bar: (rstate: string) => rstate,
      },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError(
      /Reducer "[^"]*" returned undefined during initialization/,
    );
  });

  it('should error out if no initial state provided #2', () => {
    const
      state = undefined,
      tree = {
        bar: (rstate: string, action: PlainAction) => (action.type === DO_UPDATE_ACTION ? 'state updated' : rstate),
      },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError(
      /Reducer "[^"]*" returned undefined during initialization/,
    );
  });

  it('should error out if no initial state provided #3', () => {
    const
      state = undefined,
      tree = {
        foo: makePlainReducer(
          'initial foo',
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
        ),
        bar: (rstate: string, action: PlainAction) => (action.type === DO_UPDATE_ACTION ? 'state updated' : rstate),
      },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError(
      /Reducer "[^"]*" returned undefined during initialization/,
    );
  });

  it('should error out if no initial state provided #4', () => {
    const
      state = undefined,
      tree = {
        foo: makePlainReducer(
          'initial foo',
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
        ),
        bar: {
          baz: (rstate: string, action: PlainAction) => (action.type === DO_UPDATE_ACTION ? 'state updated' : rstate),
        },
      },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError(
      /Reducer "[^"]*" returned undefined during initialization/,
    );
  });

  it('should error out if no initial state provided #5', () => {
    const
      state = undefined,
      tree = {
        fox: makeDiReducer(undefined, {}, (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate)),
      },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError(
      /Reducer "[^"]*" returned undefined during initialization/,
    );
  });

  it('should error out if no initial state provided #6', () => {
    const
      state = undefined,
      tree = {
        foo: {
          bar: makeDiReducer(
            undefined,
            {},
            (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
          ),
        },
      },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError(
      /Reducer "[^"]*" returned undefined during initialization/,
    );
  });

  it('should error out if dependency reducer does not exist', () => {
    const
      state = {
        foo: 'previous foo',
      },
      tree = {
        foo: makeDiReducer(
          'initial foo',
          {bar: '@bar'},
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
        ),
      },
      action = dummyAction();
    expect(() => combineDiReducers(tree)(state, action)).toThrowError('Missing dependency reducer');
  });

  it('should error out if dependency reducer does not exist #2', () => {
    const
      state = {
        foo: 'previous foo',
      },
      tree = {
        foo: makeDiReducer(
          'initial foo',
          {bar: '@bar.baz'},
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
        ),
        bar: makePlainReducer('initial bar', (rstate: string, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? 'bar updated' : rstate
        )),
      },
      action = dummyAction();
    expect(() => combineDiReducers(tree)(state, action)).toThrowError('Missing dependency reducer');
  });

  it('should error out if dependency cannot be fulfilled', () => {
    const
      state = {
        foo: 'previous foo',
        bar: 'previous bar',
      },
      tree = {
        foo: makePlainReducer('initial foo', () => undefined),
        bar: makeDiReducer('initial bar', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => (
          action.type === DO_UPDATE_ACTION ? `bar updated ${foo}` : rstate
        )),
      },
      action = dummyAction();
    expect(() => combineDiReducers(tree)(state, action)).toThrowError('Could not resolve dependency');
  });

  it('should error out if circular dependency to ancestor', () => {
    const
      state = {
        foo: {
          bar: 'previous bar',
        },
      },
      tree = {
        foo: {
          bar: makeDiReducer('initial bar', {foo: '@foo'}, (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? 'bar updated' : rstate
          )),
        },
      },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action))
      .toThrowError('Circular dependency detected');
  });

  it('should error out if circular dependency to ancestor #2', () => {
    const
      state = {
        foo: {
          bar: {
            baz: 'previous baz',
          },
        },
      },
      tree = {
        foo: {
          bar: {
            baz: makeDiReducer('initial baz', {bar: '@foo.bar'}, (rstate: string, action: PlainAction) => (
              action.type === DO_UPDATE_ACTION ? 'bar updated' : rstate
            )),
          },
        },
      },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError('Circular dependency detected');
  });

  it('should error out if circular dependency to itself', () => {
    const
      state = {
        foo: 'foo value',
      },
      tree = {
        foo: makeDiReducer(
          'initial foo',
          {foo: '@foo'},
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
        ),
      },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError('Circular dependency detected');
  });

  it('should error out if circular dependency to itself #2', () => {
    const
      state = {
        foo: {
          bar: 'bar value',
        },
      },
      tree = {
        foo: {
          bar: makeDiReducer(
            'initial bar',
            {bar: '@foo.bar'},
            (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
          ),
        },
      },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError('Circular dependency detected');
  });

  it('should error out if circular dependency chain', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
      },
      tree = {
        foo: makeDiReducer(
          'initial foo',
          {bar: '@bar'},
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
        ),
        bar: makeDiReducer('initial bar',
          {foo: '@foo'},
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
        ),
      },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError('Circular dependency detected');
  });

  it('should error out if circular dependency chain #2', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
        baz: 'baz value',
      },
      tree = {
        foo: makeDiReducer(
          'initial foo',
          {bar: '@bar'},
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
        ),
        bar: makeDiReducer(
          'initial bar',
          {baz: '@baz'},
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
        ),
        baz: makeDiReducer(
          'initial bar',
          {foo: '@foo'},
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
        ),
      },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError('Circular dependency detected');
  });

  it('should error out if circular dependency chain #N', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
          baz2: {
            baz21: 'baz21 value',
          },
        },
        fox: {
          qux: {
            qux2: {
              qux21: 'qux21 value',
            },
            qux1: 'qux1 value',
          },
        },
      },
      tree = {
        foo: makeDiReducer(
          'initial foo',
          {baz21: '@bar.baz2.baz21'},
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
        ),
        bar: {
          baz: makePlainReducer('initial baz', (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? 'baz updated' : rstate
          )),
          baz2: {
            baz21: makeDiReducer(
              'initial baz2',
              {baz: '@bar.baz', fox: '@fox'},
              (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
            ),
          },
        },
        fox: {
          qux: {
            qux2: {
              qux21: makeDiReducer(
                'initial qux 21',
                {qux1: '@fox.qux.qux1'},
                (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
              ),
            },
            qux1: makeDiReducer(
              'initial qux1',
              {baz2: '@bar.baz2'},
              (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate),
            ),
          },
        },
      },
      action = dummyAction();

    expect(() => combineDiReducers(tree)(state, action)).toThrowError('Circular dependency detected');
  });

  it('should error out if dependency path has invalid format', () => {
    const
      state = {
        foo: 'foo',
        bar: 'bar',
      },
      action = dummyAction(),
      invalidChars = '!#$%&*()_+-=/\\',
      invalidPaths = ['bar'].concat(invalidChars.split().map(ch => `${ch}bar`));

    invalidPaths.forEach(path => {
      expect(() => combineDiReducers({
        foo: makeDiReducer(
          'initial foo',
          {bar: path},
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate), // eslint-disable-line no-shadow
        ),
      })(state, action)).toThrowError(`Invalid path format given: '${path}'`);
    });
  });

  it('should error out if relative dependency path is invalid', () => {
    const
      state = {
        foo: 'foo',
        bar: 'bar',
      },
      action = dummyAction(),
      reducerTree = {
        foo: makePlainReducer(
          'initial foo',
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate), // eslint-disable-line no-shadow
        ),
        bar: makeDiReducer(
          'initial bar',
          {foo: '^foo'},
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate), // eslint-disable-line no-shadow
        ),
      };

    expect(() => combineDiReducers(reducerTree)(state, action))
      .toThrowError("Failed to level up for relative path '^foo'. Consider using absolute '@' notation instead");
  });

  it('should error out if absolute dependency path is invalid', () => {
    const
      state = {
        foo: 'foo',
        bar: 'bar',
      },
      action = dummyAction(),
      reducerTree = {
        foo: makePlainReducer(
          'initial foo',
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate), // eslint-disable-line no-shadow
        ),
        bar: makeDiReducer(
          'initial bar',
          {foo: '@'},
          (rstate, action) => (action.type === DUMMY_ACTION ? DUMMY_ACTION : rstate), // eslint-disable-line no-shadow
        ),
      };

    expect(() => combineDiReducers(reducerTree)(state, action))
      .toThrowError("Absolute path '@' is invalid.");
  });

  it('should error out if changes.for() is undefined', () => {
    let depsChanges;
    const
      state = {
        foo: 'foo',
        bar: 'bar',
      },
      reducerTree = {
        foo: makePlainReducer('initial foo', (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? 'foo updated' : rstate;
        }),
        bar: makeDiReducer(
          {key: 'initial bar'},
          {foo: '@foo'},
          (rstate: Object, action: PlainAction, {foo}, changes: DiChanges) => {
            depsChanges = changes;
            if (changes.yes()) return foo;
            return rstate;
          }),
      },
      action = doUpdateAction();

    combineDiReducers(reducerTree)(state, action);

    // assert changes
    expect(() => depsChanges.for('dummy')).toThrowError("Change for 'dummy' is undefined");
  });
});
