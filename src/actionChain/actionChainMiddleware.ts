import { Middleware } from 'redux'; // eslint-disable-line no-unused-vars
import { CHAIN_ACTION } from './chainAction';

export const actionChainMiddleware: Middleware = store => next => action => { // eslint-disable-line
  if (action.type === CHAIN_ACTION) {
    // chainState
  }

  return next(action);
};
