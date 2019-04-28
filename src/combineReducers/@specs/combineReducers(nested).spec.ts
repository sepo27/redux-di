import { combineReducers } from '../combineReducers';
import { strDummyTR, strUpdateDiTR, strUpdateTR } from '../../../tests/reducers';
import { dummyAction, UPDATE_ACTION, updateAction } from '../../../tests/actions';
import { Reducer } from '../../types'; // eslint-disable-line no-unused-vars
import { diReducer } from '../../diReducer/diReducer';
import { DiReducer } from '../../diReducer/types'; // eslint-disable-line no-unused-vars
import { objMap } from '../../utils/objMap';
import { isDiReducer, isPlainReducer } from '../../utils/isType'; // eslint-disable-line no-unused-vars

describe('combineReducers', () => {
  it('updates state with nested plain reducers', () => {
    const
      reducer = combineReducers({
        foo: combineReducers({
          bar: strUpdateTR(),
        }),
      }) as Reducer,
      state = {
        foo: {
          bar: 'bar',
        },
      };

    expect(reducer(state, updateAction())).toEqual({
      foo: {
        bar: 'bar updated',
      },
    });
  });

  it('returns the same state when no changes for nested plain reducers', () => {
    const
      reducer = combineReducers({
        foo: combineReducers({
          bar: strUpdateTR(),
        }),
      }) as Reducer,
      state = {
        foo: {
          bar: 'bar',
        },
      },
      nextState = reducer(state, dummyAction());

    expect(nextState).toBe(state);
  });

  it('returns plain reducer when no nested reducers have absolute paths', () => {
    const reducer = combineReducers({
      foo: strDummyTR(),
      bar: combineReducers({
        baz: diReducer({ fox: '.fox' }, s => s),
      }),
    });

    expect(isPlainReducer(reducer)).toBeTruthy();
  });

  it('returns plain reducer when no nested reducers have absolute paths #2', () => {
    const reducer = combineReducers({
      foo: strDummyTR(),
      bar: combineReducers({
        baz: combineReducers({
          fox: diReducer({ abc: '.abc' }, s => s),
          abc: strDummyTR(),
        }),
      }),
    });

    expect(isPlainReducer(reducer)).toBeTruthy();
  });

  it('returns di reducer when some nested reducers have absolute paths', () => {
    const reducer = combineReducers({
      foo: strDummyTR(),
      bar: combineReducers({
        baz: diReducer({ fox: '@fox' }, s => s),
      }),
    });

    expect(isDiReducer(reducer)).toBeTruthy();
  });

  it('returns di reducer when some nested reducers have absolute paths #2', () => {
    const reducer = combineReducers({
      foo: strDummyTR(),
      bar: combineReducers({
        baz: diReducer({ fox: '.fox' }, s => s),
        fox: strDummyTR(),
        qux: combineReducers({
          abc: diReducer({ foo: '@foo' }, s => s),
        }),
      }),
    });

    expect(isDiReducer(reducer)).toBeTruthy();
  });

  it('combines proper dependency map with absolute paths', () => {
    const reducer = combineReducers({
      foo: strDummyTR(),
      bar: combineReducers({
        baz: diReducer({ foo: '@foo' }, s => s),
      }),
    }) as DiReducer;

    expect(objMap(reducer._rdi, ds => ds.toString())).toEqual({ // eslint-disable-line no-underscore-dangle
      'bar.baz.foo': '@foo',
    });
  });

  it('combines proper dependency map with absolute paths #2', () => {
    const reducer = combineReducers({
      foo: strDummyTR(),
      bar: combineReducers({
        baz: diReducer({ foo: '@foo', fox: '.fox' }, s => s),
        fox: diReducer({ qux: '@qux' }, s => s),
      }),
      qux: strDummyTR(),
      abc: diReducer({ fox: '.fox' }, s => s),
    }) as DiReducer;

    expect(objMap(reducer._rdi, ds => ds.toString())).toEqual({ // eslint-disable-line no-underscore-dangle
      'bar.baz.foo': '@foo',
      'bar.baz.fox': '.fox',
      'bar.fox.qux': '@qux',
      'abc.fox': '.fox',
    });
  });

  it('updates state with nested relative path reducers', () => {
    const
      reducer = combineReducers({
        bar: combineReducers({
          baz: diReducer({ foo: '.foo' }, strUpdateDiTR('foo')),
          foo: strUpdateTR(),
        }),
      }) as Reducer,
      state = {
        bar: {
          baz: 'baz',
          foo: 'foo value',
        },
      },
      nextState = reducer(state, updateAction());

    expect(nextState).toEqual({
      bar: {
        baz: 'baz updated + foo value updated',
        foo: 'foo value updated',
      },
    });
  });

  // TODO
  xit('updates state with nested mixed reducers', () => {
    const
      reducer = combineReducers({
        abc: diReducer({ foo: '.foo', bar: '.bar' }, (s, a, d) => (
          a.type === UPDATE_ACTION
            ? { val: `${s.val} + updated`, dep: `${d.foo} + ${d.bar.baz} + ${d.bar.fox}` }
            : s
        )),
        foo: strUpdateTR(),
        bar: combineReducers({
          baz: diReducer({ fox: '.fox' }, strUpdateDiTR('fox')),
          fox: strDummyTR(),
        }),
      }) as DiReducer,
      state = {
        abc: {
          val: '',
          dep: '',
        },
        foo: 'foo',
        bar: {
          baz: 'baz',
          fox: 'fox initial value',
        },
      },
      nextState = reducer(state, updateAction(), {});

    expect(nextState).toEqual({
      abc: {
        val: 'updated',
        dep: 'foo updated + bar updated + fox initial value + fox initial value',
      },
      foo: 'foo updated',
      bar: {
        baz: 'bar updated + fox initial value',
        fox: 'fox initial value',
      },
    });
  });
});
