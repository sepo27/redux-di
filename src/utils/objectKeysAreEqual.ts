import { MapS } from '../types'; // eslint-disable-line no-unused-vars

export const objectKeysEqual = (o1: MapS<any>, o2: MapS<any>): boolean => {
  const
    keys1 = Object.keys(o1),
    keys2 = Object.keys(o2);

  if (keys1.length !== keys2.length) {
    return false;
  }

  if (
    keys1.some(k => o2[k] === undefined)
    || keys2.some(k => o1[k] === undefined)
  ) {
    return false;
  }

  return true;
};

export const objectKeysNotEqual = (o1: MapS<any>, o2: MapS<any>): boolean =>
  !objectKeysEqual(o1, o2);
