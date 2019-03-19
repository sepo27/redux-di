## Redux extended reducers

### Rationale
A function `combineDiReducers()` handles depedency injection into reducers in tree.

### Usage
`combineDiReducers()` accepts reducer tree:
```javascript
const reducerTree = {
  foo: makePlainReducer('initial foo', (state, action) => (
    action.type === 'UPDATE_ACTION' ? 'foo updated' : state
  )),
  bar: makeDiReducer(
    'initial foo',
    {foo: '@foo', fox: '@baz.fox'},
    (state, action, {foo, fox}, changes: ExReducerDependenciesChanges) => {
        if (changes.for('foo')) return foo;
        else if (changes.for('fox')) return fox;
        return state;
    }
  ),
  baz: {
    fox: makeDiReducer(
        'initial state',
        {foo: '@foo'},
        (state, action, {foo}, changes: ExReducerDependenciesChanges) => {
            return changes.yes() ? foo : state;
        }
    )
  }
};
const rootReducer = combineDiReducers(reducerTree);
```
- `makePlainReducer()`: returns reducer which handles initial state
- `makeDiReducer`: returns reducer which handles initial state and has dependency specification stored
- `combineDiReducers()`: returns a root reducer, which will traverse reducers tree and handle depedency injection.

Key features:
- all depedencies are resolved in one cycle for one action
- dependency paths formats:
  - `@some.path`:  absolute path from any place in tree to root state
  - `^sibling.path`: path to sibling branch
  - `^^parentSibling.path`: path to parent's sibling branch
- dependent ex reducers and plain reducers can be mixed in any order

Limitations:
- no cycle depedencies
- no dependencies to 'ancestors'

### Development
- update version: `npm version`
- publish: `npm publish`
