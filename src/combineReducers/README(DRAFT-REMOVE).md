
#### Dependency resolution logic
##### Definitions:
- DiR: Dependency injection reducer (can be `diReducer` directly or returned by `combineReducers`)
- CR: Combine reducer

##### Key use cases
(1) CR _without_ any DiR
- CR returns _plain_ reducer

(2) CR with some DiR with _only_ relative paths
- CR returns _plain_ reducer

(3) CR with some DiR with some absolute paths
- CR returns DiR
- dependency map will _only_ contain absolute paths
