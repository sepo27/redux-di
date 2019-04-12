import { Action, AnyAction, Reducer } from '../src/types'; // eslint-disable-line no-unused-vars
import { UPDATE_ACTION } from './actions';
import { initReducer } from '../src/initReducer/initReducer';
import { DependencyMap } from '../src/diReducer/types'; // eslint-disable-line no-unused-vars
import { diReducer } from '../src/diReducer/diReducer';

export const updateStringInitTR = <S extends string, A extends Action = AnyAction>(
  initialValue: string,
): Reducer<string, A> =>
    initReducer(initialValue, (s, a) => (
      a.type === UPDATE_ACTION
        ? `${s} updated`
        : s
    ));

export const updateStringTR = <S extends string, A extends Action = AnyAction>(): Reducer<string, A> =>
  (s, a) => (
    a.type === UPDATE_ACTION
      ? `${s} updated`
      : s
  );

export const sameStateTR = <S = any, A extends Action = AnyAction>(): Reducer<S, A> => s => s;

export const updateStringDiFnTR = (dependencyProp: string) =>
  (s, a, d) => (
    a.type === UPDATE_ACTION
      ? `${s} updated + ${d[dependencyProp]}`
      : s
  );

export const updateStringDiTR = (dependencyMap: DependencyMap, dependencyProp: string) =>
  diReducer<string>(dependencyMap, updateStringDiFnTR(dependencyProp));
