import { Action, AnyAction, MapS } from '../types'; // eslint-disable-line no-unused-vars

export type Dependencies = MapS<any>;

export type DiReducerFn<
  S = any,
  A extends Action = AnyAction,
  D extends Dependencies = Dependencies,
> = (
  state: S,
  action: A,
  dependencies: Dependencies,
) => S;

export type DependencyMapSelector = string; // TODO

export type DependencyMap = MapS<DependencyMapSelector>;

export type DiReducerParams<
  S,
  A extends Action = AnyAction,
  D extends Dependencies = Dependencies,
> = [DependencyMap, DiReducerFn<S, A, D>] | [S, DependencyMap, DiReducerFn<S, A, D>];

export type DiReducer<
  S = any,
  A extends Action = AnyAction,
  D extends Dependencies = Dependencies
> = {
  (
    state: S,
    action: A,
    dependencies: Dependencies,
  ): S,
  _rdi: DependencyMap,
};
