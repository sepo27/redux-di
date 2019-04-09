import { Dependencies, DependencyMap, DiReducerFn, DiReducerParams } from './types'; // eslint-disable-line no-unused-vars
import { Action, AnyAction } from '../types'; // eslint-disable-line no-unused-vars

type Result<
  S = any,
  A extends Action = AnyAction,
  D extends Dependencies = Dependencies,
> = [S | undefined, DependencyMap, DiReducerFn<S, A, D>];

export const parseDiReducerParams = <
  S,
  A extends Action = AnyAction,
  D extends Dependencies = Dependencies
>(params: DiReducerParams<S, A, D>): Result<S, A, D> => (
    params.length === 3
      ? params
      : [undefined, params[0], params[1]]
  );
