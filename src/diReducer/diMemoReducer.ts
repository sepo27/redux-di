import * as memoizeOne from 'memoize-one'; // eslint-disable-line import/no-duplicates
import { EqualityFn } from 'memoize-one'; // eslint-disable-line import/no-duplicates, no-unused-vars
import { equals } from 'ramda';
import { Action, AnyAction } from '../types'; // eslint-disable-line no-unused-vars
import { Dependencies, DiReducer, DiReducerParams } from './types'; // eslint-disable-line no-unused-vars
import { diReducer } from './diReducer';
import { parseDiReducerParams } from './functions';

const isEqual: EqualityFn = (nextArgs, prevArgs) => (
  nextArgs.length === prevArgs.length
  && equals(nextArgs[2], prevArgs[2])
);

export const diMemoReducer = <
  S = any,
  A extends Action = AnyAction,
  D extends Dependencies = Dependencies,
>(...params: DiReducerParams<S, A, D>): DiReducer<S, A, D> => { // eslint-disable-line indent
  const
    [initialState, dependencyMap, reducer] = parseDiReducerParams(params),
    memoReducer = memoizeOne(reducer, isEqual);

  return diReducer(initialState, dependencyMap, memoReducer);
};
