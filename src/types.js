/* @flow */

import { DiChanges } from './ExReducerDependenciesChanges';

export type Map<Value> = {[key: string]: Value};
export type AnyRealValue = string | number | boolean | Object | Array<AnyRealValue> | null;

export type PlainAction = {type: string};

export type Reducer<S, A> = (S, A) => S;
export type ReducerT<S, A> = Reducer<S | typeof undefined, A>

export type DependenciesSpec = Object;
export type Dependencies = Map<any>; // any to make it flexible in reducers
export type DiReducer<S, A> = (
  state: S,
  action: A,
  dependencies: Dependencies,
  changes: DiChanges,
) => S;
export type DiReducerT<S, A> = DiReducer<S | typeof undefined, A>;

export type DiReducerTree = Map<ReducerT<*, *> | DiReducerT<*, *> | DiReducerTree>;

export type ReduceArgument = ReducerT<*, *> | DiReducerT<*, *> | DiReducerTree;
