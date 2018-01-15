/* @flow */
/* eslint-disable arrow-body-style */

import type { PlainAction } from '../src/types';
import { exCombineReducers, ExReducerDependenciesChanges, makeExReducer, makePlainReducer } from '../src';

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

  it('should update dependencies when there are changes', () => {
    let depsChanges;
    const
      state = {
        foo: 'foo',
        bar: {
          key: 'bar value',
        },
      },
      reducerTree = {
        foo: makePlainReducer('initial foo', (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? 'foo updated' : rstate;
        }),
        bar: makeExReducer(
          {key: 'initial bar'},
          {foo: '@foo'},
          (rstate: Object, action: PlainAction, {foo}, changes: ExReducerDependenciesChanges) => {
            depsChanges = changes;
            if (changes.yes()) return {key: foo};
            return rstate;
          }),
      },
      action = doUpdateAction();

    // assert state
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo updated',
      bar: {
        key: 'foo updated',
      },
    });
    expect(newState === state).toBeFalsy();
    expect(newState.bar === state.bar).toBeFalsy();

    // assert changes
    // $FlowFixMe
    expect(depsChanges.yes() === true).toBeTruthy();
    // $FlowFixMe
    expect(depsChanges.for('foo') === true).toBeTruthy();
  });

  it('should update dependencies when there are changes #2', () => {
    let depsChanges;
    const
      state = {
        foo: 'foo',
        bar: {
          key: 'bar value',
        },
      },
      reducerTree = {
        foo: makePlainReducer('initial foo', (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? 'foo updated' : rstate;
        }),
        bar: makeExReducer(
          {key: 'initial bar'},
          {foo: '@foo'},
          (rstate: Object, action: PlainAction, {foo}, changes: ExReducerDependenciesChanges) => {
            depsChanges = changes;
            if (changes.for('foo')) return {key: foo};
            return rstate;
          }),
      },
      action = doUpdateAction();

    // assert state
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo updated',
      bar: {
        key: 'foo updated',
      },
    });
    expect(newState === state).toBeFalsy();
    expect(newState.bar === state.bar).toBeFalsy();

    // assert changes
    // $FlowFixMe
    expect(depsChanges.yes() === true).toBeTruthy();
    // $FlowFixMe
    expect(depsChanges.for('foo') === true).toBeTruthy();
  });

  it('should update dependencies when there are changes #3', () => {
    let depsChanges;
    const
      state = {
        foo: 'foo',
        bar: {
          key: 'bar value',
        },
      },
      reducerTree = {
        foo: makePlainReducer('initial foo', (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? 'foo updated' : rstate;
        }),
        bar: makeExReducer(
          {key: 'initial bar'},
          {foo: '@foo'},
          (rstate: Object, action: PlainAction, {foo}, changes: ExReducerDependenciesChanges) => {
            depsChanges = changes;
            if (changes.for('foo')) return {key: foo};
            return rstate;
          }),
      },
      action = dummyAction();

    // assert state
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo',
      bar: {
        key: 'bar value',
      },
    });
    expect(newState === state).toBeTruthy();
    expect(newState.bar === state.bar).toBeTruthy();

    // assert changes
    // $FlowFixMe
    expect(depsChanges.yes() === false).toBeTruthy();
    // $FlowFixMe
    expect(depsChanges.for('foo') === false).toBeTruthy();
  });

  it('should update dependencies when there are changes #4', () => {
    let depsChanges;
    const
      state = {
        foo: 'foo',
        bar: 'bar',
        baz: {
          key: 'baz value',
        },
      },
      reducerTree = {
        foo: makePlainReducer('initial foo', (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? 'foo updated' : rstate;
        }),
        bar: makePlainReducer('initial bar', (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? 'bar updated' : rstate;
        }),
        baz: makeExReducer(
          {key: 'initial baz'},
          {foo: '@foo', bar: '@bar'},
          (rstate: Object, action: PlainAction, {foo, bar}, changes: ExReducerDependenciesChanges) => {
            depsChanges = changes;
            if (changes.for('foo') && changes.for('bar')) return {key: `${foo} + ${bar}`};
            return rstate;
          }),
      },
      action = doUpdateAction();

    // assert state
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo updated',
      bar: 'bar updated',
      baz: {
        key: 'foo updated + bar updated',
      },
    });
    expect(newState === state).toBeFalsy();
    expect(newState.bar === state.bar).toBeFalsy();

    // assert changes
    // $FlowFixMe
    expect(depsChanges.yes() === true).toBeTruthy();
    // $FlowFixMe
    expect(depsChanges.for('foo') === true).toBeTruthy();
    // $FlowFixMe
    expect(depsChanges.for('bar') === true).toBeTruthy();
  });

  it('should update dependencies when there are changes #5', () => {
    let depsChanges;
    const
      state = {
        foo: 'foo',
        bar: 'bar',
        baz: {
          key: 'baz value',
        },
      },
      reducerTree = {
        foo: makePlainReducer('initial foo', (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? 'foo updated' : rstate;
        }),
        bar: makePlainReducer('initial bar', (rstate: string, action: PlainAction) => {
          return action.type === DUMMY_ACTION ? 'bar updated' : rstate;
        }),
        baz: makeExReducer(
          {key: 'initial baz'},
          {foo: '@foo', bar: '@bar'},
          (rstate: Object, action: PlainAction, {foo, bar}, changes: ExReducerDependenciesChanges) => {
            depsChanges = changes;
            if (changes.for('foo') && changes.for('bar')) return {key: `${foo} + ${bar}`};
            return rstate;
          }),
      },
      action = doUpdateAction();

    // assert state
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo updated',
      bar: 'bar',
      baz: {
        key: 'baz value',
      },
    });
    expect(newState === state).toBeFalsy();
    expect(newState.bar === state.bar).toBeTruthy();

    // assert changes
    // $FlowFixMe
    expect(depsChanges.yes() === true).toBeTruthy();
    // $FlowFixMe
    expect(depsChanges.for('foo') === true).toBeTruthy();
    // $FlowFixMe
    expect(depsChanges.for('bar') === false).toBeTruthy();
  });

  it('should update dependencies when there are changes #6', () => {
    let barDepsChanges, bazDepsChanges;
    const
      state = {
        foo: 'foo',
        bar: 'bar',
        baz: {
          key: 'baz value',
        },
      },
      reducerTree = {
        foo: makePlainReducer('initial foo', (rstate: string, action: PlainAction) => {
          return action.type === DO_UPDATE_ACTION ? 'foo updated' : rstate;
        }),
        bar: makeExReducer(
          'initial bar',
          {baz: '@baz'},
          (rstate: string, action: PlainAction, {baz}, changes: ExReducerDependenciesChanges) => {
            barDepsChanges = changes;
            return changes.yes() ? `bar changed with: ${baz.key}` : rstate;
          },
        ),
        baz: makeExReducer(
          {key: 'initial baz'},
          {foo: '@foo'},
          (rstate: Object, action: PlainAction, {foo}, changes: ExReducerDependenciesChanges) => {
            bazDepsChanges = changes;
            if (changes.yes()) return {key: `baz changed with: ${foo}`};
            return rstate;
          }),
      },
      action = doUpdateAction();

    // assert state
    const newState = exCombineReducers(reducerTree)(state, action);
    expect(newState).toEqual({
      foo: 'foo updated',
      bar: 'bar changed with: baz changed with: foo updated',
      baz: {
        key: 'baz changed with: foo updated',
      },
    });
    expect(newState === state).toBeFalsy();
    expect(newState.bar === state.bar).toBeFalsy();
    expect(newState.baz === state.baz).toBeFalsy();

    // assert changes
    // $FlowFixMe
    expect(barDepsChanges.yes() === true).toBeTruthy();
    // $FlowFixMe
    expect(barDepsChanges.for('baz') === true).toBeTruthy();
    // $FlowFixMe
    expect(bazDepsChanges.yes() === true).toBeTruthy();
    // $FlowFixMe
    expect(bazDepsChanges.for('foo') === true).toBeTruthy();
  });
});
