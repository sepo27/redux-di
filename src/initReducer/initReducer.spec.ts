import { initReducer } from './initReducer';
import { dummyAction, UPDATE_ACTION, updateAction } from '../../tests/actions';

describe('initReducer', () => {
  it('resolves initial state', () => {
    expect(initReducer(123, s => s)(undefined, dummyAction())).toEqual(123);
  });

  it('resolves initial state for edge cases', () => {
    [1, 0, true, false, null, 'null', 'foo', {}, []].forEach(initialState => {
      expect(initReducer(initialState, s => s)(undefined, dummyAction())).toEqual(initialState);
    });
  });

  it('resolves the state', () => {
    const
      state = {
        foo: 'bar',
      },
      reducer = initReducer({ foo: '' }, (s, a) => (
        a.type === UPDATE_ACTION
          ? { foo: 'bar updated' }
          : s
      ));

    expect(reducer(state, updateAction())).toEqual({
      foo: 'bar updated',
    });
  });

  it('returns the same state', () => {
    const
      state = {
        foo: 'bar',
      },
      reducer = initReducer({ foo: '' }, (s, a) => (
        a.type === UPDATE_ACTION
          ? { foo: 'bar updated' }
          : s
      ));

    expect(reducer(state, dummyAction()) === state).toBeTruthy();
  });
});
