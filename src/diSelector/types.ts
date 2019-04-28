import { Dependencies } from '../diReducer/types'; // eslint-disable-line no-unused-vars

export type DiSelectorFn<D extends Dependencies> = (dependencies: D) => any;
