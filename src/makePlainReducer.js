/* @flow */

import type { SomeActionReducer } from './types';

export const makePlainReducer = <State>(
  initialState: State,
  reducer: SomeActionReducer<State>,
): SomeActionReducer<State> =>
  (state, action) => (state === undefined ? initialState : reducer(state, action));
