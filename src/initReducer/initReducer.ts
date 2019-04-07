import { Action, AnyAction, Reducer } from '../types'; // eslint-disable-line no-unused-vars

export const initReducer = <S, A extends Action = AnyAction>(
  initialState: S,
  reducer: Reducer<S, A>,
): Reducer<S, A> => (state, action) => (
    state === undefined
      ? initialState
      : reducer(state, action)
  );
