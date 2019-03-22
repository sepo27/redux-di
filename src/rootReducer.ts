import { path as rpath } from 'ramda';
import { Action, AnyAction, MapT, ReducersMapTree } from './types'; // eslint-disable-line no-unused-vars, object-curly-newline
import { resolveAbsoluteArrPath, resolveAbsoluteStrPath, toAbsoluteStrPath } from './utils/pathFunctions';
import { isDiReducer, isObj, isPlainReducer } from './utils/isType';
import { RdiCircularDependencyError, RdiError } from './utils/RdiError';
import { checkInitialStateValue } from './utils/checkInitialStateValue';

export const rootReducer = <S = any, A extends Action = AnyAction>(reducers: ReducersMapTree<S>) => (
  rootState: S,
  action: A,
) => {
  let currentPath: string[] = [];

  const
    resolvedValues: MapT<any> = {},
    dependenciesCallStack: string[] = [];

  const setResolvedValue = value => {
    resolvedValues[toAbsoluteStrPath(currentPath)] = value;
    return value;
  };

  const rreduce = (reducerOrReducersMap, state) => {
    if (isObj(reducerOrReducersMap)) {
      if (rootState !== undefined && !isObj(state)) {
        const path = currentPath.length ? `${toAbsoluteStrPath(currentPath)}` : '[root]';
        throw new RdiError(`Expecting state at '${path}' to be object`);
      }

      const nextState = {};
      let stateChanged = false;

      Object.keys(reducerOrReducersMap).forEach(key => {
        currentPath.push(key);

        let levelState;

        if (rootState === undefined) {
          levelState = undefined;
        } else {
          if (state[key] === undefined) {
            throw new RdiError(
              `Got undefined previous state for '${toAbsoluteStrPath(currentPath)}'. This should never happen.`,
            );
          }
          levelState = state[key];
        }

        if (rootState !== undefined && resolvedValues[toAbsoluteStrPath(currentPath)] !== undefined) {
          // value is already resolved during this digest; only call reducer once
          nextState[key] = resolvedValues[toAbsoluteStrPath(currentPath)];
        } else {
          nextState[key] = rreduce(reducerOrReducersMap[key], levelState);
        }

        stateChanged = stateChanged || nextState[key] !== levelState;

        currentPath.pop();
      });

      return stateChanged ? nextState : state;
    }

    if (isPlainReducer(reducerOrReducersMap)) {
      let value;

      if (rootState === undefined) {
        value = reducerOrReducersMap(undefined, action);
        checkInitialStateValue(value, currentPath);
      } else {
        value = reducerOrReducersMap(state, action);
      }

      return setResolvedValue(value);
    }

    if (isDiReducer(reducerOrReducersMap)) {
      const currentAbsoluteStrPath = toAbsoluteStrPath(currentPath);

      if (dependenciesCallStack.indexOf(currentAbsoluteStrPath) !== -1) {
        throw new RdiCircularDependencyError([...dependenciesCallStack, currentAbsoluteStrPath]);
      }
      dependenciesCallStack.push(currentAbsoluteStrPath);

      let value;

      if (rootState === undefined) {
        value = reducerOrReducersMap(undefined, action, {});
        checkInitialStateValue(value, currentPath);
      } else {
        const dependenciesSpec = reducerOrReducersMap._rdi; // eslint-disable-line no-underscore-dangle

        // validate dependenciesSpec
        Object.keys(dependenciesSpec).forEach(name => {
          const
            dependencyStrPath = dependenciesSpec[name],
            dependencyAbsoluteStrPath = resolveAbsoluteStrPath(dependencyStrPath, currentPath);

          if (currentAbsoluteStrPath.indexOf(dependencyAbsoluteStrPath + '.') === 0) { // eslint-disable-line prefer-template
            throw new RdiCircularDependencyError([
              toAbsoluteStrPath(currentPath),
              dependencyStrPath,
            ]);
          } else if (dependenciesCallStack.indexOf(dependencyAbsoluteStrPath) !== -1) {
            throw new RdiCircularDependencyError([
              ...dependenciesCallStack,
              dependencyStrPath,
            ]);
          }
        });

        const prevDependencies = {};

        const dependencies = Object.keys(dependenciesSpec).reduce((acc, dependencyName) => {
          const
            dependencyStrPath = dependenciesSpec[dependencyName],
            dependencyAbsoluteStrPath = resolveAbsoluteStrPath(dependencyStrPath, currentPath),
            dependencyAbsolutePath = resolveAbsoluteArrPath(dependencyStrPath, currentPath),
            dependencyState = rpath(dependencyAbsolutePath, rootState);

          let dependencyValue = resolvedValues[dependencyAbsoluteStrPath];

          if (dependencyValue === undefined) {
            const dependencyReducer = rpath(dependencyAbsolutePath, reducers);

            if (!dependencyReducer) {
              throw new RdiError(
                `Missing dependency reducer '${dependencyStrPath}' for '${currentAbsoluteStrPath}'`,
              );
            }

            const tempCurrentPath = currentPath;
            currentPath = dependencyAbsolutePath;
            dependencyValue = rreduce(dependencyReducer, dependencyState);
            currentPath = tempCurrentPath;

            if (dependencyValue === undefined) {
              throw new RdiError(
                `Could not resolve dependency '${dependencyName}' for ex reducer '${currentAbsoluteStrPath}'`,
              );
            }
          }

          prevDependencies[dependencyName] = dependencyState;

          return Object.assign(acc, { [dependencyName]: dependencyValue });
        }, {});

        value = reducerOrReducersMap(
          state,
          action,
          dependencies,
          // new DiChanges(prevDependencies, dependencies), // TODO
        );
      }

      dependenciesCallStack.pop();

      return setResolvedValue(value);
    }

    throw new RdiError(
      `Invalid reducer type at ${toAbsoluteStrPath(currentPath)}.
Expecting plain reducer or DI reducer or tree of the former ones`,
    );
  };

  return rreduce(reducers, rootState);
};
