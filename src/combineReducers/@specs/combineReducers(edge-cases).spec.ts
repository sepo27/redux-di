import { ReduxDiError } from '../../utils/ReduxDiError';
import { combineReducers } from '../combineReducers';
import { Reducer } from '../../types'; // eslint-disable-line no-unused-vars
import { dummyAction } from '../../../tests/actions';
import { diReducer } from '../../diReducer/diReducer';
import { DiReducer } from '../../diReducer/types'; // eslint-disable-line no-unused-vars

describe('combineReducers', () => {
  it('invalidates non-object reducers', () => {
    [1, '0', true, [], null].forEach(reducers => {
      // @ts-ignore
      expect(() => combineReducers(reducers))
        .toThrow(new ReduxDiError('Invalid reducers given to combineReducers(). Expecting non-empty object.'));
    });
  });

  it('invalidates empty reducers map', () => {
    expect(() => combineReducers({}))
      .toThrow(
        new ReduxDiError('Invalid reducers given to combineReducers(). Expecting non-empty object.'),
      );
  });

  it('invalidates non-object initial state', () => {
    [1, '0', true, [], null].forEach(initialState => {
      // @ts-ignore
      expect(() => combineReducers({ foo: s => s }, { initialState }))
        .toThrow(new ReduxDiError('Invalid initial state given to combineReducers(). Expecting non-empty object.'));
    });
  });

  it('invalidates empty object initial state', () => {
    expect(() => combineReducers(
      { foo: s => s },
      { initialState: {} },
    )).toThrow(new ReduxDiError('Invalid initial state given to combineReducers(). Expecting non-empty object.'));
  });

  it('invalidates initial state / reducers map shape mismatch', () => {
    expect(() => combineReducers(
      // @ts-ignore
      { foo: s => s },
      { initialState: { bar: '' } },
    )).toThrow(new ReduxDiError('Reducers - initial state shape mismatch.'));
  });

  it('invalidates reducer which returns undefined', () => {
    const reducer = combineReducers({ foo: () => undefined }) as Reducer;

    expect(
      () => reducer({ foo: 'foo' }, dummyAction()),
    ).toThrow(new ReduxDiError('Reducer "foo" returned undefined.'));
  });

  it('invalidates di reducer which returns undefined', () => {
    const reducer = combineReducers({
      foo: diReducer({ bar: '@bar' }, () => undefined),
    }) as DiReducer;

    expect(
      () => reducer({ foo: 'foo' }, dummyAction(), { 'foo.bar': 'bar' }),
    ).toThrow(new ReduxDiError('Reducer "foo" returned undefined.'));
  });

  // TODO
  xit('invalidates empty dependencies when absolute paths are in dependency map', () => {
    const reducer = combineReducers({
      foo: diReducer<string>({ foo: '@foo' }, s => s),
    }) as DiReducer;

    expect(
      // @ts-ignore
      () => reducer({ foo: 'foo' }, dummyAction(), {}),
    ).toThrow(
      new ReduxDiError('combineReducers() received empty dependencies when absolute paths are in dependency map'),
    );
  });

  it('invalidates missing dependency for di reducer', () => {
    const reducer = combineReducers({
      foo: diReducer<string>({ bar: '@bar' }, s => s),
    }) as DiReducer;

    expect(
      () => reducer({ foo: 'foo' }, dummyAction(), { 'foo.qux': 'qux' }),
    ).toThrow(
      new ReduxDiError(`
        Invalid dependencies given to reducer "foo":
        Dependency map declared: ${JSON.stringify({ bar: '@bar' })};
        Received dependencies: ${JSON.stringify({})}
      `),
    );
  });
});
