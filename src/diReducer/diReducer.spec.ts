import { dummyAction, UPDATE_ACTION, updateAction } from '../../tests/actions';
import { diReducer } from './diReducer';

describe('diReducer', () => {
  it('resolves state with dependencies', () => {
    const
      state = {
        foo: 'bar',
      },
      deps = {
        baz: 'baz',
      },
      reducer = diReducer({ baz: '@dummy' }, (s, a, d) => (
        a.type === UPDATE_ACTION
          ? { foo: `bar + ${d.baz}` }
          : s
      ));

    expect(reducer(state, updateAction(), deps)).toEqual({
      foo: 'bar + baz',
    });
  });

  it('returns the same state', () => {
    const
      state = {
        foo: 'bar',
      },
      reducer = diReducer({ baz: '@dummy' }, (s, a, d) => (
        a.type === UPDATE_ACTION
          ? { foo: `bar + ${d.baz}` }
          : s
      ));

    expect(reducer(state, dummyAction(), {}) === state).toBeTruthy();
  });

  it('resolves initial state', () => {
    const reducer = diReducer(
      321,
      { foo: '@dummy' },
      s => s,
    );

    expect(reducer(undefined, dummyAction(), {})).toEqual(321);
  });

  it('resolves initial state for edge cases', () => {
    [1, 0, true, false, null, 'null', 'foo', {}, []].forEach(initialState => {
      const reducer = diReducer(
        initialState,
        { foo: '@dummy' },
        s => s,
      );

      expect(reducer(undefined, dummyAction(), {})).toEqual(initialState);
    });
  });
});
