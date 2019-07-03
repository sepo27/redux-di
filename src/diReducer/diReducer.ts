import { Action, AnyAction } from '../types'; // eslint-disable-line no-unused-vars
import { Dependencies, DependencyMap, DiReducer, DiReducerFn, DiReducerParams } from './types'; // eslint-disable-line no-unused-vars
import { parseDiReducerParams } from './functions';
import { DiSelector } from '../diSelector/DiSelector';
import { isObj } from '../utils/isType';
import { ReduxDiError } from '../utils/ReduxDiError';

const wrapSelectorReducer = (dependencyMap: DependencyMap<DiSelector>, reducer) => (s, a, d) => {
  if (s === undefined) {
    return reducer(s, a, d);
  }

  if (!isObj(d)) {
    throw new ReduxDiError('Invalid dependencies given to diReducer(). Expecting non-empty object.');
  }

  // TODO: think if we still need this
  // if (diffObjectsShape(dependencyMap, d)) {
  //   throw new ReduxDiError(`
  //     Dependency map mismatches dependencies shape.
  //     DependencyMap: ${JSON.stringify(objMap(dependencyMap, v => v.toString()))}.
  //     Dependencies: ${JSON.stringify(d)}.
  //   `);
  // }

  // TODO: see todo above
  const finalDependencies = Object.keys(d).reduce(
    (acc, k) => {
      if (dependencyMap[k] === undefined) {
        return acc;
      }

      // TODO: think how to solve this in better way ..
      const dVal = k.indexOf('.') > -1 ? d[k] : dependencyMap[k].select(d[k]);

      return Object.assign(acc, {
        [k]: dVal,
      });
    },
    {},
  );

  return reducer(s, a, finalDependencies);
};

export const diReducer = <
  S = any,
  A extends Action = AnyAction,
  D extends Dependencies = Dependencies,
>(...params: DiReducerParams<S, A, D>): DiReducer<S, A, D> => { // eslint-disable-line indent
  const [initialState, inDependencyMap, reducer] = parseDiReducerParams(params);

  if (!Object.keys(inDependencyMap).length) {
    throw new ReduxDiError('Empty dependency map given to diReducer.');
  }

  const
    dependencyMap = Object.keys(inDependencyMap).reduce(
      (acc, k) => Object.assign(acc, {
        [k]: inDependencyMap[k] instanceof DiSelector
          ? inDependencyMap[k]
          : new DiSelector(inDependencyMap[k] as string),
      }),
      {},
    ),
    wrapReducer = wrapSelectorReducer(dependencyMap, reducer);

  // TODO
  // if (!Object.keys(dependencyMap).length) {
  //   throw new ReduxDiError('Empty dependency map given to diReducer.');
  // }

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
