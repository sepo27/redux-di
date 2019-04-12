import { diReducer } from '../../diReducer/diReducer';
import { rootReducer } from '../rootReducer';
import { dummyAction, updateAction } from '../../../tests/actions';
import { initReducer } from '../../initReducer/initReducer';
import { stateMapReducer } from '../../stateMapReducer/stateMapReducer';
import {
  sameStateTR,
  updateStringTR,
  updateStringDiTR,
  updateStringDiFnTR,
} from '../../../tests/reducers';

describe('rootReducer', () => {
  it('resolves initial state with plain & di reducer', () => {
    const
      reducers = {
        foo: initReducer('default foo', s => s),
        bar: diReducer(0, {}, s => s),
      },
      nextState = rootReducer(reducers)(undefined, dummyAction());

    expect(nextState).toEqual({
      foo: 'default foo',
      bar: 0,
    });
  });

  it('resolves initial state with plain & state map di reducer', () => {
    const
      reducers = {
        foo: initReducer('default foo', s => s),
        bar: stateMapReducer({ baz: 'default baz', fox: 123 }, {
          baz: diReducer({ foo: '@foo' }, s => s),
          fox: s => s,
        }),
      },
      nextState = rootReducer(reducers)(undefined, dummyAction());

    expect(nextState).toEqual({
      foo: 'default foo',
      bar: {
        baz: 'default baz',
        fox: 123,
      },
    });
  });

  it('returns the same state with mixed reducers', () => {
    const
      state = {
        foo: 'foo',
        bar: 'bar',
      },
      reducers = {
        foo: updateStringTR(),
        bar: diReducer({ foo: '@foo' }, updateStringTR()),
      },
      nextState = rootReducer(reducers)(state, dummyAction());

    expect(nextState === state).toBeTruthy();
  });

  it('updates state by plain reducer only', () => {
    const
      state = {
        foo: 'foo',
        bar: 'bar',
      },
      reducers = {
        foo: updateStringTR(),
        bar: diReducer({ foo: '@foo' }, sameStateTR()),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo updated',
      bar: 'bar',
    });
    expect(nextState === state).toBeFalsy();
  });

  it('updates state by di reducer depending on plain reducer returning same state', () => {
    const
      state = {
        foo: 'foo',
        bar: 'bar',
      },
      reducers = {
        foo: sameStateTR(),
        bar: updateStringDiTR({ foo: '@foo' }, 'foo'),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo',
      bar: 'bar updated + foo',
    });
    expect(nextState === state).toBeFalsy();
  });

  it('updates state by di reducer depending on plain reducer returning updated state', () => {
    const
      state = {
        foo: 'foo',
        bar: 'bar',
      },
      reducers = {
        foo: updateStringTR(),
        bar: updateStringDiTR({ foo: '@foo' }, 'foo'),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo updated',
      bar: 'bar updated + foo updated',
    });
    expect(nextState === state).toBeFalsy();
  });

  it('makes sure dependant reducer is called once', () => {
    const
      state = {
        foo: 'foo',
        bar: 'bar',
      },
      fooReducer = jest.fn(updateStringTR()),
      reducers = {
        foo: fooReducer,
        bar: updateStringDiTR({ foo: '@foo' }, 'foo'),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo updated',
      bar: 'bar updated + foo updated',
    });
    expect(nextState === state).toBeFalsy();
    expect(fooReducer.mock.calls.length).toEqual(1);
  });

  it('updates state by di reducer depending on plain reducer placed after', () => {
    const
      state = {
        foo: 'foo',
        bar: 'bar',
      },
      reducers = {
        bar: updateStringDiTR({ foo: '@foo' }, 'foo'),
        foo: updateStringTR(),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo updated',
      bar: 'bar updated + foo updated',
    });
    expect(nextState === state).toBeFalsy();
  });

  it('makes sure dependant reducer is called once when it\'s placed after', () => {
    const
      state = {
        foo: 'foo',
        bar: 'bar',
      },
      fooReducer = jest.fn(updateStringTR()),
      reducers = {
        bar: updateStringDiTR({ foo: '@foo' }, 'foo'),
        foo: fooReducer,
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo updated',
      bar: 'bar updated + foo updated',
    });
    expect(nextState === state).toBeFalsy();
    expect(fooReducer.mock.calls.length).toEqual(1);
  });

  it('updates state with chain of di reducers', () => {
    const
      state = {
        foo: 'foo',
        bar: 'bar',
        zaz: 'zaz',
      },
      reducers = {
        foo: updateStringTR(),
        bar: updateStringDiTR({ foo: '@foo' }, 'foo'),
        zaz: updateStringDiTR({ bar: '@bar' }, 'bar'),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo updated',
      bar: 'bar updated + foo updated',
      zaz: 'zaz updated + bar updated + foo updated',
    });
    expect(nextState === state).toBeFalsy();
  });

  it('updates state with chain of di reducers #2', () => {
    const
      state = {
        foo: 'foo',
        zaz: 'zaz',
        bar: 'bar',
      },
      reducers = {
        foo: updateStringTR(),
        zaz: updateStringDiTR({ bar: '@bar' }, 'bar'),
        bar: updateStringDiTR({ foo: '@foo' }, 'foo'),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo updated',
      bar: 'bar updated + foo updated',
      zaz: 'zaz updated + bar updated + foo updated',
    });
    expect(nextState === state).toBeFalsy();
  });

  it('updates state with chain of di reducers #3', () => {
    const
      state = {
        zaz: 'zaz',
        bar: 'bar',
        foo: 'foo',
      },
      reducers = {
        zaz: updateStringDiTR({ bar: '@bar' }, 'bar'),
        bar: updateStringDiTR({ foo: '@foo' }, 'foo'),
        foo: updateStringTR(),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo updated',
      bar: 'bar updated + foo updated',
      zaz: 'zaz updated + bar updated + foo updated',
    });
    expect(nextState === state).toBeFalsy();
  });

  it('makes sure multiple reduces called only once', () => {
    const
      state = {
        zaz: 'zaz',
        bar: 'bar',
        foo: 'foo',
      },
      zazReducer = jest.fn(updateStringDiFnTR('bar')),
      barReducer = jest.fn(updateStringDiFnTR('foo')),
      fooReducer = jest.fn(updateStringTR()),
      reducers = {
        zaz: diReducer({ bar: '@bar' }, zazReducer),
        bar: diReducer({ foo: '@foo' }, barReducer),
        foo: fooReducer,
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo updated',
      bar: 'bar updated + foo updated',
      zaz: 'zaz updated + bar updated + foo updated',
    });
    expect(nextState === state).toBeFalsy();
    expect(zazReducer.mock.calls.length).toEqual(1);
    expect(barReducer.mock.calls.length).toEqual(1);
    expect(fooReducer.mock.calls.length).toEqual(1);
  });
});
