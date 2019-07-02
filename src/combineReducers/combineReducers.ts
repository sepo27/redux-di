import { Action, AnyAction, MapS } from '../types'; // eslint-disable-line no-unused-vars
import { CombineReducersMap, CombineReducersOptions, CombineReducersResultReducer } from './types'; // eslint-disable-line no-unused-vars
import { resolveState } from './functions/resolveState';
import { hasDiReducer } from './functions/utils';
import { combineDiReducers } from './functions/combineDiReducers';
import { validateCombineReducersParams } from './functions/validateCombineReducersParams'; // eslint-disable-line no-unused-vars

export const combineReducers = <S extends MapS<any>, A extends Action = AnyAction>(
  reducers: CombineReducersMap<S, A>,
  options: CombineReducersOptions<S> = {},
): CombineReducersResultReducer<S, A> => {
  validateCombineReducersParams(reducers, options);

  let resultReducer;

  if (hasDiReducer(reducers)) {
    resultReducer = combineDiReducers(reducers, options);
  } else {
    resultReducer = (state, action) => resolveState<S>({
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
  }

  resultReducer._reducers = reducers; // eslint-disable-line no-underscore-dangle

  return resultReducer;
};
