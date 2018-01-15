/* @flow */

import type { ExReducer, ExReducerCallable, ExReducerDependenciesSpec, AnyRealValue } from './types';

export const makeExReducer = (
  initialState: AnyRealValue,
  dependenciesSpec: ExReducerDependenciesSpec,
  reducer: ExReducer<any>, // TODO: flow type
  // $FlowFixMe: TODO
): ExReducerCallable => {
  // $FlowFixMe: TODO
  const exReducer = (state, action, dependencies, changes) => (
    state === undefined ? initialState : reducer(state, action, dependencies, changes)
  );
  exReducer._exrd = dependenciesSpec; // eslint-disable-line no-param-reassign, no-underscore-dangle
  return exReducer;
};
