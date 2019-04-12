import { stateMapReducer } from '../stateMapReducer';
import { Reducer } from '../../types'; // eslint-disable-line no-unused-vars
import { DiReducer } from '../../diReducer/types'; // eslint-disable-line no-unused-vars
import { dummyAction, UPDATE_ACTION, updateAction } from '../../../tests/actions';
import { diReducer } from '../../diReducer/diReducer';
import { isDiReducer } from '../../utils/isType';

describe('stateMapReducer', () => {
  it('resolves initial state with di reducer', () => {
    const
      initialState = {
        foo: 'foo',
        bar: 'bar',
      },
      reducer = stateMapReducer(initialState, {
        foo: diReducer({ bar: '@bar' }, s => s),
        bar: s => s,
      }) as DiReducer;

    expect(reducer(undefined, dummyAction(), { bar: 'bar' })).toEqual({
      foo: 'foo',
      bar: 'bar',
    });
  });

  it('resolves initial state with di reducer & empty dependencies', () => {
    const
      initialState = {
        foo: 'foo',
        bar: 'bar',
      },
      reducer = stateMapReducer(initialState, {
        foo: diReducer({ bar: '@bar' }, s => s),
        bar: s => s,
      }) as DiReducer;

    expect(reducer(undefined, dummyAction(), {})).toEqual({
      foo: 'foo',
      bar: 'bar',
    });
  });

  it('returns di reducer with at least one di reducer', () => {
    const reducer = stateMapReducer({ foo: '' }, {
      foo: diReducer<string>({ bar: '@bar' }, s => s),
    });

    expect(isDiReducer(reducer)).toBeTruthy();
  });

  it('combines overall dependency map for di reducer', () => {
    const reducer = stateMapReducer({ foo: '', fox: '' }, {
      foo: diReducer<string>(
        { bar: '@bar', baz: '@baz' },
        s => s,
      ),
      fox: diReducer<string>(
        { bar: '@bar', baz: '@baz' },
        s => s,
      ),
    }) as DiReducer;

    expect(reducer._rdi).toEqual({ // eslint-disable-line no-underscore-dangle
      'foo.bar': '@bar',
      'foo.baz': '@baz',
      'fox.bar': '@bar',
      'fox.baz': '@baz',
    });
  });

  it('updates state with di reducer', () => {
    const
      reducer = stateMapReducer({ foo: '' }, {
        foo: diReducer<string>({ bar: '@bar' }, (s, a, d) => (
          a.type === UPDATE_ACTION ? `${s} + ${d.bar}` : s
        )),
      }),
      state = {
        foo: 'foo',
      },
      dependencies = {
        'foo.bar': 'bar',
      },
      nextState = reducer(state, updateAction(), dependencies);

    expect(nextState === state).toBeFalsy();
    expect(nextState).toEqual({
      foo: 'foo + bar',
    });
  });

  it('returns the same state with di reducer', () => {
    const
      reducer = stateMapReducer({ foo: '' }, {
        foo: diReducer<string>({ bar: '@bar' }, (s, a, d) => (
          a.type === UPDATE_ACTION ? `${s} + ${d.bar}` : s
        )),
      }),
      state = {
        foo: 'foo',
      },
      dependencies = {
        'foo.bar': 'bar',
      };

    expect(reducer(state, dummyAction(), dependencies) === state).toBeTruthy();
  });

  it('does not call plain reducer with dependencies', () => {
    const
      fooReducer = jest.fn(s => s),
      reducer = stateMapReducer({ foo: '', bar: '' }, {
        foo: fooReducer,
        bar: diReducer<string>({ foo: '@foo' }, s => s),
      }),
      state = {
        foo: 'foo',
        bar: 'bar',
      };

    reducer(state, dummyAction(), {
      'bar.foo': 'foo',
    });

    expect(fooReducer.mock.calls[0]).toEqual([
      'foo',
      dummyAction(),
    ]);
  });

  it('updates state with plain and di reducers', () => {
    const
      reducer = stateMapReducer({ foo: '', bar: '' }, {
        foo: (s, a) => (
          a.type === UPDATE_ACTION ? `${s} updated` : s
        ),
        bar: diReducer({ foo: '@foo' }, (s, a, d) => (
          a.type === UPDATE_ACTION ? `${s} + ${d.foo}` : s
        )),
      }),
      state = {
        foo: 'foo val',
        bar: 'bar',
      },
      nextState = reducer(state, updateAction(), {
        'bar.foo': 'foo val updated',
      });

    expect(nextState).toEqual({
      foo: 'foo val updated',
      bar: 'bar + foo val updated',
    });
  });
});
