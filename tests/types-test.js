/* @flow */
/* eslint-disable */

import type {
  Map,
  ReducerT,
  DiReducerT
} from '../src/types';
import {DiChanges} from "../src/ExReducerDependenciesChanges";
import {makePlainReducer} from "../src/makePlainReducer";
import {makeDiReducer} from "../src/makeDiReducer";
import {combineDiReducers} from "../src/combineDiReducers";

type MyState = {key: string};
type MyAction = {type: 'MY_ACTION1'} | {type: 'MY_ACTION2', payload: string} | {type: 'MY_ACTION3', payload: number};
type MyReducer = ReducerT<MyState, MyAction>;

/**
 * === Make plain reducer
 */

// const myReducer: MyReducer = makePlainReducer({key: ''}, (state, action) => {
//   if (action.type === 'MY_ACTION1') return state;
//   else if (action.type === 'MY_ACTION2') return {key: action.payload};
//   else if (action.type === 'MY_ACTION3') return {key: `${action.payload}`};
//   return state;
// });
//
// myReducer(undefined, {type: 'MY_ACTION1'});
// myReducer({key: ''}, {type: 'MY_ACTION1'});
//
// const mySecondReducer = makePlainReducer('', (state, action) => {
//   if (action.type === 'MY_SECOND_ACTION1') return action.payload;
//   else if (action.type === 'MY_SECOND_ACTION2') return 1;
//   return state;
// });
//
// const dummyReducer = makePlainReducer(1, () => '');

/**
 * === Make ex reducer
 */

const myExReducer: DiReducerT<MyState, MyAction> = makeDiReducer(
  {key: 'string'},
  {foo: '@foo'},
  (state, action, {foo}, changes) => {
    if (changes.for('foo')) return foo;
    else if (action.type === 'MY_ACTION1') return {key: 'My action one changes'};
    else if (action.type === 'MY_ACTION2') return {key: action.payload};
    else if (action.type === 'MY_ACTION3') return {key: `${action.payload}`};
    return state;
  }
);
myExReducer(undefined, {type: 'MY_ACTION1'}, {}, new DiChanges({}, {}));
myExReducer({key: 'Some key'}, {type: 'MY_ACTION1'}, {}, new DiChanges({foo: 1}, {foo: 2}));

// $ExpectError
// myExReducer('', {type: 'MY_ACTION1'}, {}, new ExReducerDependenciesChanges({}, {}));
// myExReducer({key: ''}, {type: 'DUMMY'}, {}, new ExReducerDependenciesChanges({}, {}));
// myExReducer({key: ''}, {type: 'MY_ACTION1'}, '', new ExReducerDependenciesChanges({}, {}));
// myExReducer({key: ''}, {type: 'MY_ACTION1'}, {}, '');

/**
 * === ExCombineReducers
 */

const rootReducer = combineDiReducers({
  foo: makeDiReducer('', {}, (rstate, a) => (a.type === 'BLAH' ? 'blah' : rstate)),
});
