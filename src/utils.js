/* @flow */

import type {AnyRealValue, RreduceArgument} from './types';

const
  makeError = (msg: string): Error => new Error(`exCombineReducers(): ${msg}`),
  // TODO: reuse logic form resolve path
  makeInitialStateError = (currentPath: Array<string>): Error => makeError(
    `Reducer "@${currentPath.join('.')}" returned undefined during initialization.
If the state passed to the reducer is undefined, you must explicitly return the initial state.
The initial state may not be undefined. If you don't want to set a value for this reducer,
you can use null instead of undefined.`,
  );

const makeCircularDependencyError = (dependenciesCircle: Array<string>) => {
  let circleMsg = dependenciesCircle.join(' -> ');
  if (circleMsg.length > 100) circleMsg = `\n${dependenciesCircle.join(' -> \n')}`;
  return makeError(`Circular dependency detected: ${circleMsg}`);
};

const isPlainObject = (val: any): boolean /* :: %checks */ => (
  typeof val === 'object' && val !== null && !Array.isArray(val)
);

const isPlainReducer = (val: RreduceArgument): boolean /* :: %checks */ => (
  typeof val === 'function' && !val._exrd // eslint-disable-line no-underscore-dangle
);

/*::
declare function isExReducer(val: RreduceArgument): boolean %checks ( // eslint-disable-line
  typeof val === 'object' && typeof val._exrd === 'object'
);
*/
function isExReducer(val): boolean {
  return typeof val === 'function' && isPlainObject(val._exrd); // eslint-disable-line no-underscore-dangle
}

const
  ABSOLUTE_PATH_PREFIX = '@',
  RELATIVE_PATH_PREFIX = '^',
  PATH_SEPARATOR = '.',
  resolveToAbsolutePath = (path: string, currentPath: Array<string>): Array<string> => {
    if (path[0] === ABSOLUTE_PATH_PREFIX) {
      if (path === ABSOLUTE_PATH_PREFIX) throw makeError(`Absolute path '${path}' is invalid.`);
      return path.substr(1).split(PATH_SEPARATOR);
    } else if (path[0] === RELATIVE_PATH_PREFIX) {
      let i = 0;
      while (path[i] === RELATIVE_PATH_PREFIX) i++;

      const
        levelsUp = i,
        relativePath = path.substr(i),
        basePath = currentPath.slice(0, -1 * levelsUp),
        fullPath = basePath.concat(relativePath.split(PATH_SEPARATOR));

      if (!basePath.length) {
        throw makeError(`Failed to level up for relative path '${path}'. Consider using absolute '@' notation instead`);
      }

      return fullPath;
    }
    throw makeError(
      `Invalid path format given: '${path}'.
Expecting one of:
- @absolute.path: Absolute path prefixed with '@'
- ^relative.path: Relative path prefixed with '^' identifying level(s) up 
`,
    );
  },
  toAbsoluteStrPath = (path: Array<string>): string => `${ABSOLUTE_PATH_PREFIX}${path.join(PATH_SEPARATOR)}`,
  resolveToAbsoluteStrPath = (path: string, currentPath: Array<string>): string =>
    toAbsoluteStrPath(resolveToAbsolutePath(path, currentPath));

const checkInitialStateValue = (value: AnyRealValue | typeof undefined, currentPath: Array<string>) => {
  if (value === undefined) throw makeInitialStateError(currentPath);
  else if (Number.isNaN(value)) throw makeError('NaN is invalid initial state value');
};

export {
  isPlainObject,
  isPlainReducer,
  isExReducer,
  resolveToAbsolutePath,
  toAbsoluteStrPath,
  resolveToAbsoluteStrPath,
  makeError,
  makeInitialStateError,
  makeCircularDependencyError,
  checkInitialStateValue,
};
