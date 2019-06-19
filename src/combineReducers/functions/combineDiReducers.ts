import { Action, AnyAction, MapS, Reducer } from '../../types'; // eslint-disable-line no-unused-vars
import { CombineReducersMap, CombineReducersOptions } from '../types'; // eslint-disable-line no-unused-vars
import { isDiReducer } from '../../utils/isType';
import { diReducer } from '../../diReducer/diReducer';
import { resolveState } from './resolveState';
import { DiReducer } from '../../diReducer/types'; // eslint-disable-line no-unused-vars
import { makePropDName, hasDiReducerWithAbsolutePath } from './utils';
import { ReduxDiError } from '../../utils/ReduxDiError';
import { diffObjectsShape } from '../../utils/objectShapeChecks';
import { DiSelector } from '../../diSelector/DiSelector'; // eslint-disable-line no-unused-vars
import { dependencyMapToString } from '../../diReducer/functions'; // eslint-disable-line no-unused-vars

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

  const reducer = (state, action, dependencies) => {
    const
      resolvedValues = {} as S,
      setResolvedValue = (prop, value) => {
        resolvedValues[prop] = value;
        return value;
      };

    return resolveState<S>({
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
                const dSelector: DiSelector = propDependencyMap[dName];

                if (dSelector.isRelative || (options.isRoot && dSelector.isAbsolute)) {
                  const dProp = dSelector.path[0];

                  let dValue;
                  if (resolvedValues[dProp] === undefined) {
                    dValue = setResolvedValue(dProp, resolvePropState(dProp));
                  } else {
                    dValue = resolvedValues[dProp];
                  }

                  return Object.assign(acc, { [dName]: dValue });
                }

                if (dSelector.isAbsolute) {
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

          if (diffObjectsShape(propDependencyMap, propDependencies)) {
            throw new ReduxDiError(`
            Invalid dependencies given to reducer "foo":
            Dependency map declared: ${JSON.stringify(dependencyMapToString(propDependencyMap))};
            Received dependencies: ${JSON.stringify(propDependencies)}
          `);
          }

          nextPropState = propReducer(propState, action, propDependencies);
        } else {
          const propReducer = reducers[prop] as Reducer<S[typeof prop]>;
          nextPropState = setResolvedValue(prop, propReducer(propState, action));
        }

        return nextPropState;
      },
    });
  };

  if (!options.isRoot && hasDiReducerWithAbsolutePath(reducers)) {
    return diReducer(dependencyMap, reducer);
  }

  // @ts-ignore: TODO: dependencies should not be passed to plain reducer (see above reducer signature)
  return reducer;
};
