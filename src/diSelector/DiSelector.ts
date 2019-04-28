import { ArrPath, ComboPath, isArrPath, isStrPath, toArrPath } from '../utils/diPath'; // eslint-disable-line no-unused-vars
import { ReduxDiError } from '../utils/ReduxDiError'; // eslint-disable-line no-unused-vars

type DiSelectorSelect = (val: any) => any;

export class DiSelector {
  readonly path: ArrPath;

  readonly isAbsolute: boolean = false;

  readonly isRelative: boolean = false;

  readonly select: DiSelectorSelect;

  constructor(path: ComboPath, select: DiSelectorSelect = val => val) {
    let pathPrefix;

    if (!path.length) {
      throw new ReduxDiError('Empty path given to DiSelector');
    }

    if (isStrPath(path)) {
      this.path = toArrPath(path.substring(1));
      pathPrefix = path[0]; // eslint-disable-line prefer-destructuring
    } else if (isArrPath(path)) {
      this.path = [path[0].substring(1), ...path.slice(1)];
      pathPrefix = path[0][0]; // eslint-disable-line prefer-destructuring
    }

    if (!this.path.length) {
      throw new ReduxDiError('Empty path given to DiSelector');
    }

    if (pathPrefix === '@') {
      this.isAbsolute = true;
    } else if (pathPrefix === '.') {
      this.isRelative = true;
    } else {
      throw new ReduxDiError(`Invalid path prefix: ${pathPrefix}`);
    }

    this.select = select;
  }
}
