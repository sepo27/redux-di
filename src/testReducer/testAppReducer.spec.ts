import { Reducer } from '../types'; // eslint-disable-line no-unused-vars
import { appSel } from '../appSelector/appSel';
import { testAppReducer } from './testAppReducer';
import { combineReducers, diReducer } from '..';
import { strUpdateDiTR, strUpdateTR } from '../../tests/reducers';
import { updateAction } from '../../tests/actions';
import { ReduxDiError } from '../utils/ReduxDiError';
import { DiReducer } from '../diReducer/types'; // eslint-disable-line no-unused-vars

describe('testAppReducer', () => {
  it('creates reducer by app selector', () => {
    const
      appReducer = combineReducers({
        foo: strUpdateTR(),
      }, { isRoot: true }) as Reducer,
      sel = appSel(['foo']),
      reducer = testAppReducer(appReducer, sel) as Reducer,
      state = 'the foo';

    expect(reducer(state, updateAction())).toEqual('the foo updated');
  });

  it('creates reducer by deep app selector', () => {
    const
      appReducer = combineReducers({
        foo: combineReducers({
          bar: combineReducers({
            baz: strUpdateTR(),
          }),
        }),
      }, { isRoot: true }) as Reducer,
      sel = appSel(['foo', 'bar', 'baz']),
      reducer = testAppReducer(appReducer, sel) as Reducer,
      state = 'a bazzzzz';

    expect(reducer(state, updateAction())).toEqual('a bazzzzz updated');
  });

  it('errors out for non-existent selector path', () => {
    const
      appReducer = combineReducers({
        foo: combineReducers({
          bar: strUpdateTR(),
        }),
      }, { isRoot: true }) as Reducer,
      sel = appSel(['foo', 'dummy']);

    expect(() => testAppReducer(appReducer, sel)).toThrowError(
      new ReduxDiError('Non existent app selector path "foo.dummy" given to testAppReducer'),
    );
  });

  it('creates reducer by app selector with relative dependency', () => {
    const
      appReducer = combineReducers({
        foo: strUpdateTR(),
        bar: diReducer('', { foo: '.foo' }, strUpdateDiTR('foo')),
      }, { isRoot: true }) as Reducer,
      sel = appSel(['bar']),
      // @ts-ignore: TODO
      reducer = testAppReducer(appReducer, sel) as DiReducer,
      state = 'bar bar';

    expect(reducer(state, updateAction(), { foo: 'the foo' })).toEqual(
      'bar bar updated + the foo updated',
    );
  });

  it('creates reducer by deep app selector with relative dependency', () => {
    const
      appReducer = combineReducers({
        bar: combineReducers({
          foo: strUpdateTR(),
          baz: diReducer('', { foo: '.foo' }, strUpdateDiTR('foo')),
        }),
      }, { isRoot: true }) as Reducer,
      sel = appSel(['bar', 'baz']),
      // @ts-ignore: TODO
      reducer = testAppReducer(appReducer, sel) as DiReducer,
      state = 'a baz';

    expect(reducer(state, updateAction(), { foo: 'and foo' })).toEqual(
      'a baz updated + and foo updated',
    );
  });

  it('creates reducer by app selector with absolute dependency', () => {
    const
      appReducer = combineReducers({
        foo: diReducer('', { bar: '@bar' }, strUpdateDiTR('bar')),
        bar: strUpdateTR(),
      }, { isRoot: true }) as Reducer,
      sel = appSel(['foo']),
      // @ts-ignore: TODO
      reducer = testAppReducer(appReducer, sel) as DiReducer,
      state = 'foo';

    expect(reducer(state, updateAction(), { bar: 'bar dep' })).toEqual(
      'foo updated + bar dep updated',
    );
  });

  xit('creates reducer by deep app selector with absolute dependency', () => {
    const
      appReducer = combineReducers({
        abc: combineReducers({
          foo: diReducer('', { baz: '@bar.baz' }, strUpdateDiTR('baz')),
        }),
        bar: combineReducers({
          baz: strUpdateTR(),
        }),
      }, { isRoot: true }) as Reducer,
      sel = appSel(['abc', 'foo']),
      // @ts-ignore: TODO
      reducer = testAppReducer(appReducer, sel) as DiReducer,
      state = 'foo';

    expect(reducer(state, updateAction(), { baz: 'bazzz' })).toEqual(
      'foo updated + bazzz updated',
    );
  });
});
