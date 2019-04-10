import { MapS, Reducer } from '../types'; // eslint-disable-line no-unused-vars
import { DiReducer } from '../diReducer/types'; // eslint-disable-line no-unused-vars

export type StateMapReducerState = MapS<any>;

export type SateMapReducerReducersMap = MapS<Reducer | DiReducer>;
