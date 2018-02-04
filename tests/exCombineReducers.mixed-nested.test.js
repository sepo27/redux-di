/* @flow */
/* eslint-disable arrow-body-style */

import type { PlainAction } from '../src/types';
import { makeExReducer, exCombineReducers, makePlainReducer } from '../src';

const
  DUMMY_ACTION = 'DUMMY_ACTION',
  DO_UPDATE_ACTION = 'DO_UPDATE_ACTION';
const
  dummyAction = () => ({type: DUMMY_ACTION}),
  doUpdateAction = () => ({type: DO_UPDATE_ACTION});

describe('exCombineReducers() mixed nested', () => {
  it('should return same state if no changes', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
        },
      },
      reducerTree = {
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        bar: {
          baz: makeExReducer(
            'initial baz',
            {foo: '@foo'},
            (rstate: string, action: PlainAction, {foo}) => {
              return action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate;
            },
          ),
        },
      },
      action = dummyAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo value',
      bar: {
        baz: 'baz value',
      },
    });
    expect(newState === state).toBeTruthy();
  });

  it('should satisfy ex reducer dependency', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
        },
      },
      reducerTree = {
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        bar: {
          baz: makeExReducer('initial bar', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
            return action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate;
          }),
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: {
        baz: 'foo value updated baz value updated',
      },
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy ex reducer with unchanged dependency', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
        },
      },
      reducerTree = {
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DUMMY_ACTION ? `${rstate} updated` : rstate;
        },
        bar: {
          baz: makeExReducer('initial baz', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
            return action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate;
          }),
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo value',
      bar: {
        baz: 'foo value baz value updated',
      },
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy ex reducer dependency irrespective to action', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
        },
      },
      reducerTree = {
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        bar: {
          baz: makeExReducer('initial baz', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
            return `${foo} ${rstate} updated`;
          }),
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: {
        baz: 'foo value updated baz value updated',
      },
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy ex reducer multiple dependencies', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
        },
        fox: 'fox value',
      },
      reducerTree = {
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        bar: {
          baz: makeExReducer(
            'initial baz',
            {foo: '@foo', fox: '@fox'},
            (rstate: string, action: PlainAction, {foo, fox}) => {
              return action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated ${fox}` : rstate;
            },
          ),
        },
        fox: (rstate: string, action: PlainAction) => {
          return action.type === DUMMY_ACTION ? `${rstate} updated` : rstate;
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: {
        baz: 'foo value updated baz value updated fox value',
      },
      fox: 'fox value',
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy ex reducer multiple dependencies #2', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
        },
        fox: 'fox value',
      },
      reducerTree = {
        bar: {
          baz: makeExReducer(
            'initial baz',
            {foo: '@foo', fox: '@fox'},
            (rstate: string, action: PlainAction, {foo, fox}) => {
              return action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated ${fox}` : rstate;
            },
          ),
        },
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        fox: (rstate: string, action: PlainAction) => {
          return action.type === DUMMY_ACTION ? `${rstate} updated` : rstate;
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: {
        baz: 'foo value updated baz value updated fox value',
      },
      fox: 'fox value',
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy ex reducer multiple dependencies #3', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
        },
        fox: 'fox value',
      },
      reducerTree = {
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        fox: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        bar: {
          baz: makeExReducer(
            'initial baz',
            {foo: '@foo', fox: '@fox'},
            (rstate: string, action: PlainAction, {foo, fox}) => {
              return action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated ${fox}` : rstate;
            },
          ),
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: {
        baz: 'foo value updated baz value updated fox value updated',
      },
      fox: 'fox value updated',
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy ex reducer multiple dependencies #4', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
        },
        fox: 'fox value',
      },
      reducerTree = {
        bar: {
          baz: makeExReducer(
            'initial baz',
            {foo: '@foo', fox: '@fox'},
            (rstate: string, action: PlainAction, {foo, fox}) => {
              return action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated ${fox}` : rstate;
            },
          ),
        },
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        fox: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: {
        baz: 'foo value updated baz value updated fox value updated',
      },
      fox: 'fox value updated',
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy mixed ex reducer dependencies', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
        },
        fox: 'fox value',
      },
      reducerTree = {
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        bar: {
          baz: makeExReducer(
            'initial baz',
            {foo: '@foo', fox: '@fox'},
            (rstate: string, action: PlainAction, {foo, fox}) => {
              return action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated ${fox}` : rstate;
            },
          ),
        },
        fox: makeExReducer('initial fox', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated ${foo}` : rstate;
        }),
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: {
        baz: 'foo value updated baz value updated fox value updated foo value updated',
      },
      fox: 'fox value updated foo value updated',
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy mixed ex reducer dependencies #2', () => {
    const
      state = {
        foo: {
          bar: 'bar value',
        },
        baz: {
          fox: 'fox value',
        },
      },
      reducerTree = {
        foo: {
          bar: (rstate: string, action: PlainAction) => {
            return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
          },
        },
        baz: {
          fox: makeExReducer('initial fox', {bar: '@foo.bar'}, (rstate: string, action: PlainAction, {bar}) => {
            return action.type === DO_UPDATE_ACTION ? `${rstate} updated ${bar}` : rstate;
          }),
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: {
        bar: 'bar value updated',
      },
      baz: {
        fox: 'fox value updated bar value updated',
      },
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy mixed ex reducer dependencies #3', () => {
    const
      state = {
        foo: {
          bar: 'bar value',
          qux: { value: 'qux value' },
        },
        baz: {
          fox: 'fox value',
        },
      },
      reducerTree = {
        foo: {
          bar: (rstate: string, action: PlainAction) => {
            return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
          },
          qux: (rstate: string, action: PlainAction) => {
            return action.type === DUMMY_ACTION ? {value: 'qux value updated'} : rstate;
          },
        },
        baz: {
          fox: makeExReducer('initial fox', {bar: '@foo.bar'}, (rstate: string, action: PlainAction, {bar}) => {
            return action.type === DO_UPDATE_ACTION ? `${rstate} updated ${bar}` : rstate;
          }),
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: {
        bar: 'bar value updated',
        qux: { value: 'qux value' },
      },
      baz: {
        fox: 'fox value updated bar value updated',
      },
    });
    expect(newState === state).toBeFalsy();
    expect(newState.foo.qux === state.foo.qux).toBeTruthy();
  });

  it('should satisfy mixed ex reducer dependencies #4', () => {
    const
      state = {
        abc: 'abc value',
        foo: {
          bar: 'bar value',
        },
        baz: {
          fox: 'fox value',
        },
      },
      reducerTree = {
        abc: (rstate: string, action: PlainAction) => {
          return action.type === DUMMY_ACTION ? `${rstate} updated` : rstate;
        },
        foo: {
          bar: makeExReducer('initial bar', {blah: '@abc'}, (rstate: string, action: PlainAction, {blah}) => {
            return action.type === DO_UPDATE_ACTION ? `${rstate} updated ${blah}` : rstate;
          }),
        },
        baz: {
          fox: makeExReducer('initial fox', {bar: '@foo.bar'}, (rstate: string, action: PlainAction, {bar}) => {
            return action.type === DO_UPDATE_ACTION ? `${rstate} updated ${bar}` : rstate;
          }),
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      abc: 'abc value',
      foo: {
        bar: 'bar value updated abc value',
      },
      baz: {
        fox: 'fox value updated bar value updated abc value',
      },
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy mixed ex reducer dependencies #5', () => {
    const
      state = {
        abc: 'abc value',
        foo: {
          bar: 'bar value',
        },
        baz: {
          fox: 'fox value',
        },
      },
      reducerTree = {
        abc: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        foo: {
          bar: makeExReducer('initial bar', {blah: '@abc'}, (rstate: string, action: PlainAction, {blah}) => {
            return action.type === DUMMY_ACTION ? `${rstate} updated ${blah}` : `${rstate} ${blah}`;
          }),
        },
        baz: {
          fox: makeExReducer('initial fox', {bar: '@foo.bar'}, (rstate: string, action: PlainAction, {bar}) => {
            return action.type === DO_UPDATE_ACTION ? `${rstate} updated ${bar}` : rstate;
          }),
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      abc: 'abc value updated',
      foo: {
        bar: 'bar value abc value updated',
      },
      baz: {
        fox: 'fox value updated bar value abc value updated',
      },
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy mixed ex reducer dependencies #6', () => {
    const
      state = {
        abc: 'abc value',
        foo: {
          bar: 'bar value',
        },
        baz: {
          fox: 'fox value',
        },
      },
      reducerTree = {
        foo: {
          bar: makeExReducer('initial bar', {blah: '@abc'}, (rstate: string, action: PlainAction, {blah}) => {
            return action.type === DUMMY_ACTION ? `${rstate} updated ${blah}` : `${rstate} ${blah}`;
          }),
        },
        abc: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        baz: {
          fox: makeExReducer('initial fox', {bar: '@foo.bar'}, (rstate: string, action: PlainAction, {bar}) => {
            return action.type === DO_UPDATE_ACTION ? `${rstate} updated ${bar}` : rstate;
          }),
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      abc: 'abc value updated',
      foo: {
        bar: 'bar value abc value updated',
      },
      baz: {
        fox: 'fox value updated bar value abc value updated',
      },
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy mixed ex reducer dependencies #7', () => {
    const
      state = {
        foo: {
          bar: 'bar value',
        },
        baz: {
          fox: 'fox value',
        },
      },
      tree = {
        foo: {
          bar: makeExReducer('initial bar', {baz: '@baz'}, (rstate: string, action: PlainAction, {baz}) => (
            action.type === DO_UPDATE_ACTION ? `bar value updated ${baz.fox}` : rstate
          )),
        },
        baz: {
          fox: makePlainReducer('initial fox', (rstate: string, action: PlainAction) => (
            action.type === DUMMY_ACTION ? 'fox value updated' : rstate
          )),
        },
      },
      action = doUpdateAction();
    expect(exCombineReducers(tree)(state, action)).toEqual({
      foo: {
        bar: 'bar value updated fox value',
      },
      baz: {
        fox: 'fox value',
      },
    });
  });

  it('should satisfy mixed ex reducer dependencies #8', () => {
    const
      state = {
        foo: {
          bar: { barValue: 'bar value' },
        },
        baz: {
          fox: {
            qux: 'qux value',
          },
        },
      },
      tree = {
        foo: {
          bar: makeExReducer({}, {fox: '@baz.fox'}, (rstate: {}, action: PlainAction, {fox}) => (
            action.type === DO_UPDATE_ACTION ? { ...fox, barValue: 'bar value updated' } : rstate
          )),
        },
        baz: {
          fox: {
            qux: makePlainReducer('initial qux', (rstate: string, action: PlainAction) => (
              action.type === DO_UPDATE_ACTION ? 'qux value updated' : rstate
            )),
          },
        },
      },
      action = doUpdateAction();
    expect(exCombineReducers(tree)(state, action)).toEqual({
      foo: {
        bar: { qux: 'qux value updated', barValue: 'bar value updated' },
      },
      baz: {
        fox: {
          qux: 'qux value updated',
        },
      },
    });
  });

  it('should satisfy mixed ex reducer dependencies #9', () => {
    const
      state = {
        bar: 'bar value',
        bar1: 'bar1 value',
      },
      tree = {
        bar: makePlainReducer('initial bar value', (rstate: string, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? 'bar updated' : rstate
        )),
        bar1: makeExReducer('initial bar1', {bar: '@bar'}, (rstate: string, action: PlainAction, {bar}) => (
          action.type === DO_UPDATE_ACTION ? `bar1 updated ${bar}` : rstate
        )),
      },
      action = doUpdateAction();
    expect(exCombineReducers(tree)(state, action)).toEqual({
      bar: 'bar updated',
      bar1: 'bar1 updated bar updated',
    });
  });

  it('should satisfy mixed ex reducer dependencies #10', () => {
    const
      state = {
        foo: {
          bar: 'bar value',
          bar1: 'bar1 value',
        },
      },
      tree = {
        foo: {
          bar: makePlainReducer('initial bar value', (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? 'bar updated' : rstate
          )),
          bar1: makeExReducer('initial bar1', {bar: '@foo.bar'}, (rstate: string, action: PlainAction, {bar}) => (
            action.type === DO_UPDATE_ACTION ? `bar1 updated ${bar}` : rstate
          )),
        },
      },
      action = doUpdateAction();
    expect(exCombineReducers(tree)(state, action)).toEqual({
      foo: {
        bar: 'bar updated',
        bar1: 'bar1 updated bar updated',
      },
    });
  });

  it('should satisfy mixed ex reducer with dependency to sibling', () => {
    const
      state = {
        foo: {
          bar: 'bar value',
          baz: 'baz value',
        },
        fox: {
          qux: 'qux value',
        },
      },
      reducerTree = {
        foo: {
          bar: makeExReducer('initial bar', {baz: '@foo.baz'}, (rstate: string, action: PlainAction, {baz}) => {
            return action.type === DO_UPDATE_ACTION ? `${rstate} updated ${baz}` : `${rstate} ${baz}`;
          }),
          baz: makeExReducer('initial baz', {qux: '@fox.qux'}, (rstate: string, action: PlainAction, {qux}) => {
            return action.type === DO_UPDATE_ACTION ? `${rstate} updated ${qux}` : `${rstate} ${qux}`;
          }),
        },
        fox: {
          qux: (rstate: string, action: PlainAction) => {
            return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
          },
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: {
        bar: 'bar value updated baz value updated qux value updated',
        baz: 'baz value updated qux value updated',
      },
      fox: {
        qux: 'qux value updated',
      },
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy mixed ex reducer with dependency to sibling #2', () => {
    const
      state = {
        foo: {
          bar: 'bar value',
          baz: 'baz value',
        },
        fox: {
          qux: 'qux value',
        },
      },
      reducerTree = {
        foo: {
          bar: makeExReducer(
            'initial bar',
            {baz: '@foo.baz', qux: '@fox.qux'},
            (rstate: string, action: PlainAction, {baz, qux}) => {
              return action.type === DO_UPDATE_ACTION ? `${rstate} updated ${baz} ${qux}` : `${rstate} ${baz}`;
            },
          ),
          baz: makeExReducer('initial baz', {qux: '@fox.qux'}, (rstate: string, action: PlainAction, {qux}) => {
            return action.type === DO_UPDATE_ACTION ? `${rstate} updated ${qux}` : `${rstate} ${qux}`;
          }),
        },
        fox: {
          qux: (rstate: string, action: PlainAction) => {
            return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
          },
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: {
        bar: 'bar value updated baz value updated qux value updated qux value updated',
        baz: 'baz value updated qux value updated',
      },
      fox: {
        qux: 'qux value updated',
      },
    });
    expect(newState === state).toBeFalsy();
  });

  it('should resolve relative dependency path', () => {
    const
      state = {
        foo: {
          bar: 'bar',
          baz: 'baz',
        },
      },
      reducerTree = {
        foo: {
          bar: makeExReducer('initial bar', {baz: '^baz'}, (rstate: string, action: PlainAction, {baz}) => {
            return `${rstate} ${baz}`;
          }),
          baz: makePlainReducer('initial baz', (rstate: string, action: PlainAction) => {
            return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
          }),
        },
      },
      action = doUpdateAction();

    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: {
        bar: 'bar baz updated',
        baz: 'baz updated',
      },
    });
    expect(newState === state).toBeFalsy();
  });

  it('should resolve relative dependency path #2', () => {
    const
      state = {
        foo: {
          bar: 'bar',
          baz: {
            fox: 'fox value',
          },
        },
      },
      reducerTree = {
        foo: {
          bar: makePlainReducer('initial bar', (rstate: string, action: PlainAction) => {
            return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
          }),
          baz: {
            fox: makeExReducer('initial fox', {bar: '^^bar'}, (rstate: string, action: PlainAction, {bar}) => {
              return `${rstate} ${bar}`;
            }),
          },
        },
      },
      action = doUpdateAction();

    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: {
        bar: 'bar updated',
        baz: {
          fox: 'fox value bar updated',
        },
      },
    });
    expect(newState === state).toBeFalsy();
  });
});
