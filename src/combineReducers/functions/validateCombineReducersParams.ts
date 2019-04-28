import { CombineReducersMap, CombineReducersOptions, CombineReducersState } from '../types'; // eslint-disable-line no-unused-vars
import { isObj } from '../../utils/isType';
import { ReduxDiError } from '../../utils/ReduxDiError';
import { differentObjectsShape } from '../../utils/objectShapeChecks';

export const validateCombineReducersParams = <S extends CombineReducersState>(
  reducers: CombineReducersMap<S>,
  options: CombineReducersOptions<S> = {},
) => {
  const { initialState } = options;

  if (!isObj(reducers) || !Object.keys(reducers).length) {
    throw new ReduxDiError('Invalid reducers given to combineReducers(). Expecting non-empty object.');
  }

  if (initialState !== undefined) {
    if (!isObj(initialState) || !Object.keys(initialState).length) {
      throw new ReduxDiError('Invalid initial state given to combineReducers(). Expecting non-empty object.');
    }
    if (differentObjectsShape(initialState, reducers)) {
      throw new ReduxDiError('Reducers - initial state shape mismatch.');
    }
  }
};
