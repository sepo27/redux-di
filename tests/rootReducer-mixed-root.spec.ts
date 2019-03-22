import { AnyAction } from '../src/types'; // eslint-disable-line no-unused-vars
import { DUMMY_ACTION, dummyAction, UPDATE_ACTION, updateAction } from './actions';
import { diReducer } from '../src/diReducer';
import { rootReducer } from '../src/rootReducer';

describe('rootReducer()', () => {
  it('should return same state if no changes', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
      },
      reducerTree = {
        foo: (rstate: string, action: AnyAction) => (
          action.type === UPDATE_ACTION ? `${rstate} updated` : rstate
        ),
        bar: diReducer(
          'initial bar',
          { foo: '@foo' },
          (rstate: string, action: AnyAction, { foo }) => (
            action.type === UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate
          ),
        ),
      },
      action = dummyAction();

    const nextState = rootReducer(reducerTree)(state, action);

    expect(nextState === state).toBeTruthy();
    expect(nextState).toEqual({
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
        foo: (rstate: string, action: AnyAction) => (
          action.type === UPDATE_ACTION ? `${rstate} updated` : rstate
        ),
        bar: diReducer(
          'initial bar',
          { foo: '@foo' },
          (rstate: string, action: AnyAction, { foo }) => (
            action.type === DUMMY_ACTION ? `${foo} ${rstate} updated` : rstate
          ),
        ),
      },
      action = updateAction();

    const newState = rootReducer(reducerTree)(state, action);

    expect(newState === state).toBeFalsy();
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: 'bar value',
    });
  });

  it('should satisfy di reducer dependencies right away', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
      },
      reducerTree = {
        foo: (rstate: string, action: AnyAction) => (
          action.type === UPDATE_ACTION ? `${rstate} updated` : rstate
        ),
        bar: diReducer(
          'initial bar',
          { foo: '@foo' },
          (rstate: string, action: AnyAction, { foo }) => (
            action.type === UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate
          ),
        ),
      },
      action = updateAction();

    const nextState = rootReducer(reducerTree)(state, action);

    expect(nextState === state).toBeFalsy();
    expect(nextState).toEqual({
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
        foo: (rstate: string, action: AnyAction) => (
          action.type === DUMMY_ACTION ? `${rstate} updated` : rstate
        ),
        bar: diReducer(
          'initial bar',
          { foo: '@foo' },
          (rstate: string, action: AnyAction, { foo }) => (
            action.type === UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate
          ),
        ),
      },
      action = updateAction();

    const nextState = rootReducer(reducerTree)(state, action);

    expect(nextState === state).toBeFalsy();
    expect(nextState).toEqual({
      foo: 'foo value',
      bar: 'foo value bar value updated',
    });
  });

  it('should satisfy di reducer dependencies after', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
      },
      reducerTree = {
        bar: diReducer(
          'initial bar',
          { foo: '@foo' },
          (rstate: string, action: AnyAction, { foo }) => (
            action.type === UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate
          ),
        ),
        foo: (rstate: string, action: AnyAction) => (
          action.type === UPDATE_ACTION ? `${rstate} updated` : rstate
        ),
      },
      action = updateAction();

    const newState = rootReducer(reducerTree)(state, action);

    expect(newState === state).toBeFalsy();
    expect(newState).toEqual({
      foo: 'foo value updated',
      bar: 'foo value updated bar value updated',
    });
  });

  it('should satisfy multiple consequent di reducer dependencies', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
        baz: 'baz value',
      },
      reducerTree = {
        foo: (rstate: string, action: AnyAction) => (
          action.type === UPDATE_ACTION ? `${rstate} updated` : rstate
        ),
        bar: diReducer(
          'initial bar',
          { foo: '@foo' },
          (rstate: string, action: AnyAction, { foo }) => (
            action.type === UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate
          ),
        ),
        baz: diReducer(
          'initial baz',
          { bar: '@bar' },
          (rstate: string, action: AnyAction, { bar }) => (
            action.type === UPDATE_ACTION ? `${bar} ${rstate} updated` : rstate
          ),
        ),
      },
      action = updateAction();

    const nextState = rootReducer(reducerTree)(state, action);

    expect(nextState).toEqual({
      foo: 'foo value updated',
      bar: 'foo value updated bar value updated',
      baz: 'foo value updated bar value updated baz value updated',
    });
    expect(nextState === state).toBeFalsy();
  });

  it('should satisfy multiple incoherent di reducer dependencies', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
        baz: 'baz value',
      },
      reducerTree = {
        baz: diReducer(
          'initial baz',
          { bar: '@bar' },
          (rstate: string, action: AnyAction, { bar }) => (
            action.type === UPDATE_ACTION ? `${bar} ${rstate} updated` : rstate
          ),
        ),
        bar: diReducer(
          'initial bar',
          { foo: '@foo' },
          (rstate: string, action: AnyAction, { foo }) => (
            action.type === UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate
          ),
        ),
        foo: (rstate: string, action: AnyAction) => (
          action.type === UPDATE_ACTION ? `${rstate} updated` : rstate
        ),
      },
      action = updateAction();

    const nextState = rootReducer(reducerTree)(state, action);

    expect(nextState).toEqual({
      foo: 'foo value updated',
      bar: 'foo value updated bar value updated',
      baz: 'foo value updated bar value updated baz value updated',
    });
    expect(nextState === state).toBeFalsy();
  });
});
