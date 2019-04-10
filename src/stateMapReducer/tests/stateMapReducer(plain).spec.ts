import { stateMapReducer } from '../stateMapReducer';
import { Reducer } from '../../types'; // eslint-disable-line no-unused-vars
import { dummyAction, UPDATE_ACTION, updateAction } from '../../../tests/actions';
import { isPlainReducer } from '../../utils/isType';

describe('stateMapReducer', () => {
  it('resolves initial state', () => {
    const
      initialState = {
        foo: 'foo',
        bar: 'bar',
      },
      reducer = stateMapReducer(initialState, {
        foo: s => s,
        bar: s => s,
      }) as Reducer;

    expect(reducer(undefined, dummyAction())).toEqual({
      foo: 'foo',
      bar: 'bar',
    });
  });

  it('returns plain reducer WITHOUT di reducers', () => {
    const reducer = stateMapReducer({ foo: '' }, {
      foo: s => s,
    });

    expect(isPlainReducer(reducer)).toBeTruthy();
  });

  it('updates state with plain reducer', () => {
    const
      reducer = stateMapReducer({ foo: '' }, {
        foo: (s, a) => (
          a.type === UPDATE_ACTION ? `${s} updated` : s
        ),
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
      reducer = stateMapReducer({ foo: '' }, {
        foo: (s, a) => (
          a.type === UPDATE_ACTION ? `${s} updated` : s
        ),
      }) as Reducer,
      state = {
        foo: 'foo',
      };

    expect(reducer(state, dummyAction()) === state).toBeTruthy();
  });

  it('updates state with multiple plain reducers', () => {
    const
      reducer = stateMapReducer({ foo: '', bar: '' }, {
        foo: (s, a) => (
          a.type === UPDATE_ACTION ? `${s} updated` : s
        ),
        bar: (s, a) => (
          a.type === UPDATE_ACTION ? `${s} updated from bar` : s
        ),
      }) as Reducer,
      state = {
        foo: 'foo',
        bar: 'bar',
      };

    expect(reducer(state, updateAction())).toEqual({
      foo: 'foo updated',
      bar: 'bar updated from bar',
    });
  });

  it('returns the same state when no changes from multiple plain reducers', () => {
    const
      reducer = stateMapReducer({ foo: '', bar: '' }, {
        foo: (s, a) => (
          a.type === UPDATE_ACTION ? `${s} updated` : s
        ),
        bar: (s, a) => (
          a.type === UPDATE_ACTION ? `${s} updated from bar` : s
        ),
      }) as Reducer,
      state = {
        foo: 'foo',
        bar: 'bar',
      };

    expect(reducer(state, dummyAction()) === state).toBeTruthy();
  });
});
