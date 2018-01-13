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
  toArrayPath,
  toStrPath,
} from './utils';

export const exCombineReducers = (tree: ExReducerTree): ExCombinedReducer => { // eslint-disable-line arrow-body-style
  return (rootState, action) => {
    let currentPath = [];
    const
      resolvedValues = {},
      dependenciesCallStack = [];
    const setResolvedValue = value => {
      resolvedValues[toStrPath(currentPath)] = value;
      return value;
    };

    const rreduce = (
      reducerOrTree: PlainReducer | ExReducerCallable | ExReducerTree,
      state: AnyRealValue,
    ): any => {
      if (isPlainObject(reducerOrTree)) {
        if (rootState !== undefined && !isPlainObject(state)) {
          const path = currentPath.length ? `${toStrPath(currentPath)}` : '[root]';
          throw makeError(`Expecting state at '${path}' to be object`);
        }

        const newState = {};
        let stateChanged = false;
        Object.keys(reducerOrTree).forEach(key => {
          currentPath.push(key);

          // $FlowFixMe: TODO: check is done outside function ?
          let keyState;
          if (rootState === undefined) {
            keyState = undefined;
          } else {
            // $FlowFixMe: TODO: check is done outside function ?
            if (state[key] === undefined) {
              throw makeError(
                `Got undefined previous state for '${toStrPath(currentPath)}'. This should never happen.`,
              );
            }
            keyState = state[key];
          }

          if (rootState !== undefined && resolvedValues[toStrPath(currentPath)] !== undefined) {
            // value is already resolved during this digest; only call reducer once
            newState[key] = resolvedValues[toStrPath(currentPath)];
          } else {
            // $FlowFixMe: TODO
            newState[key] = rreduce(reducerOrTree[key], keyState);
          }

          // $FlowFixMe: TODO: check is done outside function ?
          stateChanged = stateChanged || newState[key] !== keyState;

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
        if (dependenciesCallStack.indexOf(toStrPath(currentPath)) !== -1) {
          throw makeCircularDependencyError([...dependenciesCallStack, toStrPath(currentPath)]);
        }

        dependenciesCallStack.push(toStrPath(currentPath));

        let value;

        if (rootState === undefined) {
          value = reducerOrTree(undefined, action, {});
          checkInitialStateValue(value, currentPath);
        } else {
          const dependenciesSpec = reducerOrTree._exrd; // eslint-disable-line no-underscore-dangle

          // validate dependenciesSpec
          Object.keys(dependenciesSpec).forEach(name => {
            const dependencyPathStr = dependenciesSpec[name];
            if (toStrPath(currentPath).indexOf(dependencyPathStr + '.') === 0) { // eslint-disable-line prefer-template
              throw makeCircularDependencyError([toStrPath(currentPath), dependencyPathStr]);
            } else if (dependenciesCallStack.indexOf(dependencyPathStr) !== -1) {
              throw makeCircularDependencyError([...dependenciesCallStack, dependencyPathStr]);
            }
          });

          const dependencies = Object.keys(dependenciesSpec).reduce((acc, dependencyName) => {
            const dependencyPathStr = dependenciesSpec[dependencyName];

            let dependencyValue = resolvedValues[dependencyPathStr];
            if (dependencyValue === undefined) {
              const
                dependencyReducer = rpath(toArrayPath(dependencyPathStr), tree),
                dependencyState = rpath(toArrayPath(dependencyPathStr), rootState);
              if (!dependencyReducer) {
                throw makeError(`Missing dependency reducer '${dependencyPathStr}' for '${toStrPath(currentPath)}'`);
              }

              const tempCurrentPath = currentPath;
              currentPath = toArrayPath(dependencyPathStr);
              // $FlowFixMe: TODO
              dependencyValue = rreduce(dependencyReducer, dependencyState);
              currentPath = tempCurrentPath;

              if (dependencyValue === undefined) {
                throw makeError(
                  `Could not resolve dependency '${dependencyName}' for ex reducer '${toStrPath(currentPath)}'`,
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
