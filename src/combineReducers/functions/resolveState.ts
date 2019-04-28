import { Action, AnyAction, MapS } from '../../types'; // eslint-disable-line no-unused-vars
import { CombineReducersMap, CombineReducersOptions } from '../types'; // eslint-disable-line no-unused-vars
import { ReduxDiError } from '../../utils/ReduxDiError'; // eslint-disable-line no-unused-vars

interface Params<S extends MapS<any>, A extends Action = AnyAction> {
  reducers: CombineReducersMap<S, A>;
  options: CombineReducersOptions<S>;
  state: S;
  resolvePropState: <P extends keyof S>(prop: P) => S[P];
}

export const resolveState = <S extends MapS<any>, A extends Action = AnyAction>(params: Params<S, A>): S => {
  const { reducers, options, state, resolvePropState } = params;

  if (state === undefined && options.initialState) {
    return options.initialState;
  }

  let stateIsChanged = false;

  const nextState = Object
    .keys(reducers)
    .reduce(
      (acc, prop) => {
        const
          propState = state === undefined ? undefined : state[prop],
          nextPropState = resolvePropState(prop);

        if (nextPropState === undefined) {
          throw new ReduxDiError(`Reducer "${prop}" returned undefined.`);
        }

        let resPropState;

        if (nextPropState === propState) {
          resPropState = state[prop];
        } else {
          resPropState = nextPropState;
          stateIsChanged = stateIsChanged || true;
        }

        return Object.assign(acc, { [prop]: resPropState });
      },
      {} as S,
    );

  return stateIsChanged ? nextState : state;
};
