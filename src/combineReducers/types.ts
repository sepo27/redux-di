import { Action, AnyAction, MapS, Reducer } from '../types'; // eslint-disable-line no-unused-vars
import { DiReducer } from '../diReducer/types'; // eslint-disable-line no-unused-vars

export type CombineReducersState = MapS<any>;

export type CombineReducersMap<S, A extends Action = AnyAction> = {
  [K in keyof S]: Reducer<S[K], A> | DiReducer<S[K], A>
};

export interface CombineReducersOptions<S extends CombineReducersState> {
  initialState?: S;
  isRoot?: boolean;
}

type CombineReducersResultPlainReducer<S extends MapS<any> = {}, A extends Action = AnyAction> =
  Reducer<S, A> & {
    _reducers: CombineReducersMap<S, A>,
  };

type CombineReducersResultDiReducer<S extends MapS<any> = {}, A extends Action = AnyAction> =
  DiReducer<S, A> & {
    _reducers: CombineReducersMap<S, A>,
  };

export type CombineReducersResultReducer<S extends MapS<any>, A extends Action = AnyAction> =
  CombineReducersResultPlainReducer<S, A>
  | CombineReducersResultDiReducer<S, A>;
