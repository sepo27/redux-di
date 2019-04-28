import { dummyAction, UPDATE_ACTION, updateAction } from '../../../tests/actions';
import { diMemoReducer } from '../diMemoReducer';

describe('diMemoReducer', () => {
  it('calls reducer with different dependencies', () => {
    const
      state = {
        foo: 1,
      },
      action = updateAction(),
      reducerFn = jest.fn((s, a, d) => (
        a.type === UPDATE_ACTION ? { foo: s.foo + d.bar } : s
      )),
      reducer = diMemoReducer({ bar: '@foo' }, reducerFn);

    const nextState1 = reducer(state, action, { bar: 2 });
    expect(nextState1).toEqual({ foo: 3 });

    const nextState2 = reducer(nextState1, action, { bar: 3 });
    expect(nextState2).toEqual({ foo: 6 });

    expect(reducerFn.mock.calls.length).toEqual(2);
  });

  it('memorizes calls with equal dependencies', () => {
    const
      state = { foo: 1 },
      action = updateAction(),
      reducerFn = jest.fn((s, a, d) => (
        a.type === UPDATE_ACTION ? { foo: s.foo + d.bar } : s
      )),
      reducer = diMemoReducer({ bar: '@foo' }, reducerFn);

    const nextState1 = reducer(state, action, { bar: 1 });
    const nextState2 = reducer(state, action, { bar: 1 });

    expect(reducerFn.mock.calls.length).toEqual(1);
    expect(nextState1).toEqual({ foo: 2 });
    expect(nextState2 === nextState1).toBeTruthy();
  });

  it('memorizes calls with same state, action & dependencies', () => {
    const
      state = 1,
      action = updateAction(),
      dependencies = {
        foo: 2,
      },
      reducerFn = jest.fn((s, a, d) => (
        a.type === UPDATE_ACTION ? s + d.foo : s
      )),
      reducer = diMemoReducer({ bar: '@foo' }, reducerFn);

    const nextState1 = reducer(state, action, dependencies);
    const nextState2 = reducer(state, action, dependencies);

    expect(reducerFn.mock.calls.length).toEqual(1);
    expect(nextState1 === 3 && nextState1 === nextState2).toBeTruthy();
  });

  it('memorizes calls with different states', () => {
    const
      state = {
        foo: 'foo',
      },
      action = updateAction(),
      dependencies = {
        bar: 'bar',
      },
      reducerFn = jest.fn((s, a, d) => (
        a.type === UPDATE_ACTION ? { ...state, ...d } : s
      )),
      reducer = diMemoReducer({ bar: '@foo' }, reducerFn);

    const nextState1 = reducer(state, action, dependencies);
    const nextState2 = reducer(nextState1, action, dependencies);

    expect(reducerFn.mock.calls.length).toEqual(1);
    expect(nextState1).toEqual({ foo: 'foo', bar: 'bar' });
    expect(nextState2 === nextState1).toBeTruthy();
  });

  it('memorizes calls with different actions', () => {
    const
      state = 1,
      dependencies = {
        foo: 2,
      },
      reducerFn = jest.fn((s, a, d) => (
        a.type === UPDATE_ACTION ? s + d.foo : s
      )),
      reducer = diMemoReducer({ bar: '@foo' }, reducerFn);

    const nextState1 = reducer(state, updateAction(), dependencies);
    const nextState2 = reducer(state, updateAction(), dependencies);

    expect(reducerFn.mock.calls.length).toEqual(1);
    expect(nextState1 === 3 && nextState1 === nextState2).toBeTruthy();
  });

  it('memorizes calls with different actions #2', () => {
    const
      state = 1,
      dependencies = {
        foo: 2,
      },
      reducerFn = jest.fn((s, a, d) => (
        a.type === UPDATE_ACTION ? s + d.foo : s
      )),
      reducer = diMemoReducer({ bar: '@foo' }, reducerFn);

    const nextState1 = reducer(state, updateAction(), dependencies);
    const nextState2 = reducer(state, dummyAction(), dependencies);

    expect(reducerFn.mock.calls.length).toEqual(1);
    expect(nextState1 === 3 && nextState1 === nextState2).toBeTruthy();
  });

  it('memorizes calls with different state & actions', () => {
    const
      state = 1,
      dependencies = {
        foo: 2,
      },
      reducerFn = jest.fn((s, a, d) => (
        a.type === UPDATE_ACTION ? s + d.foo : s
      )),
      reducer = diMemoReducer({ bar: '@foo' }, reducerFn);

    const nextState1 = reducer(state, updateAction(), dependencies);
    const nextState2 = reducer(nextState1, dummyAction(), dependencies);

    expect(reducerFn.mock.calls.length).toEqual(1);
    expect(nextState1 === 3 && nextState1 === nextState2).toBeTruthy();
  });

  it('handles initial state properly', () => {
    const reducer = diMemoReducer(10, { bar: '@foo' }, (s, a, d) => (
      a.type === UPDATE_ACTION
        ? s + d.foo
        : s
    ));

    let state = reducer(undefined, dummyAction(), { foo: 0 });
    expect(state).toEqual(10);

    state = reducer(state, updateAction(), { foo: 11 });
    expect(state).toEqual(21);
  });

  it('returns the same state for different dependencies', () => {
    const
      state = {
        foo: 'foo',
      },
      reducerFn = jest.fn((s, a, d) => (
        a.type === UPDATE_ACTION ? { foo: `${s.foo} & ${d.bar}` } : s
      )),
      reducer = diMemoReducer({ bar: '@foo' }, reducerFn);

    const nextState1 = reducer(state, updateAction(), { bar: 'bar' });
    expect(nextState1).toEqual({ foo: 'foo & bar' });

    const nextState2 = reducer(nextState1, dummyAction(), { bar: 'baz' });
    expect(nextState2 === nextState1).toBeTruthy();

    expect(reducerFn.mock.calls.length).toEqual(2);
  });
});
