import {
  UPDATE_ACTION,
  updateAction,
  DUMMY_ACTION,
  dummyAction,
} from '../../../tests/actions';
import { rootReducer } from '../rootReducer';
import { initReducer } from '../../initReducer/initReducer';
import { stateMapReducer } from '../../stateMapReducer/stateMapReducer';
import { updateStringTR, updateStringInitTR, sameStateTR } from '../../../tests/reducers';

describe('rootReducer', () => {
  it('resolves initial state with plain reducers', () => {
    const
      reducers = {
        foo: initReducer(1, s => s),
        bar: initReducer('initial bar', s => s),
      },
      nextState = rootReducer(reducers)(undefined, dummyAction());

    expect(nextState).toEqual({
      foo: 1,
      bar: 'initial bar',
    });
  });

  it('updates the state with plain reducer', () => {
    const
      state = { foo: 'value' },
      reducers = {
        foo: (s, a) => (
          a.type === UPDATE_ACTION ? 'updated value' : s
        ),
      },
      action = updateAction(),
      nextState = rootReducer(reducers)(state, action);

    expect(nextState).toEqual({
      foo: 'updated value',
    });
  });

  it('updates the state with multiple plain reducers', () => {
    const
      state = { foo: 'value', bar: 'bar' },
      reducers = {
        foo: (s, a) => (
          a.type === UPDATE_ACTION ? 'updated value' : s
        ),
        bar: (s, a) => (
          a.type === UPDATE_ACTION ? `${s} + updated` : s
        ),
      },
      action = updateAction(),
      nextState = rootReducer(reducers)(state, action);

    expect(nextState).toEqual({
      foo: 'updated value',
      bar: 'bar + updated',
    });
  });

  it('updates the state with multiple plain reducers #2', () => {
    const
      state = { foo: 'value', bar: 'bar' },
      reducers = {
        foo: (s, a) => (
          a.type === UPDATE_ACTION ? 'updated value' : s
        ),
        bar: (s, a) => (
          a.type === DUMMY_ACTION ? `${s} + updated` : s
        ),
      },
      action = updateAction(),
      nextState = rootReducer(reducers)(state, action);

    expect(nextState).toEqual({
      foo: 'updated value',
      bar: 'bar',
    });
  });

  it('returns the same state if no changes from plain reducers', () => {
    const
      state = { foo: 'value' },
      reducers = {
        foo: (s, a) => (
          a.type === UPDATE_ACTION ? 'updated value' : s
        ),
      },
      action = dummyAction(),
      nextState = rootReducer(reducers)(state, action);

    expect(nextState === state).toBeTruthy();
  });

  it('returns the same state if no changes from plain reducers #2', () => {
    const
      state = { foo: 'value', bar: '' },
      reducers = {
        foo: (s, a) => (
          a.type === UPDATE_ACTION ? 'updated value' : s
        ),
        bar: (s, a) => (
          a.type === UPDATE_ACTION ? 'updated bar' : s
        ),
      },
      action = dummyAction(),
      nextState = rootReducer(reducers)(state, action);

    expect(nextState === state).toBeTruthy();
  });

  it('updates the state with nested plain reducers', () => {
    const
      state = {
        foo: {
          bar: 'bar',
        },
      },
      reducers = {
        foo: stateMapReducer({ bar: '' }, {
          bar: (s, a) => (
            a.type === UPDATE_ACTION ? `${s} + updated` : s
          ),
        }),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: {
        bar: 'bar + updated',
      },
    });
  });

  it('returns the same state with nested plain reducers', () => {
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
        foo: initReducer('', (s, a) => (
          a.type === UPDATE_ACTION ? `${s} updated` : s
        )),
        bar: stateMapReducer({ baz: '', fox: { qux: '' } }, {
          baz: updateStringTR(),
          fox: stateMapReducer({ qux: '' }, {
            qux: updateStringTR(),
          }),
        }),
      },
      nextState = rootReducer(reducers)(state, dummyAction());

    expect(nextState === state).toBeTruthy();
  });

  it('updates upper primitive value', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
        },
      },
      reducers = {
        foo: updateStringInitTR(''),
        bar: stateMapReducer({ baz: '' }, {
          baz: sameStateTR<string>(),
        }),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo value updated',
      bar: {
        baz: 'baz value',
      },
    });
    expect(nextState === state).toBeFalsy();
    expect(nextState.bar === state.bar).toBeTruthy();
  });

  it('updates upper primitive value and object', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
        },
      },
      reducers = {
        foo: updateStringTR(),
        bar: stateMapReducer({ baz: '' }, {
          baz: updateStringTR(),
        }),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo value updated',
      bar: {
        baz: 'baz value updated',
      },
    });
    expect(nextState === state).toBeFalsy();
    expect(nextState.bar === state.bar).toBeFalsy();
  });

  it('updates upper primitive value and object #2', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
        },
      },
      reducers = {
        foo: updateStringTR(),
        bar: initReducer({ baz: '' }, (s, a) => (
          a.type === UPDATE_ACTION ? { ...s, baz: 'baz updated' } : s
        )),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo value updated',
      bar: {
        baz: 'baz updated',
      },
    });
    expect(nextState === state).toBeFalsy();
    expect(nextState.bar === state.bar).toBeFalsy();
  });

  it('updates upper primitive value and object #3', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
          qux: 'qux value',
        },
      },
      reducers = {
        foo: updateStringTR(),
        bar: initReducer({ baz: '', qux: '' }, (s, a) => (
          a.type === UPDATE_ACTION ? { ...s, baz: 'baz updated' } : s
        )),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo value updated',
      bar: {
        baz: 'baz updated',
        qux: 'qux value',
      },
    });
    expect(nextState === state).toBeFalsy();
    expect(nextState.bar === state.bar).toBeFalsy();
  });

  it('updates root state with changes in deep state', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
        },
      },
      reducers = {
        foo: sameStateTR(),
        bar: stateMapReducer({ baz: '' }, {
          baz: updateStringTR(),
        }),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo value',
      bar: {
        baz: 'baz value updated',
      },
    });
    expect(nextState === state).toBeFalsy();
    expect(nextState.bar === state.bar).toBeFalsy();
  });

  it('updates root state with changes in deep state #2', () => {
    const
      state = {
        foo: 'foo',
        bar: {
          baz: 'baz',
          fox: 'fox',
        },
      },
      reducers = {
        foo: sameStateTR(),
        bar: stateMapReducer({ baz: '', fox: '' }, {
          baz: updateStringTR(),
          fox: sameStateTR<string>(),
        }),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo',
      bar: {
        baz: 'baz updated',
        fox: 'fox',
      },
    });
    expect(nextState === state).toBeFalsy();
    expect(nextState.bar === state.bar).toBeFalsy();
  });

  it('updates deep value', () => {
    const
      state = {
        foo: 'foo value',
        bar: {
          baz: 'baz value',
          fox: {
            qux: 'qux value',
          },
          qux: {
            sog: {
              abc: 'abc value',
            },
          },
        },
        zaz: {
          zok: 'zok value',
        },
      },
      reducers = {
        foo: sameStateTR(),
        bar: stateMapReducer(
          {
            baz: '',
            fox: {
              qux: '',
            },
            qux: {
              sog: {
                abc: '',
              },
            },
          },
          {
            baz: sameStateTR<string>(),
            fox: stateMapReducer({ qux: '' }, {
              qux: sameStateTR<string>(),
            }),
            qux: stateMapReducer({ sog: { abc: '' } }, {
              sog: (s, a) => (
                a.type === UPDATE_ACTION
                  ? { ...s, abc: `${s.abc} updated` }
                  : s
              ),
            }),
          },
        ),
        zaz: initReducer({ zok: '' }, sameStateTR()),
      },
      nextState = rootReducer(reducers)(state, updateAction());

    expect(nextState).toEqual({
      foo: 'foo value',
      bar: {
        baz: 'baz value',
        fox: {
          qux: 'qux value',
        },
        qux: {
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
    expect(nextState.bar.fox === state.bar.fox).toBeTruthy();
    expect(nextState.bar.qux === state.bar.qux).toBeFalsy();
    expect(nextState.bar.qux.sog === state.bar.qux.sog).toBeFalsy();
    expect(nextState.zaz === state.zaz).toBeTruthy();
  });
});
