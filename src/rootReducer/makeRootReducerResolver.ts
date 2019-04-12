import { RootReducersMap } from './types'; // eslint-disable-line no-unused-vars
import { Action, AnyAction, MapS, Reducer } from '../types'; // eslint-disable-line no-unused-vars
import { isDiReducer, isPlainReducer } from '../utils/isType';
import { DiReducer } from '../diReducer/types'; // eslint-disable-line no-unused-vars

export const makeRootReducerResolver = <S extends MapS<any>, A extends Action = AnyAction>(
  reducers: RootReducersMap<S, A>,
) => {
  const resolvedValues = {};

  return function rootReducerResolver(rootState: S, action: A, prop: string) {
    if (resolvedValues[prop] !== undefined) return resolvedValues[prop];

    const propState = rootState === undefined ? undefined : rootState[prop];

    let propNextState;

    if (isPlainReducer(reducers[prop])) {
      const propReducer = reducers[prop] as Reducer;
      propNextState = propReducer(propState, action);
    } else if (isDiReducer(reducers[prop])) {
      const propReducer = reducers[prop] as DiReducer;

      let propDependencies;

      if (propState === undefined) {
        propDependencies = {};
      } else {
        const propDependencyMap = propReducer._rdi; // eslint-disable-line no-underscore-dangle

        propDependencies = Object
          .keys(propDependencyMap)
          .reduce(
            (acc, key) => {
              const selector = propDependencyMap[key].substring(1);
              return Object.assign(acc, { [selector]: rootReducerResolver(rootState, action, selector) });
            },
            {},
          );
      }

      propNextState = propReducer(propState, action, propDependencies);
    }

    resolvedValues[prop] = propNextState;

    return propNextState;
  };
};
