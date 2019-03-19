/* @flow */

import type {DiReducer, DependenciesSpec} from './types';

export const makeDiReducer = <S, A>(
  initialState: S,
  dependenciesSpec: DependenciesSpec,
  reducer: DiReducer<S, A>,
): DiReducer<S, A> => {
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
