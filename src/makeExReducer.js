/* @flow */

import type {ExReducer, ExReducerDependenciesSpec} from './types';

export const makeExReducer = <S, A>(
  initialState: S,
  dependenciesSpec: ExReducerDependenciesSpec,
  reducer: ExReducer<S, A>,
): ExReducer<S, A> => {
  const exReducer = (
    state,
    action,
    dependencies,
    changes,
  ) => (
    state === undefined ? initialState : reducer(state, action, dependencies, changes)
  );
  exReducer._exrd = dependenciesSpec; // eslint-disable-line no-param-reassign, no-underscore-dangle
  return exReducer;
};
