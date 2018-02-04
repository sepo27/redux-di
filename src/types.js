/* @flow */

import { ExReducerDependenciesChanges } from './ExReducerDependenciesChanges';

export type Map<Value> = {[key: string]: Value};
export type AnyRealValue = string | number | boolean | Object | Array<AnyRealValue> | null;

export type PlainAction = {type: string};

export type Reducer<S, A> = (S, A) => S;
export type ReducerT<S, A> = Reducer<S | typeof undefined, A>

export type ExReducerDependenciesSpec = Object;
export type ExReducerDependencies = Map<any>; // any to make it flexible in reducers
export type ExReducer<S, A> = (
  state: S,
  action: A,
  dependencies: ExReducerDependencies,
  changes: ExReducerDependenciesChanges,
) => S;
export type ExReducerT<S, A> = ExReducer<S | typeof undefined, A>;

export type ExReducerTree = Map<ReducerT<*, *> | ExReducerT<*, *> | ExReducerTree>;

export type RreduceArgument = ReducerT<*, *> | ExReducerT<*, *> | ExReducerTree;
