import { CombineReducersMap } from '../types'; // eslint-disable-line no-unused-vars
import { Action, AnyAction, MapS } from '../../types'; // eslint-disable-line no-unused-vars
import { isDiReducer } from '../../utils/isType';

export const hasDiReducer = <S extends MapS<any>, A extends Action = AnyAction>(
  reducers: CombineReducersMap<S, A>,
): boolean => Object
    .keys(reducers)
    .some(k => isDiReducer(reducers[k]));

export const makePropDName = (prop: string, dName: string): string => `${prop}.${dName}`;
