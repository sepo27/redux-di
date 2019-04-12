import { Action, AnyAction, MapS, Reducer } from '../types'; // eslint-disable-line no-unused-vars
import { RootReducersMap } from './types'; // eslint-disable-line no-unused-vars
import { makeRootReducerResolver } from './makeRootReducerResolver'; // eslint-disable-line no-unused-vars

export const rootReducer = <S extends MapS<any>, A extends Action = AnyAction>(
  reducers: RootReducersMap<S, A>,
): Reducer<S, A> => (state, action) => {
    const resolver = makeRootReducerResolver(reducers);

    const nextState = {} as S;

    let stateIsChanged = false;

    Object.keys(reducers).forEach(prop => {
      const
        propState = state === undefined ? undefined : state[prop],
        propNextState = resolver(state, action, prop);

      if (propState !== propNextState) {
        stateIsChanged = stateIsChanged || true;
      }

      nextState[prop] = propNextState;
    });

    return stateIsChanged ? nextState : state;
  };
