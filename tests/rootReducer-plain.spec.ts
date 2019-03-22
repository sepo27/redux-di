import { AnyAction } from '../src/types'; // eslint-disable-line no-unused-vars
import {
  DUMMY_ACTION,
  UPDATE_ACTION,
  dummyAction,
  updateAction,
} from './actions';
import { rootReducer } from '../src/rootReducer';

describe('rootReducer()', () => {
  describe('with flat plain reducers', () => {
    it('should return same state if no changes', () => {
      const
        state = { foo: 'value' },
        reducers = {
          foo: (rstate: string, action: AnyAction) => (
            action.type === UPDATE_ACTION ? 'updated value' : rstate
          ),
        },
        action = dummyAction();

      const nextState = rootReducer(reducers)(state, action);
      expect(nextState).toEqual({
        foo: 'value',
      });
      expect(nextState === state).toBeTruthy();
    });

    it('should update state by one reducer', () => {
      const
        state = { foo: 'value' },
        reducerTree = {
          foo: (rstate: string, action: AnyAction) => (
            action.type === UPDATE_ACTION ? 'updated value' : rstate
          ),
        },
        action = updateAction();

      const nextState = rootReducer(reducerTree)(state, action);

      expect(nextState).toEqual({
        foo: 'updated value',
      });
      expect(nextState === state).toBeFalsy();
    });

    it('should return updated state for multiple reducers', () => {
      const
        state = {
          foo: 'value',
          bar: 'value 2',
        },
        reducerTree = {
          foo: (rstate: string, action: AnyAction) => (
            action.type === DUMMY_ACTION ? 'updated value' : rstate
          ),
          bar: (rstate: string, action: AnyAction) => (
            action.type === UPDATE_ACTION ? 'updated value 2' : rstate
          ),
        },
        action = updateAction();

      const nextState = rootReducer(reducerTree)(state, action);

      expect(nextState === state).toBeFalsy();
      expect(nextState).toEqual({
        foo: 'value',
        bar: 'updated value 2',
      });
    });
  });

  describe('with nested plain reducers', () => {
    it('should return same state if no changes', () => {
      type State = {
        foo: string;
        bar: {
          baz: string;
          fox: {
            qux: string;
          };
        };
      };
      const
        state = {
          foo: 'foo value',
          bar: {
            baz: 'baz value',
            fox: {
              qux: 'qux value',
            },
          },
        },
        reducers = {
          foo: (rstate: string, action: AnyAction) => (
            action.type === DUMMY_ACTION ? 'updated value' : rstate
          ),
          bar: {
            baz: (rstate: string, action: AnyAction) => (
              action.type === DUMMY_ACTION ? 'updated value' : rstate
            ),
            fox: (rstate: string, action: AnyAction) => (
              action.type === DUMMY_ACTION ? 'updated value' : rstate
            ),
          },
        },
        action = updateAction();

      const nextState: State = rootReducer(reducers)(state, action);

      expect(nextState).toEqual({
        foo: 'foo value',
        bar: {
          baz: 'baz value',
          fox: {
            qux: 'qux value',
          },
        },
      });
      expect(nextState === state).toBeTruthy();
      expect(nextState.bar.fox === state.bar.fox).toBeTruthy();
    });

    it('should update upper primitive value', () => {
      const
        state = {
          foo: 'foo value',
          bar: {
            baz: 'baz value',
          },
        },
        reducerTree = {
          foo: (rstate: string, action: AnyAction) => (
            (action.type === UPDATE_ACTION) ? `${rstate} updated` : rstate
          ),
          bar: {
            baz: (rstate: string, action: AnyAction) => (
              (action.type === DUMMY_ACTION) ? `${rstate} + updated` : rstate
            ),
          },
        },
        action = updateAction();

      const newState = rootReducer(reducerTree)(state, action);

      expect(newState).toEqual({
        foo: 'foo value updated',
        bar: {
          baz: 'baz value',
        },
      });
      expect(newState === state).toBeFalsy();
      expect(newState.bar === state.bar).toBeTruthy();
    });

    it('should update upper primitive value and object', () => {
      const
        state = {
          foo: 'foo value',
          bar: {
            baz: 'baz value',
          },
        },
        reducerTree = {
          foo: (rstate: string, action: AnyAction) => (
            (action.type === UPDATE_ACTION) ? `${rstate} updated` : rstate
          ),
          bar: {
            baz: (rstate: string, action: AnyAction) => (
              (action.type === UPDATE_ACTION) ? `${rstate} updated` : rstate
            ),
          },
        },
        action = updateAction();

      const newState = rootReducer(reducerTree)(state, action);

      expect(newState).toEqual({
        foo: 'foo value updated',
        bar: {
          baz: 'baz value updated',
        },
      });
      expect(newState === state).toBeFalsy();
      expect(newState.bar === state.bar).toBeFalsy();
    });

    it('should update upper primitive value and object #2', () => {
      const
        state = {
          foo: 'foo value',
          bar: {
            baz: 'baz value',
          },
        },
        reducerTree = {
          foo: (rstate: string, action: AnyAction) => (
            (action.type === UPDATE_ACTION) ? `${rstate} updated` : rstate
          ),
          bar: (rstate: { baz: string }, action: AnyAction) => (
            (action.type === UPDATE_ACTION) ? { baz: 'baz value updated' } : rstate
          ),
        },
        action = updateAction();

      const newState = rootReducer(reducerTree)(state, action);

      expect(newState).toEqual({
        foo: 'foo value updated',
        bar: {
          baz: 'baz value updated',
        },
      });
      expect(newState === state).toBeFalsy();
      expect(newState.bar === state.bar).toBeFalsy();
    });

    it('should update upper primitive value and object #3', () => {
      interface BarState {
        baz: string;
        qux: string;
      }

      const
        state = {
          foo: 'foo value',
          bar: {
            baz: 'baz value',
            qux: 'qux value',
          },
        },
        reducerTree = {
          foo: (rstate: string, action: AnyAction) => (
            (action.type === UPDATE_ACTION) ? `${rstate} updated` : rstate
          ),
          bar: (rstate: BarState, action: AnyAction) => (
            (action.type === UPDATE_ACTION) ? { ...rstate, baz: 'baz value updated' } : rstate
          ),
        },
        action = updateAction();

      const newState = rootReducer(reducerTree)(state, action);

      expect(newState).toEqual({
        foo: 'foo value updated',
        bar: {
          baz: 'baz value updated',
          qux: 'qux value',
        },
      });
      expect(newState === state).toBeFalsy();
      expect(newState.bar === state.bar).toBeFalsy();
    });

    it('should update upper object', () => {
      const
        state = {
          foo: 'foo value',
          bar: {
            baz: 'baz value',
          },
        },
        reducerTree = {
          foo: (rstate: string, action: AnyAction) => (
            (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate
          ),
          bar: {
            baz: (rstate: string, action: AnyAction) => (
              (action.type === UPDATE_ACTION) ? `${rstate} updated` : rstate
            ),
          },
        },
        action = updateAction();

      const newState = rootReducer(reducerTree)(state, action);

      expect(newState).toEqual({
        foo: 'foo value',
        bar: {
          baz: 'baz value updated',
        },
      });
      expect(newState !== state).toBeTruthy();
      expect(newState.bar === state.bar).toBeFalsy();
    });

    it('should update upper object #2', () => {
      const
        state = {
          foo: 'foo value',
          bar: {
            baz: 'baz value',
            qux: 'qux value',
          },
        },
        reducerTree = {
          foo: (rstate: string, action: AnyAction) => (
            (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate
          ),
          bar: {
            baz: (rstate: string, action: AnyAction) => (
              (action.type === UPDATE_ACTION) ? `${rstate} updated` : rstate
            ),
            qux: (rstate: string, action: AnyAction) => (
              (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate
            ),
          },
        },
        action = updateAction();

      const newState = rootReducer(reducerTree)(state, action);

      expect(newState).toEqual({
        foo: 'foo value',
        bar: {
          baz: 'baz value updated',
          qux: 'qux value',
        },
      });
      expect(newState !== state).toBeTruthy();
      expect(newState.bar === state.bar).toBeFalsy();
    });

    it('should update upper object #3', () => {
      interface BarState {
        baz: string;
        qux: string;
      }

      const
        state = {
          foo: 'foo value',
          bar: {
            baz: 'baz value',
            qux: 'qux value',
          },
        },
        reducerTree = {
          foo: (rstate: string, action: AnyAction) => (
            (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate
          ),
          bar: (rstate: BarState, action: AnyAction) => (
            (action.type === UPDATE_ACTION) ? { ...rstate, qux: 'qux value updated' } : rstate
          ),
        },
        action = updateAction();

      const newState = rootReducer(reducerTree)(state, action);

      expect(newState).toEqual({
        foo: 'foo value',
        bar: {
          baz: 'baz value',
          qux: 'qux value updated',
        },
      });
      expect(newState !== state).toBeTruthy();
      expect(newState.bar === state.bar).toBeFalsy();
    });

    it('should update upper object #4', () => {
      interface Bar2State {
        baz2: string;
        qux2: string;
      }

      const
        state = {
          foo: 'foo value',
          bar: {
            baz: 'baz value',
            qux: 'qux value',
          },
          bar2: {
            baz2: 'baz2 value',
            qux2: 'qux2 value',
          },
        },
        reducerTree = {
          foo: (rstate: string, action: AnyAction) => (
            (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate
          ),
          bar: {
            baz: (rstate: string, action: AnyAction) => (
              (action.type === UPDATE_ACTION) ? `${rstate} updated` : rstate
            ),
            qux: (rstate: string, action: AnyAction) => (
              (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate
            ),
          },
          bar2: (rstate: Bar2State, action: AnyAction) => (
            (action.type === DUMMY_ACTION) ? { ...rstate, qux: 'qux value updated' } : rstate
          ),
        },
        action = updateAction();

      const newState = rootReducer(reducerTree)(state, action);

      expect(newState).toEqual({
        foo: 'foo value',
        bar: {
          baz: 'baz value updated',
          qux: 'qux value',
        },
        bar2: {
          baz2: 'baz2 value',
          qux2: 'qux2 value',
        },
      });
      expect(newState !== state).toBeTruthy();
      expect(newState.bar === state.bar).toBeFalsy();
      expect(newState.bar2 === state.bar2).toBeTruthy();
    });

    it('should update deep value', () => {
      interface State {
        foo: string;
        bar: {
          baz: string;
          fox: {
            qux: string;
          };
          xuq: {
            sog: {
              abc: string;
            };
          };
        };
        zaz: {
          zok: string;
        };
      }

      const
        state = {
          foo: 'foo value',
          bar: {
            baz: 'baz value',
            fox: {
              qux: 'qux value',
            },
            xuq: {
              sog: {
                abc: 'abc value',
              },
            },
          },
          zaz: {
            zok: 'zok value',
          },
        },
        reducerTree = {
          foo: (rstate: string, action: AnyAction) => (
            (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate
          ),
          bar: {
            baz: (rstate: string, action: AnyAction) => (
              (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate
            ),
            fox: (rstate: string, action: AnyAction) => (
              (action.type === DUMMY_ACTION) ? { qux: 'qux value updated' } : rstate
            ),
            xuq: {
              sog: {
                abc: (rstate: string, action: AnyAction) => (
                  (action.type === UPDATE_ACTION) ? `${rstate} updated` : rstate
                ),
              },
            },
          },
          zaz: {
            zok: (rstate: string, action: AnyAction) => (
              (action.type === DUMMY_ACTION) ? { qux: 'zok value updated' } : rstate
            ),
          },
        },
        action = updateAction();

      const nextState: State = rootReducer(reducerTree)(state, action);

      expect(nextState).toEqual({
        foo: 'foo value',
        bar: {
          baz: 'baz value',
          fox: {
            qux: 'qux value',
          },
          xuq: {
            sog: {
              abc: 'abc value updated',
            },
          },
        },
        zaz: {
          zok: 'zok value',
        },
      });

      expect(nextState === state).toBeFalsy();
      expect(nextState.bar === state.bar).toBeFalsy();
      expect(nextState.bar.xuq === state.bar.xuq).toBeFalsy();
      expect(nextState.bar.xuq.sog === state.bar.xuq.sog).toBeFalsy();
      expect(nextState.bar.fox === state.bar.fox).toBeTruthy();
      expect(nextState.zaz === state.zaz).toBeTruthy();
    });
  });
});

