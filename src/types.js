/* @flow */

// common types
type Map<Value> = {[key: string]: Value};
export type AnyRealValue = string | number | boolean | Object | Array<AnyRealValue> | null;

export type PlainAction = {type: string};
type Action<Payload> = {type: string; payload: Payload};
type AnyAction = PlainAction | Action<AnyRealValue>;

type Reducer<State, Action> = (state: State, action: Action) => State;
export type AnyActionReducer<State> = Reducer<State, AnyAction>;
export type AnyReducer = <State: AnyRealValue>(state: State, action: AnyAction) => State;

export type PlainReducer = AnyReducer;

export type ExReducerDependenciesSpec = Object;
export type ExReducerDependencies = Map<any>; // any to make it flexible in reducers\
export type ExReducer<State> = (state: State, action: AnyAction, dependencies: ExReducerDependencies) => State;
export type ExReducerCallable = {
  <State: AnyRealValue>(state: State, action: AnyAction, dependencies: ExReducerDependencies): State;
  _exrd: Object;
};

export type ExReducerTree = Map<PlainReducer | ExReducerCallable | ExReducerTree>;

export type ExCombinedReducer = Reducer<Map<AnyRealValue>, AnyAction>;
