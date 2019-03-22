import { ArrPath } from '../types'; // eslint-disable-line no-unused-vars
import { RdiError } from './RdiError';
import { toAbsoluteStrPath } from './pathFunctions';

export const checkInitialStateValue = (value: any, currentPath: ArrPath) => {
  if (value === undefined) {
    throw new RdiError(
      `Reducer "@${toAbsoluteStrPath(currentPath)}" returned undefined during initialization.
If the state passed to the reducer is undefined, you must explicitly return the initial state.
The initial state may not be undefined. If you don't want to set a value for this reducer,
you can use null instead of undefined.`,
    );
  } else if (Number.isNaN(value)) {
    throw new RdiError(`NaN is invalid initial state value at: ${toAbsoluteStrPath(currentPath)}`);
  }
};
