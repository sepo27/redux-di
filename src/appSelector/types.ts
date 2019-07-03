import { StrPath } from '../utils/path'; // eslint-disable-line no-unused-vars

export type SelPath = (string|number)[];

export type AppSel<S extends {} = {}, R = any> = {
  (appState: S): R,
  _path: SelPath,
  toString: () => StrPath,
  spawn: <R>(path: SelPath) => AppSel<S, R>;
};
