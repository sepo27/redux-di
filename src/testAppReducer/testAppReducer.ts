import { path as rPath, assocPath as rAssocPath } from 'ramda';
import { AppSel } from '../appSelector/types'; // eslint-disable-line no-unused-vars
import { MapS, Reducer } from '../types'; // eslint-disable-line no-unused-vars
import { ReduxDiError } from '../utils/ReduxDiError';
import { toArrPath } from '../utils/path'; // eslint-disable-line no-unused-vars

export const testAppReducer = <S, R>(appReducer: Reducer<S>, selector: AppSel<S, R>): Reducer<R> => {
  const
    selectorPath = selector._path, // eslint-disable-line no-underscore-dangle
    initialAppState = appReducer(undefined, { type: '@@INIT' });

  if (rPath(selectorPath, initialAppState) === undefined) {
    throw new ReduxDiError(`Non existent app selector path "${selectorPath.join('.')}" given to testAppReducer`);
  }

  // @ts-ignore: TODO: think how to return diReducer optionally
  return (state: R, action, dependencies) => {
    let appState = rAssocPath(selectorPath, state, initialAppState); // eslint-disable-line prefer-const

    if (dependencies) {
      Object.keys(dependencies).forEach(dPath => {
        appState = rAssocPath(toArrPath(dPath), dependencies[dPath], appState);
      });
    }

    const nextAppState = appReducer(appState, action);

    return selector(nextAppState);
  };
};
