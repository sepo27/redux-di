/* @flow */

import type { AnyRealValue, ExReducerCallable, ExReducerTree, PlainReducer } from './types';

const isPlainObject = (val: any): boolean /* :: %checks */ => (
  typeof val === 'object' && val !== null && !Array.isArray(val)
);

const isPlainReducer = (
  val: PlainReducer | ExReducerCallable | ExReducerTree,
): boolean /* :: %checks */ => (
  typeof val === 'function' && !val._exrd // eslint-disable-line no-underscore-dangle
);

/*::
declare function isExReducer(val: PlainReducer | ExReducerCallable | ExReducerTree): boolean %checks ( // eslint-disable-line
  typeof val === 'object' && typeof val._exrd === 'object'
);
*/
function isExReducer(val): boolean {
  return typeof val === 'function' && isPlainObject(val._exrd); // eslint-disable-line no-underscore-dangle
}

const
  toArrayPath = (path: string): Array<string> => path.split('.'),
  toStrPath = (path: Array<string>): string => path.join('.')
  ;

const makeError = (msg: string): Error => new Error(`exCombineReducers(): ${msg}`);

const makeInitialStateError = (currentPath: Array<string>): Error => makeError(
  `Reducer "${toStrPath(currentPath)}" returned undefined during initialization.
If the state passed to the reducer is undefined, you must explicitly return the initial state.
The initial state may not be undefined. If you don't want to set a value for this reducer,
you can use null instead of undefined.`,
);

const makeCircularDependencyError = (dependenciesCircle: Array<string>) => {
  let circleMsg = dependenciesCircle.join(' -> ');
  if (circleMsg.length > 100) circleMsg = `\n${dependenciesCircle.join(' -> \n')}`;
  return makeError(`Circular dependency detected: ${circleMsg}`);
};

const checkInitialStateValue = (value: AnyRealValue | typeof undefined, currentPath: Array<string>) => {
  if (value === undefined) throw makeInitialStateError(currentPath);
  else if (Number.isNaN(value)) throw makeError('NaN is invalid initial state value');
};

export {
  isPlainObject,
  isPlainReducer,
  isExReducer,
  toStrPath,
  toArrayPath,
  makeError,
  makeInitialStateError,
  makeCircularDependencyError,
  checkInitialStateValue,
};
