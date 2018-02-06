### 0.4.0
- Improved flow types

### 0.3.0
New features:
- Introduced dependencies changes detection
```javascript
const reducerTree = {
  foo: makePlainReducer('initial foo', (state, action) => (
    action.type === 'UPDATE_ACTION' ? 'foo updated' : state
  )),
  bar: makeExReducer(
    'initial foo',
    {foo: '@foo', fox: '@baz.fox'},
    (state, action, {foo, fox}, changes: ExReducerDependenciesChanges) => {
        if (changes.for('foo')) return foo;
        else if (changes.for('fox')) return fox;
        return state;
    }
  ),
  baz: {
    fox: makeExReducer(
        'initial state',
        {foo: '@foo'},
        (state, action, {foo}, changes: ExReducerDependenciesChanges) => {
            return changes.yes() ? foo : state;
        }
    )
  }
};
```

### 0.2.0
New features:
- Relative paths have been introduced (see README)

*Breaking changes*:
- Now absolute paths should be used explicitly:
```
{foo: '@foo', bar: '@foo.bar'}
```
