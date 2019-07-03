import { path as rPath } from 'ramda';
import { AppSel, SelPath } from './types'; // eslint-disable-line no-unused-vars
import { toStrPath } from '../utils/path'; // eslint-disable-line no-unused-vars

export const appSel = <S, R>(path: SelPath): AppSel<S, R> => {
  const selector = rPath(path);
  selector._path = path; // eslint-disable-line no-underscore-dangle
  selector.toString = () => toStrPath(path);
  return selector;
};
