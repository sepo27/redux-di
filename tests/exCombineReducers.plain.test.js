/* @flow */
/* eslint-disable arrow-body-style */

import { exCombineReducers } from '../src/exCombineReducers';
import type { PlainAction } from '../src/types';

const
  DUMMY_ACTION = 'DUMMY_ACTION',
  DO_UPDATE_ACTION = 'DO_UPDATE_ACTION';

const
  dummyAction = () => ({type: DUMMY_ACTION}),
  doUpdateAction = () => ({type: DO_UPDATE_ACTION});

describe('exCombineReducers() plain', () => {
  describe('with flat plain reducers', () => {
    it('should return same state if no changes', () => {
      const
        state = {
          foo: 'value',
        },
        reducerTree = {
          foo: (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? 'updated value' : rstate
          ),
        },
        action = dummyAction();
      const nextState = exCombineReducers(reducerTree)(state, action);
      expect(nextState).toEqual({
        foo: 'value',
      });
      expect(nextState === state).toBeTruthy();
    });

    it('should update state by one reducer', () => {
      const
        state = {
          foo: 'value',
        },
        reducerTree = {
          foo: (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? 'updated value' : rstate
          ),
        },
        action = doUpdateAction();
      const nextState = exCombineReducers(reducerTree)(state, action);
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
          foo: (rstate: string, action: PlainAction) => (
            action.type === DUMMY_ACTION ? 'updated value' : rstate
          ),
          bar: (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? 'updated value 2' : rstate
          ),
        },
        action = doUpdateAction();
      const nextState = exCombineReducers(reducerTree)(state, action);
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
        reducerTree = {
          foo: (rstate: string, action: PlainAction) => (
            action.type === DUMMY_ACTION ? 'updated value' : rstate
          ),
          bar: {
            baz: (rstate: string, action: PlainAction) => (
              action.type === DUMMY_ACTION ? 'updated value' : rstate
            ),
            fox: (rstate: string, action: PlainAction) => (
              action.type === DUMMY_ACTION ? 'updated value' : rstate
            ),
          },
        },
        action = doUpdateAction();

      const nextState: State = exCombineReducers(reducerTree)(state, action);
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
          foo: (rstate: string, action: PlainAction) => {
            return (action.type === DO_UPDATE_ACTION) ? `${rstate} updated` : rstate;
          },
          bar: {
            baz: (rstate: string, action: PlainAction) => {
              return (action.type === DUMMY_ACTION) ? `${rstate} + updated` : rstate;
            },
          },
        },
        action = doUpdateAction();
      const newState = exCombineReducers(reducerTree)(state, action);
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
          foo: (rstate: string, action: PlainAction) => {
            return (action.type === DO_UPDATE_ACTION) ? `${rstate} updated` : rstate;
          },
          bar: {
            baz: (rstate: string, action: PlainAction) => {
              return (action.type === DO_UPDATE_ACTION) ? `${rstate} updated` : rstate;
            },
          },
        },
        action = doUpdateAction();
      const newState = exCombineReducers(reducerTree)(state, action);
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
          foo: (rstate: string, action: PlainAction) => {
            return (action.type === DO_UPDATE_ACTION) ? `${rstate} updated` : rstate;
          },
          bar: (rstate: { baz: string }, action: PlainAction) => {
            return (action.type === DO_UPDATE_ACTION) ? {baz: 'baz value updated'} : rstate;
          },
        },
        action = doUpdateAction();
      const newState = exCombineReducers(reducerTree)(state, action);
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
      type BarState = {
        baz: string;
        quz: string;
      };
      const
        state = {
          foo: 'foo value',
          bar: {
            baz: 'baz value',
            qux: 'qux value',
          },
        },
        reducerTree = {
          foo: (rstate: string, action: PlainAction) => {
            return (action.type === DO_UPDATE_ACTION) ? `${rstate} updated` : rstate;
          },
          bar: (rstate: BarState, action: PlainAction) => {
            return (action.type === DO_UPDATE_ACTION) ? {...rstate, baz: 'baz value updated'} : rstate;
          },
        },
        action = doUpdateAction();
      const newState = exCombineReducers(reducerTree)(state, action);
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
          foo: (rstate: string, action: PlainAction) => {
            return (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate;
          },
          bar: {
            baz: (rstate: string, action: PlainAction) => {
              return (action.type === DO_UPDATE_ACTION) ? `${rstate} updated` : rstate;
            },
          },
        },
        action = doUpdateAction();
      const newState = exCombineReducers(reducerTree)(state, action);
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
          foo: (rstate: string, action: PlainAction) => {
            return (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate;
          },
          bar: {
            baz: (rstate: string, action: PlainAction) => {
              return (action.type === DO_UPDATE_ACTION) ? `${rstate} updated` : rstate;
            },
            qux: (rstate: string, action: PlainAction) => {
              return (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate;
            },
          },
        },
        action = doUpdateAction();
      const newState = exCombineReducers(reducerTree)(state, action);
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
      type BarState = {
        baz: string;
        quz: string;
      };
      const
        state = {
          foo: 'foo value',
          bar: {
            baz: 'baz value',
            qux: 'qux value',
          },
        },
        reducerTree = {
          foo: (rstate: string, action: PlainAction) => {
            return (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate;
          },
          bar: (rstate: BarState, action: PlainAction) => {
            return (action.type === DO_UPDATE_ACTION) ? {...rstate, qux: 'qux value updated'} : rstate;
          },
        },
        action = doUpdateAction();
      const newState = exCombineReducers(reducerTree)(state, action);
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
      type Bar2State = {
        baz2: string;
        qux2: string;
      };
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
          foo: (rstate: string, action: PlainAction) => {
            return (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate;
          },
          bar: {
            baz: (rstate: string, action: PlainAction) => {
              return (action.type === DO_UPDATE_ACTION) ? `${rstate} updated` : rstate;
            },
            qux: (rstate: string, action: PlainAction) => {
              return (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate;
            },
          },
          bar2: (rstate: Bar2State, action: PlainAction) => {
            return (action.type === DUMMY_ACTION) ? {...rstate, qux: 'qux value updated'} : rstate;
          },
        },
        action = doUpdateAction();
      const newState = exCombineReducers(reducerTree)(state, action);
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
      type State = {
        foo: string;
        bar: {
          baz: string;
          fox: {
            quz: string;
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
      };
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
          foo: (rstate: string, action: PlainAction) => {
            return (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate;
          },
          bar: {
            baz: (rstate: string, action: PlainAction) => {
              return (action.type === DUMMY_ACTION) ? `${rstate} updated` : rstate;
            },
            fox: (rstate: string, action: PlainAction) => {
              return (action.type === DUMMY_ACTION) ? { qux: 'qux value updated' } : rstate;
            },
            xuq: {
              sog: {
                abc: (rstate: string, action: PlainAction) => {
                  return (action.type === DO_UPDATE_ACTION) ? `${rstate} updated` : rstate;
                },
              },
            },
          },
          zaz: {
            zok: (rstate: string, action: PlainAction) => {
              return (action.type === DUMMY_ACTION) ? { qux: 'zok value updated' } : rstate;
            },
          },
        },
        action = doUpdateAction();
      // $FlowFixMe
      const newState: State = exCombineReducers(reducerTree)(state, action);
      expect(newState).toEqual({
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
      expect(newState === state).toBeFalsy();
      expect(newState.bar === state.bar).toBeFalsy();
      expect(newState.bar.xuq === state.bar.xuq).toBeFalsy();
      expect(newState.bar.xuq.sog === state.bar.xuq.sog).toBeFalsy();
      expect(newState.bar.fox === state.bar.fox).toBeTruthy();
      expect(newState.zaz === state.zaz).toBeTruthy();
    });
  });
});
