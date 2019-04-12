import { SateMapReducerReducersMap, StateMapReducerState } from './types'; // eslint-disable-line no-unused-vars
import { isObj } from '../utils/isType';
import { ReduxDiError } from '../utils/ReduxDiError';
import { objectKeysNotEqual } from '../utils/objectKeysAreEqual';

export const validateStateMapReducerParams = (
  initialState: StateMapReducerState,
  reducers: SateMapReducerReducersMap<any>,
) => {
  if (!isObj(initialState) || !Object.keys(initialState).length) {
    throw new ReduxDiError('Invalid initial state given to stateMapReducer. Expecting non-empty object.');
  }

  if (!isObj(reducers) || !Object.keys(reducers).length) {
    throw new ReduxDiError('Invalid reducers map given to stateMapReducer. Expecting non-empty object of reducers.');
  }

  if (objectKeysNotEqual(initialState, reducers)) {
    throw new ReduxDiError('Initial state - reducers map shape mismatch.');
  }
};

interface GetNextStateParams<S extends StateMapReducerState> {
  initialState: S,
  reducers: SateMapReducerReducersMap<S>,
  state: S,
  getPropState: (prop: string) => any,
}

export const getStateMapReducerState = <S extends StateMapReducerState>(
  {
    initialState,
    reducers,
    state,
    getPropState,
  }: GetNextStateParams<S>,
): S => {
  if (state === undefined) return initialState;

  let stateIsChanged = false;

  const nextState = Object
    .keys(reducers)
    .reduce(
      (acc, prop) => {
        const nextPropState = getPropState(prop);

        if (nextPropState === undefined) {
          throw new ReduxDiError(`Reducer "${prop}" returned undefined.`);
        }

        if (nextPropState === state[prop]) {
          return Object.assign(acc, { [prop]: state[prop] });
        }

        stateIsChanged = stateIsChanged || true;

        return Object.assign(acc, { [prop]: nextPropState });
      },
      {} as S,
    );

  return stateIsChanged ? nextState : state;
};
