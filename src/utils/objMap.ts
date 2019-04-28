import { MapS } from '../types'; // eslint-disable-line no-unused-vars

// TODO: test

export const objMap = <V1 = any, V2 = any>(obj: MapS<V1>, cb: (v: V1, k: string) => V2): MapS<V2> =>
  Object
    .keys(obj)
    .reduce(
      (acc, k) => Object.assign(acc, {
        [k]: cb(obj[k], k),
      }),
      {} as any,
    );
