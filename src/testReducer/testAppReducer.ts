import { path as rPath, assocPath as rAssocPath } from 'ramda';
import { AppSel } from '../appSelector/types'; // eslint-disable-line no-unused-vars
import { MapS, Reducer } from '../types'; // eslint-disable-line no-unused-vars
import { dummyAction } from '../../tests/actions';
import { ReduxDiError } from '../utils/ReduxDiError';
import { isDiReducer } from '../utils/isType';
import { DiSelector } from '..'; // eslint-disable-line no-unused-vars

const findReducerDependencies = (reducer, selectorPath): MapS<DiSelector> => { // eslint-disable-line consistent-return
  if (reducer._reducers) { // eslint-disable-line no-underscore-dangle
    const reducerKeys = Object.keys(reducer._reducers); // eslint-disable-line no-underscore-dangle
    for (let i = 0; i < reducerKeys.length; i++) {
      const key = reducerKeys[i];
      if (selectorPath.indexOf(key) === 0) {
        return findReducerDependencies(reducer._reducers[key], selectorPath.slice(1)); // eslint-disable-line no-underscore-dangle
      }
    }
  } else if (isDiReducer(reducer) && selectorPath.length === 0) {
    return reducer._rdi; // eslint-disable-line no-underscore-dangle
  }
};

export const testAppReducer = <S, R>(appReducer: Reducer<S>, selector: AppSel<S, R>): Reducer<R> => {
  const
    selectorPath = selector._path, // eslint-disable-line no-underscore-dangle
    initialAppState = appReducer(undefined, dummyAction());

  if (rPath(selectorPath, initialAppState) === undefined) {
    throw new ReduxDiError(`Non existent app selector path "${selectorPath.join('.')}" given to testAppReducer`);
  }

  // @ts-ignore: TODO: think how to return diReducer optionally
  return (state: R, action, dependencies) => {
    let appState = rAssocPath(selectorPath, state, initialAppState); // eslint-disable-line prefer-const

    if (dependencies) {
      const reducerDependencies = findReducerDependencies(appReducer, selectorPath);

      Object.keys(reducerDependencies).forEach(dKey => {
        const
          d = reducerDependencies[dKey],
          dPath = d.isRelative
            ? selectorPath.slice(0, -1).concat(d.path)
            : d.path;

        appState = rAssocPath(dPath, dependencies[dKey], appState);
      });
    }

    const nextAppState = appReducer(appState, action);

    return selector(nextAppState);
  };
};
