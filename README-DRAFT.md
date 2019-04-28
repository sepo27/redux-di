
## Dependency resolution logic
Every "di reducer" can specify dependency map in the form:
```javascript
{
  DEPENDENCY_NAME: DEPENDENCY_SELECTOR,
}
```

Where:
- `DEPENDENCY_NAME`: arbitrary name with which dependency value will be injected into reducer
- `DEPENDENCY_SELECTOR`: string path to locate dependency in state tree or `DiSelector` (see below)

_Example_
```javascript
const reducer = diReducer({ foo: '@foo' }, (s, a, { foo }) => { /* Reducer body */ });
```

Here, `foo` is dependency name and `@foo` is dependency path.

### Dependency path
There can be two types of dependency paths: absolute and relative.

Absolute paths are prefixed with `@` sign (see in the example above).  
These will locate dependency from the root of the state tree.

Relative paths are prefixed with `.` sign and are locating dependency _only_ on the same level.
