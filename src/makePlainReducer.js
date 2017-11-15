/* @flow */

import type { AnyActionReducer, AnyRealValue } from './types';

export const makePlainReducer = <InitState: AnyRealValue>(
  initialState: InitState,
  reducer: AnyActionReducer<InitState>,
): AnyActionReducer<InitState> =>
  (state, action) => (state === undefined ? initialState : reducer(state, action));
