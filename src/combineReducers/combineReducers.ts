import { Action, AnyAction, MapS, Reducer } from '../types'; // eslint-disable-line no-unused-vars
import { DiReducer } from '../diReducer/types'; // eslint-disable-line no-unused-vars
import { CombineReducersMap, CombineReducersOptions } from './types'; // eslint-disable-line no-unused-vars
import { resolveState } from './functions/resolveState';
import { hasDiReducer } from './functions/utils';
import { combineDiReducers } from './functions/combineDiReducers';
import { validateCombineReducersParams } from './functions/validateCombineReducersParams'; // eslint-disable-line no-unused-vars

export const combineReducers = <S extends MapS<any>, A extends Action = AnyAction>(
  reducers: CombineReducersMap<S, A>,
  options: CombineReducersOptions<S> = {},
): Reducer<S, A> | DiReducer<S, A> => {
  validateCombineReducersParams(reducers, options);

  if (hasDiReducer(reducers)) {
    return combineDiReducers(reducers, options);
  }

  return (state, action) => resolveState<S>({
    reducers,
    options,
    state,
    resolvePropState: prop => {
      const
        propState = state === undefined ? undefined : state[prop],
        propReducer = reducers[prop];

      return propReducer(propState, action, {});
    },
  });
};
