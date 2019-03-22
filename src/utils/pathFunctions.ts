import { ArrPath, StrPath } from '../types'; // eslint-disable-line no-unused-vars
import { RdiError } from './RdiError';

const Path = {
  ABSOLUTE_PREFIX: '@',
  RELATIVE_PREFIX: '^',
  SEPARATOR: '.',
};

export const
  toStrPath = (path: ArrPath): StrPath => path.join(Path.SEPARATOR),
  toAbsoluteStrPath = (path: ArrPath): StrPath => `${Path.ABSOLUTE_PREFIX}${toStrPath(path)}`;

export const resolveAbsoluteArrPath = (path: StrPath, currentPath: ArrPath): ArrPath => {
  if (path[0] === Path.ABSOLUTE_PREFIX) {
    if (path === Path.ABSOLUTE_PREFIX) throw new RdiError(`Absolute path '${path}' is invalid.`);
    return path.substr(1).split(Path.SEPARATOR);
  }

  if (path[0] === Path.RELATIVE_PREFIX) {
    let i = 0;
    while (path[i] === Path.RELATIVE_PREFIX) i++;

    const
      levelsUp = i,
      relativePath = path.substr(i),
      basePath = currentPath.slice(0, -1 * levelsUp),
      fullPath = basePath.concat(relativePath.split(Path.SEPARATOR));

    if (!basePath.length) {
      throw new RdiError(
        `Failed to level up for relative path '${path}'. Consider using absolute '@' notation instead`,
      );
    }

    return fullPath;
  }

  throw new RdiError(`
Invalid path format given: '${path}'.
Expecting one of:
- @absolute.path: Absolute path prefixed with '@'
- ^relative.path: Relative path prefixed with '^' identifying level(s) up 
  `);
};

export const resolveAbsoluteStrPath = (path: StrPath, currentPath: ArrPath): StrPath =>
  toStrPath(resolveAbsoluteArrPath(path, currentPath));
