import { combineReducers } from '../combineReducers';
import { strDummyTR, strUpdateDiTR, strUpdateTR } from '../../../tests/reducers';
import { dummyAction, UPDATE_ACTION, updateAction } from '../../../tests/actions';
import { Reducer } from '../../types'; // eslint-disable-line no-unused-vars
import { diReducer } from '../../diReducer/diReducer';
import { DiReducer } from '../../diReducer/types'; // eslint-disable-line no-unused-vars

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
