import { Reducer } from '../../types'; // eslint-disable-line no-unused-vars
import { initReducer } from '../../initReducer/initReducer';
import { combineReducers } from '../combineReducers';
import { dummyAction, updateAction } from '../../../tests/actions';
import { isPlainReducer } from '../../utils/isType';
import { strUpdateTR } from '../../../tests/reducers';

describe('combineReducers', () => {
  it('resolves initial state from plain reducers', () => {
    const reducer = combineReducers({
      foo: initReducer(1, s => s),
      bar: initReducer('2', s => s),
    }) as Reducer;

    expect(reducer(undefined, dummyAction())).toEqual({
      foo: 1,
      bar: '2',
    });
  });

  it('resolves initial state from options', () => {
    const reducer = combineReducers({
      foo: s => s,
    }, {
      initialState: {
        foo: 'foo',
      },
    }) as Reducer;

    expect(reducer(undefined, dummyAction())).toEqual({
      foo: 'foo',
    });
  });

  it('returns plain reducer WITHOUT di reducers', () => {
    const reducer = combineReducers({
      foo: s => s,
    });

    expect(isPlainReducer(reducer)).toBeTruthy();
  });

  it('updates state with plain reducer', () => {
    const
      reducer = combineReducers({
        foo: strUpdateTR(),
      }) as Reducer,
      state = {
        foo: 'foo',
      },
      nextState = reducer(state, updateAction());

    expect(nextState === state).toBeFalsy();
    expect(nextState).toEqual({
      foo: 'foo updated',
    });
  });

  it('returns the same state when no changes', () => {
    const
      reducer = combineReducers({ foo: strUpdateTR() }) as Reducer,
      state = {
        foo: 'foo',
      };

    expect(reducer(state, dummyAction())).toBe(state);
  });

  it('updates state with multiple plain reducers', () => {
    const
      reducer = combineReducers({
        foo: strUpdateTR(),
        bar: strUpdateTR(),
      }) as Reducer,
      state = {
        foo: 'foo',
        bar: 'bar',
      };

    expect(reducer(state, updateAction())).toEqual({
      foo: 'foo updated',
      bar: 'bar updated',
    });
  });

  it('returns the same state when no changes from multiple plain reducers', () => {
    const
      reducer = combineReducers({
        foo: strUpdateTR(),
        bar: strUpdateTR(),
      }) as Reducer,
      state = {
        foo: 'foo',
        bar: 'bar',
      };

    expect(reducer(state, dummyAction()) === state).toBeTruthy();
  });
});
