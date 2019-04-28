import { CombineReducersMap } from '../types'; // eslint-disable-line no-unused-vars
import { Action, AnyAction, MapS } from '../../types'; // eslint-disable-line no-unused-vars
import { isDiReducer } from '../../utils/isType';
import { DiReducer } from '../../diReducer/types'; // eslint-disable-line no-unused-vars

export const hasDiReducer = <S extends MapS<any>, A extends Action = AnyAction>(
  reducers: CombineReducersMap<S, A>,
): boolean => Object
    .keys(reducers)
    .some(k => isDiReducer(reducers[k]));

export const hasDiReducerWithAbsolutePath = <S extends MapS<any>, A extends Action = AnyAction>(
  reducers: CombineReducersMap<S, A>,
): boolean => Object
    .keys(reducers)
    .some(k => {
      if (isDiReducer(reducers[k])) {
        const reducer = reducers[k] as DiReducer;
        return Object
          .keys(reducer._rdi) // eslint-disable-line no-underscore-dangle
          .some(dName => reducer._rdi[dName].isAbsolute); // eslint-disable-line no-underscore-dangle
      }

      return false;
    });

export const makePropDName = (prop: string, dName: string): string => `${prop}.${dName}`;
