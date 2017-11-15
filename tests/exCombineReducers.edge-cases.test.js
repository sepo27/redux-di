/* @flow */
/* eslint-disable arrow-body-style */

import type { AnyRealValue, PlainAction } from '../src/types';
import { exCombineReducers, makePlainReducer, makeExReducer } from '../src';

const
  DUMMY_ACTION = 'DUMMY_ACTION',
  DO_UPDATE_ACTION = 'DO_UPDATE_ACTION'
  ;

const
  dummyAction = () => ({type: DUMMY_ACTION}),
  doUpdateAction = () => ({type: DO_UPDATE_ACTION})
  ;

describe('exCombineReducers() edge cases', () => {
  it('should error out when invalid reducer type', () => {
    [1, 'str', true, false, NaN, null, undefined].forEach(
      val => expect(() => exCombineReducers({
        foo: (state: string, action: PlainAction) => `${state} + ${action.type}`,
        // $FlowFixMe
        bar: val,
      })({ foo: 'foo value', bar: 'var value' }, { type: DUMMY_ACTION })).toThrowError('Invalid reducer type'),
    );
  });

  it('should error out when state at path is not an object', () => {
    const
      state = 'blah',
      tree = {
        bar: (rstate: string, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
        ),
      },
      action = dummyAction()
      ;
    // $FlowFixMe
    expect(() => exCombineReducers(tree)(state, action)).toThrowError("Expecting state at '[root]' to be object");
  });

  it('should error out when state at path is not an object #2', () => {
    const
      state = {
        foo: 1,
      },
      tree = {
        foo: {
          bar: (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
          ),
        },
      },
      action = dummyAction()
      ;
    // $FlowFixMe
    expect(() => exCombineReducers(tree)(state, action)).toThrowError(
      "Expecting state at 'foo' to be object",
    );
  });

  it('should handle falsy state values', () => {
    const
      state = {
        foo: null,
        bar: 0,
        baz: true,
        fox: 'fox value',
        qux: '',
        abs: {},
        xyz: [],
      },
      tree = {
        foo: makePlainReducer(null, (rstate: string | null, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? rstate && `${rstate} updated` : rstate
        )),
        bar: makePlainReducer(0, (rstate: number, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? rstate + 1 : rstate
        )),
        baz: makePlainReducer(false, (rstate: boolean, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? !rstate : rstate
        )),
        fox: makeExReducer('initial fox', {foo: 'foo'}, (rstate: string, action: PlainAction, {foo}) => (
          action.type === DO_UPDATE_ACTION ? `${foo} ${rstate} updated` : rstate
        )),
        qux: makePlainReducer('', (rstate: string, action: PlainAction) => (
          action.type === DUMMY_ACTION ? `${rstate} updated` : rstate
         )),
        abs: makePlainReducer({}, (rstate: Object, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? {...rstate, key: 'updated'} : rstate
        )),
        xyz: makeExReducer(
          [],
          {baz: 'baz', foo: 'foo', bar: 'bar'},
          (rstate: Array<AnyRealValue>, action: PlainAction, {baz, foo, bar}) => (
            action.type === DO_UPDATE_ACTION && baz === true ? [...rstate, foo] : [...rstate, bar]
          )),
      },
      action = doUpdateAction()
      ;
    expect(exCombineReducers(tree)(state, action)).toEqual({
      foo: null,
      bar: 1,
      baz: false,
      fox: 'null fox value updated',
      qux: '',
      abs: {key: 'updated'},
      xyz: [1],
    });
  });

  it('should initialze with falsy values', () => {
    const
      state = undefined,
      tree = {
        foo: makePlainReducer(null, (rstate: string | null) => rstate),
        bar: makeExReducer(0, {}, rstate => rstate),
        baz: makePlainReducer(false, (rstate: boolean) => rstate),
        fox: makeExReducer('', {}, rstate => rstate),
      },
      action = dummyAction()
      ;
    // $FlowFixMe
    expect(exCombineReducers(tree)(state, action)).toEqual({
      foo: null,
      bar: 0,
      baz: false,
      fox: '',
    });
  });

  it('should error out if NaN is given as initial state value', () => {
    const
      state = undefined,
      tree = { foo: makePlainReducer(NaN, (rstate: number) => rstate) },
      action = dummyAction()
      ;
    // $FlowFixMe
    expect(() => exCombineReducers(tree)(state, action)).toThrowError('NaN is invalid initial state value');
  });

  it('should error out if NaN is given as initial state value #2', () => {
    const
      state = undefined,
      tree = { foo: makeExReducer(NaN, {}, (rstate: number) => rstate) },
      action = dummyAction()
      ;
    // $FlowFixMe
    expect(() => exCombineReducers(tree)(state, action)).toThrowError('NaN is invalid initial state value');
  });

  it('should create initial state state', () => {
    const
      state = undefined,
      tree = {
        bar: makePlainReducer(
          'initial bar',
          (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
          ),
        ),
      },
      action = dummyAction()
      ;
    // $FlowFixMe
    expect(exCombineReducers(tree)(state, action)).toEqual({
      bar: 'initial bar',
    });
  });

  it('should create initial state state #2', () => {
    const
      state = undefined,
      tree = {
        bar: makePlainReducer(
          'initial bar',
          (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
          ),
        ),
        baz: makeExReducer('initial baz', {}, (rstate: string, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
        )),
      },
      action = dummyAction()
      ;
    // $FlowFixMe
    expect(exCombineReducers(tree)(state, action)).toEqual({
      bar: 'initial bar',
      baz: 'initial baz',
    });
  });

  it('should create initial state state #3', () => {
    const
      state = undefined,
      tree = {
        foo: {
          bar: makePlainReducer(
            'initial bar',
            (rstate: string, action: PlainAction) => (
              action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
            ),
          ),
        },
        baz: makeExReducer('initial baz', {}, (rstate: string, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
        )),
      },
      action = dummyAction()
      ;
    // $FlowFixMe
    expect(exCombineReducers(tree)(state, action)).toEqual({
      foo: {
        bar: 'initial bar',
      },
      baz: 'initial baz',
    });
  });

  it('should create initial state state #4', () => {
    const
      state = undefined,
      tree = {
        foo: {
          bar: makePlainReducer(
            'initial bar',
            () => (rstate: string, action: PlainAction) => (
              action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
            ),
          ),
        },
        baz: {
          fox: makeExReducer('initial fox', {}, (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? `${rstate} updated` : rstate
          )),
        },
      },
      action = dummyAction()
      ;
    // $FlowFixMe
    expect(exCombineReducers(tree)(state, action)).toEqual({
      foo: {
        bar: 'initial bar',
      },
      baz: {
        fox: 'initial fox',
      },
    });
  });

  it('should error out if no initial state provided', () => {
    const
      state = undefined,
      tree = {
        bar: (rstate: string) => rstate,
      },
      action = dummyAction()
      ;
    // $FlowFixMe
    expect(() => exCombineReducers(tree)(state, action)).toThrowError(
      /Reducer "[^"]*" returned undefined during initialization/,
    );
  });

  it('should error out if no initial state provided #2', () => {
    const
      state = undefined,
      tree = {
        bar: (rstate: string, action: PlainAction) => (action.type === DO_UPDATE_ACTION ? 'state updated' : rstate),
      },
      action = dummyAction()
      ;
    // $FlowFixMe
    expect(() => exCombineReducers(tree)(state, action)).toThrowError(
      /Reducer "[^"]*" returned undefined during initialization/,
    );
  });

  it('should error out if no initial state provided #3', () => {
    const
      state = undefined,
      tree = {
        foo: makePlainReducer('initial foo', rstate => rstate),
        bar: (rstate: string, action: PlainAction) => (action.type === DO_UPDATE_ACTION ? 'state updated' : rstate),
      },
      action = dummyAction()
      ;
    // $FlowFixMe
    expect(() => exCombineReducers(tree)(state, action)).toThrowError(
      /Reducer "[^"]*" returned undefined during initialization/,
    );
  });

  it('should error out if no initial state provided #4', () => {
    const
      state = undefined,
      tree = {
        foo: makePlainReducer('initial foo', rstate => rstate),
        bar: {
          baz: (rstate: string, action: PlainAction) => (action.type === DO_UPDATE_ACTION ? 'state updated' : rstate),
        },
      },
      action = dummyAction()
      ;
    // $FlowFixMe
    expect(() => exCombineReducers(tree)(state, action)).toThrowError(
      /Reducer "[^"]*" returned undefined during initialization/,
    );
  });

  it('should error out if no initial state provided #5', () => {
    const
      state = undefined,
      tree = {
        // $FlowFixMe
        fox: makeExReducer(undefined, {}, rstate => rstate),
      },
      action = dummyAction()
      ;
    // $FlowFixMe
    expect(() => exCombineReducers(tree)(state, action)).toThrowError(
      /Reducer "[^"]*" returned undefined during initialization/,
    );
  });

  it('should error out if no initial state provided #6', () => {
    const
      state = undefined,
      tree = {
        foo: {
          // $FlowFixMe
          bar: makeExReducer(undefined, {}, rstate => rstate),
        },
      },
      action = dummyAction()
      ;
    // $FlowFixMe
    expect(() => exCombineReducers(tree)(state, action)).toThrowError(
      /Reducer "[^"]*" returned undefined during initialization/,
    );
  });

  it('should error out if dependency reducer does not exist', () => {
    const
      state = {
        foo: 'previous foo',
      },
      tree = {
        foo: makeExReducer('initial foo', {bar: 'bar'}, rstate => rstate),
      },
      action = dummyAction()
      ;
    expect(() => exCombineReducers(tree)(state, action)).toThrowError('Missing dependency reducer');
  });

  it('should error out if dependency reducer does not exist #2', () => {
    const
      state = {
        foo: 'previous foo',
      },
      tree = {
        foo: makeExReducer('initial foo', {bar: 'bar.baz'}, rstate => rstate),
        bar: makePlainReducer('initial bar', (rstate: string, action: PlainAction) => (
          action.type === DO_UPDATE_ACTION ? 'bar updated' : rstate
        )),
      },
      action = dummyAction()
      ;
    expect(() => exCombineReducers(tree)(state, action)).toThrowError('Missing dependency reducer');
  });

  it('should error out if dependency cannot be fulfilled', () => {
    const
      state = {
        foo: 'previous foo',
        bar: 'previous bar',
      },
      tree = {
        // $FlowFixMe
        foo: makePlainReducer('initial foo', () => undefined),
        bar: makeExReducer('initial bar', {foo: 'foo'}, (rstate: string, action: PlainAction, {foo}) => (
          action.type === DO_UPDATE_ACTION ? `bar updated ${foo}` : rstate
        )),
      },
      action = dummyAction()
      ;
    expect(() => exCombineReducers(tree)(state, action)).toThrowError('Could not resolve dependency');
  });

  it('should error out if circular dependency to ancestor', () => {
    const
      state = {
        foo: {
          bar: 'previous bar',
        },
      },
      tree = {
        foo: {
          bar: makeExReducer('initial bar', {foo: 'foo'}, (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? 'bar updated' : rstate
          )),
        },
      },
      action = dummyAction()
      ;
    expect(() => exCombineReducers(tree)(state, action))
      .toThrowError('Circular dependency detected');
  });

  it('should error out if circular dependency to ancestor #2', () => {
    const
      state = {
        foo: {
          bar: {
            baz: 'previous baz',
          },
        },
      },
      tree = {
        foo: {
          bar: {
            baz: makeExReducer('initial baz', {bar: 'foo.bar'}, (rstate: string, action: PlainAction) => (
              action.type === DO_UPDATE_ACTION ? 'bar updated' : rstate
            )),
          },
        },
      },
      action = dummyAction()
      ;
    expect(() => exCombineReducers(tree)(state, action))
      .toThrowError('Circular dependency detected');
  });

  it('should error out if circular dependency to itself', () => {
    const
      state = {
        foo: 'foo value',
      },
      tree = {
        foo: makeExReducer('initial foo', {foo: 'foo'}, rstate => rstate),
      },
      action = dummyAction()
      ;
    expect(() => exCombineReducers(tree)(state, action))
      .toThrowError('Circular dependency detected');
  });

  it('should error out if circular dependency to itself #2', () => {
    const
      state = {
        foo: {
          bar: 'bar value',
        },
      },
      tree = {
        foo: {
          bar: makeExReducer('initial bar', {bar: 'foo.bar'}, rstate => rstate),
        },
      },
      action = dummyAction()
      ;
    expect(() => exCombineReducers(tree)(state, action))
      .toThrowError('Circular dependency detected');
  });

  it('should error out if circular dependency chain', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
      },
      tree = {
        foo: makeExReducer('initial foo', {bar: 'bar'}, rstate => rstate),
        bar: makeExReducer('initial bar', {foo: 'foo'}, rstate => rstate),
      },
      action = dummyAction()
      ;
    expect(() => exCombineReducers(tree)(state, action)).toThrowError('Circular dependency detected');
  });

  it('should error out if circular dependency chain #2', () => {
    const
      state = {
        foo: 'foo value',
        bar: 'bar value',
        baz: 'baz value',
      },
      tree = {
        foo: makeExReducer('initial foo', {bar: 'bar'}, rstate => rstate),
        bar: makeExReducer('initial bar', {baz: 'baz'}, rstate => rstate),
        baz: makeExReducer('initial bar', {foo: 'foo'}, rstate => rstate),
      },
      action = dummyAction()
      ;
    expect(() => exCombineReducers(tree)(state, action)).toThrowError('Circular dependency detected');
  });

  it('should error out if circular dependency chain #N', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
          baz2: {
            baz21: 'baz21 value',
          },
        },
        fox: {
          qux: {
            qux2: {
              qux21: 'qux21 value',
            },
            qux1: 'qux1 value',
          },
        },
      },
      tree = {
        foo: makeExReducer('initial foo', {baz21: 'bar.baz2.baz21'}, rstate => rstate),
        bar: {
          baz: makePlainReducer('initial baz', (rstate: string, action: PlainAction) => (
            action.type === DO_UPDATE_ACTION ? 'baz updated' : rstate
          )),
          baz2: {
            baz21: makeExReducer('initial baz2', {baz: 'bar.baz', fox: 'fox'}, rstate => rstate),
          },
        },
        fox: {
          qux: {
            qux2: {
              qux21: makeExReducer('initial qux 21', {qux1: 'fox.qux.qux1'}, rstate => rstate),
            },
            qux1: makeExReducer('initial qux1', {baz2: 'bar.baz2'}, rstate => rstate),
          },
        },
      },
      action = dummyAction()
      ;
    expect(() => exCombineReducers(tree)(state, action)).toThrowError('Circular dependency detected');
  });
});
