import { path as rPath } from 'ramda';
import { AppSel, SelPath } from './types'; // eslint-disable-line no-unused-vars

export const appSel = <S, R>(path: SelPath): AppSel<S, R> => {
  const selector = rPath(path);
  selector._path = path; // eslint-disable-line no-underscore-dangle
  selector.toString = function () { return path; }; // eslint-disable-line func-names
  return selector;
};
