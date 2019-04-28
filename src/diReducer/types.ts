import { Action, AnyAction, MapS } from '../types'; // eslint-disable-line no-unused-vars
import { DiSelector } from '../diSelector/DiSelector'; // eslint-disable-line no-unused-vars

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

export type DependencyMapInputSelector = string | DiSelector;

export type DependencyMap<T> = MapS<T>;

export type DiReducerParams<
  S,
  A extends Action = AnyAction,
  D extends Dependencies = Dependencies,
> = [DependencyMap<DependencyMapInputSelector>, DiReducerFn<S, A, D>]
  | [S, DependencyMap<DependencyMapInputSelector>, DiReducerFn<S, A, D>];

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
  _rdi: DependencyMap<DiSelector>,
};
