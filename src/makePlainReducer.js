/* @flow */

import type {Reducer} from './types';

export const makePlainReducer = <S, A>(
  initialState: S,
  reducer: Reducer<S, A>,
): Reducer<S, A> =>
  (state, action) => (state === undefined ? initialState : reducer(state, action));
