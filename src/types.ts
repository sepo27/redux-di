
// Common

export type MapT<V> = { [K: string]: V };

export type ArrPath = string[];
export type StrPath = string;

// Actions

export interface Action<T = any> {
  type: T
}

export interface AnyAction extends Action {
  [P: string]: any
}

// Reducers

export type Reducer<S = any, A extends Action = AnyAction> = (
  state: S | undefined,
  action: A
) => S;

export type Dependencies = MapT<any>;
export type DependenciesSpec = MapT<StrPath>;

export type DiReducerFn<S = any, A extends Action = AnyAction> = (
  state: S,
  action: A,
  dependencies: Dependencies,
) => S;

export type DiReducer<S = any, A extends Action = AnyAction> = {
  (
    state: S,
    action: A,
    dependencies: Dependencies,
  ): S,
  _rdi: DependenciesSpec,
};

export type ReducersMapTree<S = any, A extends Action = Action> = {
  [K in keyof S]: Reducer<S[K], A> | {}
}

export type ReducersMap<S = any, A extends Action = Action> = {
  [K in keyof S]: Reducer<S[K], A>
}
