import { combineReducers } from '../combineReducers';
import { strUpdateTR, strUpdateDiTR } from '../../../tests/reducers';
import { diReducer } from '../../diReducer/diReducer';
import { updateAction } from '../../../tests/actions';
import { Reducer } from '../../types'; // eslint-disable-line no-unused-vars
import { isPlainReducer } from '../../utils/isType';

describe('root combineReducers', () => {
  it('returns plain reducer', () => {
    const reducer = combineReducers({
      foo: strUpdateTR(''),
      bar: diReducer({ foo: '@foo' }, strUpdateDiTR('foo')),
    }, { isRoot: true });

    expect(isPlainReducer(reducer)).toBeTruthy();
  });

  it('resolves simple absolute path', () => {
    const
      reducer = combineReducers({
        foo: strUpdateTR(''),
        bar: diReducer({ foo: '@foo' }, strUpdateDiTR('foo')),
      }, {
        isRoot: true,
      }) as Reducer,
      state = {
        foo: 'foo val',
        bar: 'bar',
      };

    expect(reducer(state, updateAction())).toEqual({
      foo: 'foo val updated',
      bar: 'bar updated + foo val updated',
    });
  });

  it('resolves nested absolute path', () => {
    const
      reducer = combineReducers({
        foo: strUpdateTR(''),
        bar: combineReducers({
          baz: diReducer({ foo: '@foo' }, strUpdateDiTR('foo')),
        }),
      }, {
        isRoot: true,
      }) as Reducer,
      state = {
        foo: 'foo val',
        bar: {
          baz: 'baz',
        },
      };

    expect(reducer(state, updateAction())).toEqual({
      foo: 'foo val updated',
      bar: {
        baz: 'baz updated + foo val updated',
      },
    });
  });
});
