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

  xit('creates reducer by app selector with dependencies', () => {
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
      'bar bar updated + foo updated',
    );
  });
});
