import { Action, AnyAction, MapS, Reducer } from '../types'; // eslint-disable-line no-unused-vars
import { DiReducer } from '../diReducer/types'; // eslint-disable-line no-unused-vars

export type CombineReducersState = MapS<any>;

export type CombineReducersMap<S, A extends Action = AnyAction> = {
  [K in keyof S]: Reducer<S[K], A> | DiReducer<S[K], A>
};

export interface CombineReducersOptions<S extends CombineReducersState> {
  initialState?: S;
}
