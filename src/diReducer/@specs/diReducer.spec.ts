import { dummyAction, UPDATE_ACTION, updateAction } from '../../../tests/actions';
import { diReducer } from '../diReducer';
import { strUpdateDiTR } from '../../../tests/reducers';
import { DiSelector } from '../../diSelector/DiSelector';
import { ReduxDiError } from '../../utils/ReduxDiError';

describe('diReducer', () => {
  it('resolves state with dependencies', () => {
    const
      state = {
        foo: 'bar',
      },
      deps = {
        baz: 'baz',
      },
      reducer = diReducer({ baz: '@dummy' }, (s, a, d) => (
        a.type === UPDATE_ACTION
          ? { foo: `bar + ${d.baz}` }
          : s
      ));

    expect(reducer(state, updateAction(), deps)).toEqual({
      foo: 'bar + baz',
    });
  });

  it('returns the same state', () => {
    const
      state = {
        foo: 'bar',
      },
      reducer = diReducer({ baz: '@dummy' }, (s, a, d) => (
        a.type === UPDATE_ACTION
          ? { foo: `bar + ${d.baz}` }
          : s
      ));

    expect(reducer(state, dummyAction(), {}) === state).toBeTruthy();
  });

  it('resolves initial state', () => {
    const reducer = diReducer(
      321,
      { foo: '@dummy' },
      s => s,
    );

    expect(reducer(undefined, dummyAction(), {})).toEqual(321);
  });

  it('resolves initial state for edge cases', () => {
    [1, 0, true, false, null, 'null', 'foo', {}, []].forEach(initialState => {
      const reducer = diReducer(
        initialState,
        { foo: '@dummy' },
        s => s,
      );

      expect(reducer(undefined, dummyAction(), {})).toEqual(initialState);
    });
  });

  it('selects dependency portion with selector dependency', () => {
    const
      state = 'foo',
      deps = {
        baz: {
          baz: 'baz updated',
        },
      },
      selector = new DiSelector('@bar', bar => bar.baz),
      reducer = diReducer({ baz: selector }, strUpdateDiTR('baz')),
      nextState = reducer(state, updateAction(), deps);

    expect(nextState).toEqual('foo updated + baz updated');
  });

  it('invalidates non-object dependencies', () => {
    [null, 1, '0', true, false, [], undefined].forEach(dependencies => {
      const reducer = diReducer({ foo: '@foo' }, s => s);

      expect(
        // @ts-ignore
        () => reducer({ foo: 'foo' }, dummyAction(), dependencies),
      ).toThrow(
        new ReduxDiError('Invalid dependencies given to combineReducers() reducer. Expecting non-empty object.'),
      );
    });
  });

  it('invalidates empty dependency map', () => {
    expect(() => diReducer({}, s => s)).toThrow(
      new ReduxDiError('Empty dependency map given to diReducer.'),
    );
  });

  // TODO: see todo inside diReducer
  xit('invalidates mismatching dependency map & dependencies', () => {
    const reducer = diReducer({ foo: '@bar' }, s => s);

    expect(
      () => reducer({}, dummyAction(), { bar: '@foo' }),
    ).toThrow(
      new ReduxDiError(`
        Dependency map mismatches dependencies shape.
        DependencyMap: ${JSON.stringify({ foo: '@bar' })}.
        Dependencies: ${JSON.stringify({ bar: '@foo' })}.
      `),
    );
  });
});
