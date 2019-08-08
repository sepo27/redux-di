import { chainAction } from './chainAction';
import { actionChainMiddleware } from './actionChainMiddleware';

const
  FIRST_ACTION = 'FIRST_ACTION',
  firstAction = () => ({ type: FIRST_ACTION });

const makeStore = (): [any, any] => {
  const
    reducer = jest.fn(),
    store = {
      dispatch(action) {
        reducer(action);
      },
    };

  return [reducer, store];
};

describe('actionChainMiddleware', () => {
  xit('processes 1 chain action', () => {
    const
      [reducer, store] = makeStore(),
      // @ts-ignore
      middleware = actionChainMiddleware(store)(() => {}),
      action = chainAction([
        FIRST_ACTION,
      ]);

    middleware(action);
    middleware(firstAction());

    expect(reducer.mock.calls.length).toEqual(2);
  });
});
