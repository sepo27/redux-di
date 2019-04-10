import { stateMapReducer } from '../stateMapReducer';
import { ReduxDiError } from '../../utils/ReduxDiError';
import { dummyAction } from '../../../tests/actions';
import { Reducer } from '../../types'; // eslint-disable-line no-unused-vars
import { diReducer } from '../../diReducer/diReducer';
import { DiReducer } from '../../diReducer/types'; // eslint-disable-line no-unused-vars

describe('stateMapReducer', () => {
  it('invalidates non-object initial state', () => {
    expect(() => stateMapReducer(
      // @ts-ignore
      1,
      {},
    )).toThrow(new ReduxDiError('Invalid initial state given to stateMapReducer. Expecting non-empty object.'));
  });

  it('invalidates empty object initial state', () => {
    expect(() => stateMapReducer(
      {},
      {},
    )).toThrow(new ReduxDiError('Invalid initial state given to stateMapReducer. Expecting non-empty object.'));
  });

  it('invalidates non-object reducers map', () => {
    expect(() => stateMapReducer(
      { foo: 'foo' },
      // @ts-ignore
      1,
    )).toThrow(
      new ReduxDiError('Invalid reducers map given to stateMapReducer. Expecting non-empty object of reducers.'),
    );
  });

  it('invalidates empty reducers map', () => {
    expect(() => stateMapReducer(
      { foo: 'foo' },
      {},
    )).toThrow(
      new ReduxDiError('Invalid reducers map given to stateMapReducer. Expecting non-empty object of reducers.'),
    );
  });

  it('invalidates initial state / reducers map shape mismatch', () => {
    expect(() => stateMapReducer(
      { foo: 'foo' },
      { bar: s => s },
    )).toThrow(new ReduxDiError('Initial state - reducers map shape mismatch.'));
  });

  it('invalidates reducer which returns undefined', () => {
    const reducer = stateMapReducer({ foo: '' }, {
      foo: () => undefined,
    }) as Reducer;

    expect(
      () => reducer({ foo: 'foo' }, dummyAction()),
    ).toThrow(new ReduxDiError('Reducer "foo" returned undefined.'));
  });

  it('invalidates di reducer which returns undefined', () => {
    const reducer = stateMapReducer({ foo: '' }, {
      foo: diReducer({ bar: '@bar' }, () => undefined),
    }) as DiReducer;

    expect(
      () => reducer({ foo: 'foo' }, dummyAction(), { 'foo.bar': 'foo' }),
    ).toThrow(new ReduxDiError('Reducer "foo" returned undefined.'));
  });

  it('invalidates empty dependency map', () => {
    expect(
      () => stateMapReducer({ foo: '' }, {
        foo: diReducer({}, s => s),
      }),
    ).toThrow(new ReduxDiError('Dependency map cannot be empty.'));
  });

  it('invalidates empty dependencies', () => {
    const reducer = stateMapReducer({ foo: '' }, {
      foo: diReducer({ foo: '@foo' }, s => s),
    }) as DiReducer;

    expect(
      () => reducer({ foo: 'foo' }, dummyAction(), {}),
    ).toThrow(new ReduxDiError('Dependencies cannot be empty.'));
  });

  it('invalidates missing dependency for di reducer', () => {
    const reducer = stateMapReducer({ foo: '' }, {
      foo: diReducer({ bar: '@bar' }, s => s),
    }) as DiReducer;

    expect(
      () => reducer({ foo: 'foo' }, dummyAction(), { 'foo.qux': 'qux' }),
    ).toThrow(
      new ReduxDiError(`
        Invalid dependencies given for reducer "foo":
        Dependency map declared: ${JSON.stringify({ bar: '@bar' })};
        Received dependencies: ${JSON.stringify({ qux: 'qux' })}
      `),
    );
  });
});
