/* @flow */
/* eslint-disable arrow-body-style */

import type { PlainAction } from '../src/types';
import { exCombineReducers, makeExReducer } from '../src';

const
  DUMMY_ACTION = 'DUMMY_ACTION',
  DO_UPDATE_ACTION = 'DO_UPDATE_ACTION';
const
  dummyAction = () => ({type: DUMMY_ACTION}),
  doUpdateAction = () => ({type: DO_UPDATE_ACTION});

describe('exCombineReducers() mixed on root level', () => {
  it('should return same state if no changes', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
      },
      reducerTree = {
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        bar: makeExReducer('initial bar', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
          return action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate;
        }),
      },
      action = dummyAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState === state).toBeTruthy();
    expect(newState).toEqual({
      foo: 'foo value',
      bar: 'bar value',
    });
  });

  it('should update state by plain reducer only', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
      },
      reducerTree = {
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        bar: makeExReducer('initial bar', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
          return action.type === DUMMY_ACTION ? `${foo} ${rstate} updated` : rstate;
        }),
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState === state).toBeFalsy();
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: 'bar value',
    });
  });

  it('should satisfy ex reducer dependencies right away', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
      },
      reducerTree = {
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        bar: makeExReducer('initial bar', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
          return action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate;
        }),
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState === state).toBeFalsy();
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: 'foo value updated bar value updated',
    });
  });

  it('should satisfy ex reducer with unchanged dependency', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
      },
      reducerTree = {
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DUMMY_ACTION ? `${rstate} updated` : rstate;
        },
        bar: makeExReducer('initial bar', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
          return action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate;
        }),
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState === state).toBeFalsy();
    expect(newState).toEqual({
      foo: 'foo value',
      bar: 'foo value bar value updated',
    });
  });

  it('should satisfy ex reducer dependencies after', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
      },
      reducerTree = {
        bar: makeExReducer('initial bar', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
          return action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate;
        }),
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState === state).toBeFalsy();
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: 'foo value updated bar value updated',
    });
  });

  it('should satisfy multiple consequent ex reducer dependencies', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
        baz: 'baz value',
      },
      reducerTree = {
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        bar: makeExReducer('initial bar', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
          return action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate;
        }),
        baz: makeExReducer('initial baz', {bar: '@bar'}, (rstate: string, action: PlainAction, {bar}) => {
          return action.type === DO_UPDATE_ACTION ? `${bar} ${rstate} updated` : rstate;
        }),
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: 'foo value updated bar value updated',
      baz: 'foo value updated bar value updated baz value updated',
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy multiple incoherent ex reducer dependencies', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
        baz: 'baz value',
      },
      reducerTree = {
        baz: makeExReducer('initial baz', {bar: '@bar'}, (rstate: string, action: PlainAction, {bar}) => {
          return action.type === DO_UPDATE_ACTION ? `${bar} ${rstate} updated` : rstate;
        }),
        bar: makeExReducer('initial bar', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
          return action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate;
        }),
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: 'foo value updated bar value updated',
      baz: 'foo value updated bar value updated baz value updated',
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy dependency irrespective to action', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
      },
      reducerTree = {
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        bar: makeExReducer('initial bar', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
          return `${foo} ${rstate} updated`;
        }),
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: 'foo value updated bar value updated',
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy mixed ex reducer dependencies', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
        baz: 'baz value',
      },
      reducerTree = {
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate;
        },
        bar: makeExReducer('initial bar', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
          return `${foo} ${rstate} updated`;
        }),
        baz: makeExReducer('initial baz', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
          return action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate;
        }),
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: 'foo value updated bar value updated',
      baz: 'foo value updated baz value updated',
    });
    expect(newState === state).toBeFalsy();
  });

  it('should satisfy mixed ex reducer dependencies #2', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
        baz: 'baz value',
      },
      reducerTree = {
        foo: (rstate: string, action: PlainAction) => {
          return action.type === DUMMY_ACTION ? `${rstate} updated` : rstate;
        },
        bar: makeExReducer('initial bar', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
          return `${foo} ${rstate} updated`;
        }),
        baz: makeExReducer('initial baz', {foo: '@foo'}, (rstate: string, action: PlainAction, {foo}) => {
          return action.type === DUMMY_ACTION ? `${foo} ${rstate} updated` : `${foo} ${rstate}`;
        }),
      },
      action = doUpdateAction();
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo value',
      bar: 'foo value bar value updated',
      baz: 'foo value baz value',
    });
    expect(newState === state).toBeFalsy();
  });
});
