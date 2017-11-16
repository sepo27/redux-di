## Redux extended reducers

### Rationale
A function `exCombineReducers()` handles depedency injection into reducers in tree.

### Usage
`exCombineReducers()` accepts reducer tree:
```javascript
const reducerTree = {
  foo: makePlainReducer('initial foo', (state, action) => (
    action.type === 'UPDATE_ACTION' ? 'foo updated' : state
  )),
  bar: makeExReducer('initial foo', {foo: 'foo', fox: 'baz.fox '}, (state, action) => (
    action.type === 'UPDATE_ACTION' ? `${foo} bar updated` : action
  )),
  baz: {
    fox: makeExReducer('initial state', {foo: 'foo'})
  }
};
const rootReducer = exCombineReducers(reducerTree);
```
- `makePlainReducer()`: returns reducer which handles initial state
- `makeExReducer`: returns reducer which handles initial state and has dependency specification stored
- `exCombineReducer()`: returns a root reducer, which will traverse reducers tree and handle depedency injection.

Key features:
- all depedencies are resolved in one cycle for one action
- depedency paths are absolute paths from any place in tree to root state (#1 to introduce relative paths)
- dependent ex reducers and plain reducers can be mixed in any order

Limitations:
- no cycle depedencies
- no dependencies to 'ancestors'

### Development
- update version: `npm version`
- publish: `npm publish`
