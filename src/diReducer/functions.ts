import { Dependencies, DependencyMap, DependencyMapInputSelector, DiReducerFn, DiReducerParams } from './types'; // eslint-disable-line no-unused-vars
import { Action, AnyAction, MapS } from '../types'; // eslint-disable-line no-unused-vars
import { DiSelector } from '../diSelector/DiSelector'; // eslint-disable-line no-unused-vars
import { objMap } from '../utils/objMap'; // eslint-disable-line no-unused-vars

type Result<
  S = any,
  A extends Action = AnyAction,
  D extends Dependencies = Dependencies,
> = [S | undefined, DependencyMap<DependencyMapInputSelector>, DiReducerFn<S, A, D>];

export const parseDiReducerParams = <
  S,
  A extends Action = AnyAction,
  D extends Dependencies = Dependencies
>(params: DiReducerParams<S, A, D>): Result<S, A, D> => (
    params.length === 3
      ? params
      : [undefined, params[0], params[1]]
  );

export const dependencyMapToString = (dm: DependencyMap<DiSelector>): MapS<string> =>
  objMap(dm, v => v.toString());
