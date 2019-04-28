import { Action, AnyAction, MapS, Reducer } from '../types'; // eslint-disable-line no-unused-vars
import { CombineReducersMap, CombineReducersOptions } from './types'; // eslint-disable-line no-unused-vars
import { isDiReducer } from '../utils/isType';
import { diReducer } from '../diReducer/diReducer';
import { resolveState } from './functions/resolveState';
import { DiReducer } from '../diReducer/types'; // eslint-disable-line no-unused-vars
import { toArrPath } from '../utils/diPath';
import { makePropDName } from './functions/utils';
import { ReduxDiError } from '../utils/ReduxDiError';
import { differentObjectsShape } from '../utils/objectShapeChecks';

export const combineDiReducers = <S extends MapS<any>, A extends Action = AnyAction>(
  reducers: CombineReducersMap<S, A>,
  options: CombineReducersOptions<S> = {},
): Reducer<S, A> | DiReducer<S, A> => {
  const dependencyMap = Object
    .keys(reducers)
    .reduce(
      (deps, prop) => {
        const propReducer = reducers[prop];

        if (isDiReducer(propReducer)) {
          const propReducerDependencyMap = Object
            .keys(propReducer._rdi) // eslint-disable-line no-underscore-dangle
            .reduce(
              (reducerDeps, dName) => Object.assign(reducerDeps, {
                [makePropDName(prop, dName)]: propReducer._rdi[dName], // eslint-disable-line no-underscore-dangle
              }),
              {},
            );

          return Object.assign(deps, propReducerDependencyMap);
        }

        return deps;
      },
      {},
    );

  if (!Object.keys(dependencyMap).length) {
    throw new ReduxDiError('Empty dependency map received by combineReducer.');
  }

  const
    resolvedValues = {} as S,
    setResolvedValue = (prop, value) => {
      resolvedValues[prop] = value;
      return value;
    };

  return diReducer(dependencyMap, (state, action, dependencies) => resolveState<S>({
    reducers,
    options,
    state,
    resolvePropState: function resolvePropState(prop) {
      let nextPropState;

      if (resolvedValues[prop] !== undefined) {
        return resolvedValues[prop];
      }

      const propState = state === undefined ? undefined : state[prop];

      if (isDiReducer(reducers[prop])) {
        const
          propReducer = reducers[prop] as DiReducer<S[typeof prop]>,
          propDependencyMap = propReducer._rdi, // eslint-disable-line no-underscore-dangle
          propDependencies = Object.keys(propDependencyMap).reduce(
            (acc, dName) => {
              const dStrPath = propDependencyMap[dName].toString();

              if (dStrPath[0] === '.') {
                const
                  dArrPath = toArrPath(dStrPath.substring(1)),
                  dProp = dArrPath[0];

                let dValue;

                if (resolvedValues[dProp] === undefined) {
                  dValue = setResolvedValue(dProp, resolvePropState(dProp));
                } else {
                  dValue = resolvedValues[dProp];
                }

                return Object.assign(acc, { [dName]: dValue });
              }

              if (dStrPath[0] === '@') {
                const
                  // @ts-ignore: TODO
                  propDName = makePropDName(prop, dName),
                  dValue = dependencies[propDName];

                return Object.assign(acc, { [dName]: dValue });
              }

              return acc;
            },
            {},
          );

        if (differentObjectsShape(propDependencyMap, propDependencies)) {
          throw new ReduxDiError(`
            Invalid dependencies given to reducer "foo":
            Dependency map declared: ${JSON.stringify(propDependencyMap)};
            Received dependencies: ${JSON.stringify(propDependencies)}
          `);
        }

        nextPropState = propReducer(propState, action, propDependencies);
      } else {
        const propReducer = reducers[prop] as Reducer<S[typeof prop]>;
        nextPropState = setResolvedValue(prop, propReducer(state[prop], action));
      }

      return nextPropState;
    },
  }));
};
