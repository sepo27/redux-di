import { Action, AnyAction, DependenciesSpec, DiReducerFn, DiReducer } from './types'; // eslint-disable-line no-unused-vars

export const diReducer = <S = any, A extends Action = AnyAction>(
  initialState: S,
  dependenciesSpec: DependenciesSpec,
  reducer: DiReducerFn<S, A>,
): DiReducer<S, A> => {
  const diReducerWrap = (state, action, dependecies) => (
    state === undefined
      ? initialState
      : reducer(state, action, dependecies)
  );

  diReducerWrap._rdi = dependenciesSpec; // eslint-disable-line no-underscore-dangle

  return diReducerWrap;
};
