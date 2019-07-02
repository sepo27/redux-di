
export type MapS<V> = { [K: string]: V };

export interface Action<T extends string = any> {
  type: T,
}

export interface AnyAction extends Action {
  [P: string]: any,
}

export type Reducer<S = any, A extends Action = AnyAction> = (
  state: S | undefined,
  action: A,
) => S;
