import { Dependencies } from '../diReducer/types'; // eslint-disable-line no-unused-vars
import { StrPath } from '../utils/diPath'; // eslint-disable-line no-unused-vars
import { DiSelectorFn } from './types'; // eslint-disable-line no-unused-vars

export class DiSelector<D extends Dependencies = Dependencies> {
  private path: StrPath;

  readonly selector: DiSelectorFn<D>;

  constructor(path: StrPath, selector: DiSelectorFn<D>) {
    this.path = path;
    this.selector = selector;
  }

  toString(): string {
    return this.path;
  }
}
