import { isStr } from './isType';

export type StrPath = string;
export type ArrPath = (string|number)[];
export type ComboPath = StrPath | ArrPath;

export const toArrPath = (path: StrPath): ArrPath => path.split('.');

export const isArrPath = (path: ComboPath): path is ArrPath => Array.isArray(path);

export const toStrPath = (path: ArrPath): StrPath => path.join('.');

export const isStrPath = (path: ComboPath): path is StrPath => isStr(path);
