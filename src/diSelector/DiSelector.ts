import { ArrPath, ComboPath, isArrPath, isStrPath, toArrPath, toStrPath } from '../utils/path'; // eslint-disable-line no-unused-vars
import { ReduxDiError } from '../utils/ReduxDiError'; // eslint-disable-line no-unused-vars

type DiSelectorSelect = (val: any) => any;

type DiSelectorOptions = {
  select?: DiSelectorSelect,
};

const DiSelectorDefaultOptions: DiSelectorOptions = {
  select: d => d,
};

export class DiSelector {
  readonly path: ArrPath;

  readonly isAbsolute: boolean = false;

  readonly isRelative: boolean = false;

  readonly select: DiSelectorSelect;

  private pathPrefix: string;

  constructor(path: ComboPath, { select }: DiSelectorOptions = DiSelectorDefaultOptions) {
    if (!path.length) {
      throw new ReduxDiError('Empty path given to DiSelector');
    }

    if (isStrPath(path)) {
      this.path = toArrPath(path.substring(1));
      this.pathPrefix = path[0]; // eslint-disable-line prefer-destructuring
    } else if (isArrPath(path)) {
      this.path = [path[0].toString().substring(1), ...path.slice(1)];
      this.pathPrefix = path[0][0]; // eslint-disable-line prefer-destructuring
    }

    if (this.pathPrefix === '@') {
      this.isAbsolute = true;
    } else if (this.pathPrefix === '.') {
      this.isRelative = true;
    } else {
      throw new ReduxDiError(`Invalid path prefix: ${this.pathPrefix}`);
    }

    this.select = select;
  }

  toString(): string {
    return `${this.pathPrefix}${toStrPath(this.path)}`;
  }
}
