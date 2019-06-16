import { Action, AnyAction } from '../types'; // eslint-disable-line no-unused-vars
import { Dependencies, DiReducer, DiReducerFn, DiReducerParams } from './types'; // eslint-disable-line no-unused-vars
import { parseDiReducerParams } from './functions';
import { DiSelector } from '../diSelector/DiSelector_DEPRECATED';
import { isObj } from '../utils/isType';
import { ReduxDiError } from '../utils/ReduxDiError';

const wrapSelectorReducer = (dependencyMap, reducer) => (s, a, d) => {
  if (s === undefined) {
    return reducer(s, a, d);
  }

  if (!isObj(d)) {
    throw new ReduxDiError('Invalid dependencies given to diReducer(). Expecting non-empty object.');
  }

  const findDependencies = Object.keys(d).reduce(
    (acc, k) => Object.assign(acc, {
      [k]: dependencyMap[k] instanceof DiSelector
        ? dependencyMap[k].selector(d[k])
        : d[k],
    }),
    {},
  );

  return reducer(s, a, findDependencies);
};

export const diReducer = <
  S = any,
  A extends Action = AnyAction,
  D extends Dependencies = Dependencies,
>(...params: DiReducerParams<S, A, D>): DiReducer<S, A, D> => { // eslint-disable-line indent
  const [initialState, dependencyMap, reducer] = parseDiReducerParams(params);

  if (!Object.keys(dependencyMap).length) {
    throw new ReduxDiError('Empty dependency map given to diReducer.');
  }

  const wrapReducer = wrapSelectorReducer(dependencyMap, reducer);

  let resReducer;

  if (initialState === undefined) {
    resReducer = wrapReducer;
  } else {
    resReducer = (s, a, d) => (
      s === undefined
        ? initialState
        : wrapReducer(s, a, d)
    );
  }

  resReducer._rdi = dependencyMap; // eslint-disable-line no-underscore-dangle

  return resReducer;
};
