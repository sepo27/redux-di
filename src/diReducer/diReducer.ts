import { Action, AnyAction } from '../types'; // eslint-disable-line no-unused-vars
import { Dependencies, DependencyMap, DiReducer, DiReducerFn } from './types'; // eslint-disable-line no-unused-vars

// TODO: fix eslint indent

type Params<
  S,
  A extends Action = AnyAction,
  D extends Dependencies = Dependencies,
> = [DependencyMap, DiReducerFn<S, A, D>] | [S, DependencyMap, DiReducerFn<S, A, D>];

export const diReducer = <
  S = any,
  A extends Action = AnyAction,
  D extends Dependencies = Dependencies,
>(...params: Params<S, A, D>): DiReducer<S, A, D> => { // eslint-disable-line indent
  const [initialState, dependencyMap, reducer] = params.length === 3
    ? params
    : [undefined, params[0], params[1]];

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
