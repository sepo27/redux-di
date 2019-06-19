import { DiReducer } from '../../diReducer/types'; // eslint-disable-line no-unused-vars
import { Reducer } from '../../types'; // eslint-disable-line no-unused-vars
import { combineReducers } from '../combineReducers';
import { diReducer } from '../../diReducer/diReducer';
import { dummyAction, UPDATE_ACTION, updateAction } from '../../../tests/actions';
import { isDiReducer, isPlainReducer } from '../../utils/isType';
import { strDummyTR, strUpdateDiTR, strUpdateTR } from '../../../tests/reducers';
import { DiSelector } from '../../diSelector/DiSelector';
import { initReducer } from '../..';

describe('combineReducers', () => {
  it('resolves initial state from di reducers', () => {
    const
      reducer = combineReducers({
        foo: diReducer(1, { bar: '@bar' }, s => s),
        bar: diReducer('2', { baz: '@baz' }, s => s),
      }) as DiReducer,
      dependencies = {
        'foo.bar': 'bar',
        'bar.baz': 'baz',
      };

    expect(reducer(undefined, dummyAction(), dependencies)).toEqual({
      foo: 1,
      bar: '2',
    });
  });

  it('resolves initial state from mixed reducers', () => {
    const
      reducer = combineReducers({
        foo: diReducer('2', { bar: '.bar' }, s => s),
        bar: initReducer(1, s => s),
      }) as Reducer;

    expect(reducer(undefined, dummyAction())).toEqual({
      foo: '2',
      bar: 1,
    });
  });

  it('returns di reducer with at least one di reducer with absolute path', () => {
    const reducer = combineReducers({
      foo: diReducer({ bar: '@bar' }, s => s),
    });

    expect(isDiReducer(reducer)).toBeTruthy();
  });

  it('returns plain reducer when di reducers have no absolute paths', () => {
    const reducer = combineReducers({
      foo: diReducer({ bar: '.bar' }, s => s),
    });

    expect(isPlainReducer(reducer)).toBeTruthy();
  });

  it('combines overall dependency map for di reducer', () => {
    const reducer = combineReducers({
      foo: diReducer(
        { bar: '@bar', baz: '@baz' },
        s => s,
      ),
      fox: diReducer(
        { bar: '@bar', baz: '@baz' },
        s => s,
      ),
    }) as DiReducer;

    expect(Object.keys(reducer._rdi)).toEqual([ // eslint-disable-line no-underscore-dangle
      'foo.bar',
      'foo.baz',
      'fox.bar',
      'fox.baz',
    ]);
  });

  it('updates state with di reducer', () => {
    const
      reducer = combineReducers({
        foo: diReducer({ bar: '@bar' }, strUpdateDiTR('bar')),
      }),
      state = {
        foo: 'foo',
      },
      dependencies = {
        'foo.bar': 'bar',
      },
      nextState = reducer(state, updateAction(), dependencies);

    expect(nextState === state).toBeFalsy();
    expect(nextState).toEqual({
      foo: 'foo updated + bar',
    });
  });

  it('returns the same state with di reducer', () => {
    const
      reducer = combineReducers({
        foo: diReducer({ bar: '@bar' }, strUpdateDiTR('bar')),
      }),
      state = {
        foo: 'foo',
      },
      dependencies = {
        'foo.bar': 'bar',
      };

    expect(reducer(state, dummyAction(), dependencies)).toBe(state);
  });

  it('does not call plain reducer with dependencies', () => {
    const
      fooReducer = jest.fn(s => s),
      reducer = combineReducers({
        foo: fooReducer,
        bar: diReducer<string>({ foo: '@foo' }, s => s),
      }),
      state = {
        foo: 'foo',
        bar: 'bar',
      };

    reducer(state, dummyAction(), {
      'bar.foo': 'foo',
    });

    expect(fooReducer.mock.calls[0]).toEqual([
      'foo',
      dummyAction(),
    ]);
  });

  it('resolves di on same level', () => {
    const
      reducer = combineReducers({
        foo: strUpdateTR(),
        bar: diReducer({ foo: '.foo' }, strUpdateDiTR('foo')),
      }),
      state = {
        foo: 'a foo',
        bar: 'the bar',
      },
      nextState = reducer(state, updateAction(), {});

    expect(nextState).toEqual({
      foo: 'a foo updated',
      bar: 'the bar updated + a foo updated',
    });
  });

  it('resolves di on same level irrespective order', () => {
    const
      reducer = combineReducers({
        bar: diReducer({ foo: '.foo' }, strUpdateDiTR('foo')),
        foo: strUpdateTR(),
      }),
      state = {
        foo: 'a foo',
        bar: 'the bar',
      },
      nextState = reducer(state, updateAction(), {});

    expect(nextState).toEqual({
      foo: 'a foo updated',
      bar: 'the bar updated + a foo updated',
    });
  });

  it('only calls dependant reducer once', () => {
    const
      fooReducer = jest.fn(strUpdateTR()),
      reducer = combineReducers({
        bar: diReducer({ foo: '.foo' }, strUpdateDiTR('foo')),
        foo: fooReducer,
      }),
      state = {
        foo: 'a foo',
        bar: 'the bar',
      };

    reducer(state, updateAction(), {});

    expect(fooReducer.mock.calls.length).toBe(1);
  });

  it('resolves multiple di on same level', () => {
    const
      reducer = combineReducers({
        foo: strUpdateTR(),
        bar: diReducer({ foo: '.foo' }, strDummyTR()),
        baz: diReducer({ bar: '.bar' }, strUpdateDiTR('bar')),
      }),
      state = {
        foo: 'a foo',
        bar: 'the bar',
        baz: 'Baz',
      },
      nextState = reducer(state, updateAction(), {});

    expect(nextState).toEqual({
      foo: 'a foo updated',
      bar: 'the bar',
      baz: 'Baz updated + the bar',
    });
  });

  it('only calls dependant reducer once for multiple di', () => {
    const
      fooReducer = jest.fn(strUpdateTR()),
      barReducer = jest.fn(strUpdateDiTR('foo')),
      bazReducer = jest.fn(strUpdateDiTR('bar')),
      reducer = combineReducers({
        baz: diReducer({ bar: '.bar' }, bazReducer),
        bar: diReducer({ foo: '.foo' }, barReducer),
        foo: fooReducer,
      }),
      state = {
        foo: 'a foo',
        bar: 'the bar',
        baz: 'Baz',
      },
      nextState = reducer(state, updateAction(), {});

    expect(nextState).toEqual({
      foo: 'a foo updated',
      bar: 'the bar updated + a foo updated',
      baz: 'Baz updated + the bar updated + a foo updated',
    });
    expect(fooReducer.mock.calls.length).toBe(1);
    expect(barReducer.mock.calls.length).toBe(1);
    expect(bazReducer.mock.calls.length).toBe(1);
  });

  it('resolves multiple di on same level and absolute paths', () => {
    const
      reducer = combineReducers({
        foo: strUpdateTR(),
        bar: diReducer({ fox: '@fox' }, strUpdateDiTR('fox')),
        baz: diReducer({ bar: '.bar' }, strUpdateDiTR('bar')),
      }),
      state = {
        foo: 'a foo',
        bar: 'the bar',
        baz: 'Baz',
      },
      nextState = reducer(state, updateAction(), { 'bar.fox': 'foxy' });

    expect(nextState).toEqual({
      foo: 'a foo updated',
      bar: 'the bar updated + foxy',
      baz: 'Baz updated + the bar updated + foxy',
    });
  });

  it('resolves multiple di with selectors', () => {
    const
      barSelector = new DiSelector('.bar', bar => bar.val),
      reducer = combineReducers({
        bar: diReducer({ foo: '.foo' }, (s, a, d) => (
          a.type === UPDATE_ACTION
            ? { ...s, val: `${s.val} updated + ${d.foo}` }
            : s
        )),
        foo: strUpdateTR(),
        baz: diReducer({ bar: barSelector }, strUpdateDiTR('bar')),
      }),
      state = {
        foo: 'a foo',
        bar: { val: 'the bar' },
        baz: 'Baz',
      },
      nextState = reducer(state, updateAction(), {});

    expect(nextState).toEqual({
      foo: 'a foo updated',
      bar: { val: 'the bar updated + a foo updated' },
      baz: 'Baz updated + the bar updated + a foo updated',
    });
  });

  it('resolves multiple di with path selectors', () => {
    const
      reducer = combineReducers({
        bar: diReducer({ foo: '.foo' }, (s, a, d) => (
          a.type === UPDATE_ACTION
            ? { ...s, val: `${s.val} updated + ${d.foo}` }
            : s
        )),
        foo: strUpdateTR(),
        baz: diReducer(
          { bar: new DiSelector('.bar', bar => bar.val) },
          strUpdateDiTR('bar'),
        ),
      }),
      state = {
        foo: 'a foo',
        bar: { val: 'the bar' },
        baz: 'Baz',
      },
      nextState = reducer(state, updateAction(), {});

    expect(nextState).toEqual({
      foo: 'a foo updated',
      bar: { val: 'the bar updated + a foo updated' },
      baz: 'Baz updated + the bar updated + a foo updated',
    });
  });

  it('resolves mixed reducers several times', () => {
    const
      reducer = combineReducers({
        bar: diReducer({ foo: '.foo' }, (s, a, d) => (
          a.type === UPDATE_ACTION
            ? s + 1 + d.foo
            : s
        )),
        foo: (s, a) => (
          a.type === UPDATE_ACTION
            ? s + 1
            : s
        ),
      }) as Reducer;

    let state = {
      bar: 0,
      foo: 0,
    };

    state = reducer(state, updateAction());
    expect(state).toEqual({
      bar: 2,
      foo: 1,
    });

    state = reducer(state, updateAction());
    expect(state).toEqual({
      bar: 5,
      foo: 2,
    });
  });
});
