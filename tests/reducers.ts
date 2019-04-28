import { Action, AnyAction } from '../src/types'; // eslint-disable-line no-unused-vars
import { initReducer } from '../src/initReducer/initReducer';
import { UPDATE_ACTION } from './actions';

export const strUpdateTR = <S extends string, A extends Action = AnyAction>(initialState: string = '') =>
  initReducer<string>(
    initialState,
    (s, a) => (a.type === UPDATE_ACTION ? `${s} updated` : s),
  );

export const strDummyTR = () => s => s;

export const strUpdateDiTR = (dependencyProp: string) =>
  (s, a, d) => (
    a.type === UPDATE_ACTION
      ? `${s} updated + ${d[dependencyProp]}`
      : s
  );
