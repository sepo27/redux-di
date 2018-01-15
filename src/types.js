/* @flow */

// common types
import { ExReducerDependenciesChanges } from './ExReducerDependenciesChanges';

export type Map<Value> = {[key: string]: Value};
export type AnyRealValue = string | number | boolean | Object | Array<AnyRealValue> | null;

export type PlainAction = {type: string};
type Action<Payload> = {type: string; payload: Payload};
type AnyAction = PlainAction | Action<AnyRealValue>;

export type Reducer<State, Action> = (state: State, action: Action) => State; // eslint-disable-line no-shadow
export type SomeActionReducer<State> = Reducer<State, *>;
export type AnyStateReducer = <State: AnyRealValue>(state: State, action: AnyAction) => State;

export type PlainReducer = AnyStateReducer;

export type ExReducerDependenciesSpec = Object;
export type ExReducerDependencies = Map<any>; // any to make it flexible in reducers
export type ExReducer<State> = (
  state: State,
  action: AnyAction,
  dependencies: ExReducerDependencies,
  changes: ExReducerDependenciesChanges,
) => State;
export type ExReducerCallable = {
  <State: AnyRealValue>(
    state: State,
    action: AnyAction,
    dependencies: ExReducerDependencies,
    changes: ExReducerDependenciesChanges,
  ): State;
  _exrd: Object;
};

export type ExReducerTree = Map<PlainReducer | ExReducerCallable | ExReducerTree>;

export type ExCombinedReducer = Reducer<Map<AnyRealValue>, AnyAction>;
