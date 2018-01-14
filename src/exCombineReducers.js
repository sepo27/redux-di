/* @flow */

import { path as rpath } from 'ramda';
import type {
  AnyRealValue,
  ExCombinedReducer,
  ExReducerCallable,
  ExReducerTree,
  PlainReducer,
} from './types';
import {
  checkInitialStateValue,
  isExReducer,
  isPlainObject,
  isPlainReducer,
  makeCircularDependencyError,
  makeError,
  resolveToAbsolutePath,
  resolveToAbsoluteStrPath,
  toAbsoluteStrPath,
} from './utils';

export const exCombineReducers = (tree: ExReducerTree): ExCombinedReducer => { // eslint-disable-line arrow-body-style
  return (rootState, action) => {
    let currentPath = [];
    const
      resolvedValues = {},
      dependenciesCallStack = [];

    const setResolvedValue = value => {
      resolvedValues[toAbsoluteStrPath(currentPath)] = value;
      return value;
    };

    const rreduce = (
      reducerOrTree: PlainReducer | ExReducerCallable | ExReducerTree,
      state: AnyRealValue,
    ): any => {
      if (isPlainObject(reducerOrTree)) {
        if (rootState !== undefined && !isPlainObject(state)) {
          const path = currentPath.length ? `${toAbsoluteStrPath(currentPath)}` : '[root]';
          throw makeError(`Expecting state at '${path}' to be object`);
        }

        const newState = {};
        let stateChanged = false;
        Object.keys(reducerOrTree).forEach(key => {
          currentPath.push(key);

          // $FlowFixMe: TODO: check is done outside function ?
          let levelState;
          if (rootState === undefined) {
            levelState = undefined;
          } else {
            // $FlowFixMe: TODO: check is done outside function ?
            if (state[key] === undefined) {
              throw makeError(
                `Got undefined previous state for '${toAbsoluteStrPath(currentPath)}'. This should never happen.`,
              );
            }
            levelState = state[key];
          }

          if (rootState !== undefined && resolvedValues[toAbsoluteStrPath(currentPath)] !== undefined) {
            // value is already resolved during this digest; only call reducer once
            newState[key] = resolvedValues[toAbsoluteStrPath(currentPath)];
          } else {
            // $FlowFixMe: TODO
            newState[key] = rreduce(reducerOrTree[key], levelState);
          }

          // $FlowFixMe: TODO: check is done outside function ?
          stateChanged = stateChanged || newState[key] !== levelState;

          currentPath.pop();
        });
        return stateChanged ? newState : state;
      } else if (isPlainReducer(reducerOrTree)) {
        let value: AnyRealValue;
        if (rootState === undefined) {
          // $FlowFixMe: need for initialization
          value = reducerOrTree(undefined, action);
          checkInitialStateValue(value, currentPath);
        } else {
          // $FlowFixMe: TODO
          value = reducerOrTree(state, action);
        }
        return setResolvedValue(value);
      } else if (isExReducer(reducerOrTree)) {
        const currentAbsoluteStrPath = toAbsoluteStrPath(currentPath);

        if (dependenciesCallStack.indexOf(currentAbsoluteStrPath) !== -1) {
          throw makeCircularDependencyError([...dependenciesCallStack, currentAbsoluteStrPath]);
        }
        dependenciesCallStack.push(currentAbsoluteStrPath);

        let value;

        if (rootState === undefined) {
          value = reducerOrTree(undefined, action, {});
          checkInitialStateValue(value, currentPath);
        } else {
          const dependenciesSpec = reducerOrTree._exrd; // eslint-disable-line no-underscore-dangle

          // validate dependenciesSpec
          Object.keys(dependenciesSpec).forEach(name => {
            const
              dependencyStrPath = dependenciesSpec[name],
              dependencyAbsoluteStrPath = resolveToAbsoluteStrPath(dependencyStrPath, currentPath);
            if (currentAbsoluteStrPath.indexOf(dependencyAbsoluteStrPath + '.') === 0) { // eslint-disable-line prefer-template
              throw makeCircularDependencyError([toAbsoluteStrPath(currentPath), dependencyStrPath]);
            } else if (dependenciesCallStack.indexOf(dependencyAbsoluteStrPath) !== -1) {
              throw makeCircularDependencyError([...dependenciesCallStack, dependencyStrPath]);
            }
          });

          const dependencies = Object.keys(dependenciesSpec).reduce((acc, dependencyName) => {
            const
              dependencyStrPath = dependenciesSpec[dependencyName],
              dependencyAbsoluteStrPath = resolveToAbsoluteStrPath(dependencyStrPath, currentPath),
              dependencyAbsolutePath = resolveToAbsolutePath(dependencyStrPath, currentPath);

            let dependencyValue = resolvedValues[dependencyAbsoluteStrPath];
            if (dependencyValue === undefined) {
              const
                dependencyReducer = rpath(dependencyAbsolutePath, tree),
                dependencyState = rpath(dependencyAbsolutePath, rootState);

              if (!dependencyReducer) {
                throw makeError(`Missing dependency reducer '${dependencyStrPath}' for '${currentAbsoluteStrPath}'`);
              }

              const tempCurrentPath = currentPath;
              currentPath = dependencyAbsolutePath;
              // $FlowFixMe: TODO
              dependencyValue = rreduce(dependencyReducer, dependencyState);
              currentPath = tempCurrentPath;

              if (dependencyValue === undefined) {
                throw makeError(
                  `Could not resolve dependency '${dependencyName}' for ex reducer '${currentAbsoluteStrPath}'`,
                );
              }
            }

            return {...acc, [dependencyName]: dependencyValue};
          }, {});

          value = reducerOrTree(state, action, dependencies);
        }

        dependenciesCallStack.pop();

        return setResolvedValue(value);
      }

      throw makeError('Invalid reducer type. Expecting plain reducer or ex reducer or tree of the former ones');
    };
    return rreduce(tree, rootState);
  };
};
