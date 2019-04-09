import { Action, AnyAction } from '../types'; // eslint-disable-line no-unused-vars
import { Dependencies, DiReducer, DiReducerParams } from './types'; // eslint-disable-line no-unused-vars
import { parseDiReducerParams } from './functions';

// TODO: fix eslint indent

export const diReducer = <
  S = any,
  A extends Action = AnyAction,
  D extends Dependencies = Dependencies,
>(...params: DiReducerParams<S, A, D>): DiReducer<S, A, D> => { // eslint-disable-line indent
  const [initialState, dependencyMap, reducer] = parseDiReducerParams(params);

  let reducerWrap;

  if (initialState === undefined) {
    reducerWrap = (s, a, d) => reducer(s, a, d);
  } else {
    reducerWrap = (s, a, d) => (
      s === undefined
        ? initialState
        : reducer(s, a, d)
    );
  }

  reducerWrap._rdi = dependencyMap; // eslint-disable-line no-underscore-dangle

  return reducerWrap;
};
