import { Action, AnyAction, Reducer } from '../types'; // eslint-disable-line no-unused-vars
import { validateStateMapReducerParams, getStateMapReducerState } from './functions';
import { DiReducer } from '../diReducer/types'; // eslint-disable-line no-unused-vars
import { isDiReducer } from '../utils/isType';
import { diReducer } from '../diReducer/diReducer';
import { SateMapReducerReducersMap, StateMapReducerState } from './types'; // eslint-disable-line no-unused-vars
import { ReduxDiError } from '../utils/ReduxDiError';
import { objectKeysNotEqual } from '../utils/objectKeysAreEqual'; // eslint-disable-line no-unused-vars

export const stateMapReducer = <S extends StateMapReducerState, A extends Action = AnyAction>(
  initialState: S,
  reducers: SateMapReducerReducersMap<S, A>,
): Reducer<S> | DiReducer<S> => {
  validateStateMapReducerParams(initialState, reducers);

  if (Object.keys(reducers).some(k => isDiReducer(reducers[k]))) {
    const dependencyMap = Object
      .keys(reducers)
      .reduce(
        (acc, prop) => {
          const propReducer = reducers[prop];

          if (isDiReducer(propReducer)) {
            const propReducerDependencyMap = Object
              .keys(propReducer._rdi) // eslint-disable-line no-underscore-dangle
              .reduce(
                (accc, dk) => Object.assign(accc, { [`${prop}.${dk}`]: propReducer._rdi[dk] }), // eslint-disable-line no-underscore-dangle
                {},
              );

            return Object.assign(acc, propReducerDependencyMap);
          }

          return acc;
        },
        {},
      );

    if (!Object.keys(dependencyMap).length) {
      throw new ReduxDiError('Dependency map cannot be empty.');
    }

    return diReducer(dependencyMap, (state, action, dependencies) => {
      if (state !== undefined && (!dependencies || !Object.keys(dependencies).length)) {
        throw new ReduxDiError('Dependencies cannot be empty.');
      }

      return getStateMapReducerState({
        initialState,
        reducers,
        state,
        getPropState: prop => {
          let nextPropState;

          if (isDiReducer(reducers[prop])) {
            const
              propReducer = reducers[prop] as DiReducer<S[typeof prop]>,
              propDependencies = Object
                .keys(dependencies)
                .reduce(
                  (accc, dk) => (
                    dk.indexOf(`${prop}.`) === 0
                      ? Object.assign(accc, { [dk.substring(prop.length + 1)]: dependencies[dk] })
                      : accc
                  ),
                  {},
                );

            if (objectKeysNotEqual(propReducer._rdi, propDependencies)) { // eslint-disable-line no-underscore-dangle
              throw new ReduxDiError(`
                Invalid dependencies given for reducer "foo":
                Dependency map declared: ${JSON.stringify(propReducer._rdi)/* eslint-disable-line no-underscore-dangle, max-len */};
                Received dependencies: ${JSON.stringify(propDependencies)}
              `);
            }

            nextPropState = propReducer(state[prop], action, propDependencies);
          } else {
            const propReducer = reducers[prop] as Reducer<S[typeof prop]>;
            nextPropState = propReducer(state[prop], action);
          }

          return nextPropState;
        },
      });
    });
  }

  return (state, action) => getStateMapReducerState({
    initialState,
    reducers,
    state,
    getPropState: prop => {
      const propReducer = (reducers[prop] as Reducer);
      return propReducer(state[prop], action);
    },
  });
};
