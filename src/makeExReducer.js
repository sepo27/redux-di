/* @flow */

import type { ExReducer, ExReducerCallable, ExReducerDependenciesSpec, AnyRealValue } from './types';

export const makeExReducer = (
  initialState: AnyRealValue,
  dependenciesSpec: ExReducerDependenciesSpec,
  reducer: ExReducer<any>, // TODO: flow type
  // $FlowFixMe: TODO
): ExReducerCallable => {
  const exReducer = (state, action, dependencies) => (
    state === undefined ? initialState : reducer(state, action, dependencies)
  );
  exReducer._exrd = dependenciesSpec; // eslint-disable-line no-param-reassign, no-underscore-dangle
  return exReducer;
};
