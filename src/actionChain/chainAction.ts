export const
  CHAIN_ACTION = 'CHAIN_ACTION',
  chainAction = (chain: string[], payload?: any) => ({
    type: CHAIN_ACTION,
    chain,
    payload,
  });
