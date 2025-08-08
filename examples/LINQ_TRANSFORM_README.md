# LINQ-Extensions Transform Functions

This document explains how to use the transform functions that convert better-auth where conditions into linq-extensions compatible predicates.

## Overview

The transform functions in `src/transform-where.ts` provide a bridge between better-auth's query conditions and the linq-extensions library's `where` method. These functions return JavaScript predicate functions that can be used directly with linq-extensions.

## Core Types

### `WherePredicate`

The main type used throughout the system for filtering conditions:

```typescript
export type WherePredicate = (item: any) => boolean
```

This type represents a function that takes an item and returns whether it matches the filtering criteria.

## Available Functions

### `createLinqPredicate(where)`

Creates a predicate function from better-auth CleanedWhere conditions.

**Parameters:**
- `where`: Array of `CleanedWhere` objects from better-auth

**Returns:** `WherePredicate` - A function that can be used with linq-extensions

**Example:**
```typescript
import { createLinqPredicate } from '../src/transform-where'
import type { CleanedWhere } from 'better-auth/adapters'

const conditions: CleanedWhere[] = [
  { field: 'age', operator: 'gt', value: 25, connector: 'AND' },
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
]

const predicate = createLinqPredicate(conditions)
const results = users.where(predicate).toArray()
```

### `transformWhereClause(where)`

Low-level function that transforms CleanedWhere conditions into a predicate function. This is used internally by `createLinqPredicate`.

## Supported Operators

The transform functions support the following operators:

- `eq` - Equality (===)
- `ne` - Not equal (!==)
- `lt` - Less than (<)
- `lte` - Less than or equal (<=)
- `gt` - Greater than (>)
- `gte` - Greater than or equal (>=)
- `in` - Value is in array
- `contains` - String contains substring
- `starts_with` / `startsWith` - String starts with
- `ends_with` / `endsWith` - String ends with

## Usage Patterns

### 1. Basic Filtering

```typescript
// Simple equality check
const conditions: CleanedWhere[] = [
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
]

const activeUsers = users.where(createLinqPredicate(conditions)).toArray()
```

### 2. Complex Conditions

```typescript
// Multiple conditions with operators
const conditions: CleanedWhere[] = [
  { field: 'age', operator: 'gte', value: 18, connector: 'AND' },
  { field: 'age', operator: 'lt', value: 65, connector: 'AND' },
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
]

const workingAgeUsers = users.where(createLinqPredicate(conditions)).toArray()
```

### 3. String Operations

```typescript
// Find users whose email contains 'gmail'
const gmailConditions: CleanedWhere[] = [
  { field: 'email', operator: 'contains', value: 'gmail', connector: 'AND' }
]

const gmailUsers = users.where(createLinqPredicate(gmailConditions)).toArray()
```

### 4. Chaining with Other LINQ Operations

```typescript
// Filter, sort, and select
const conditions: CleanedWhere[] = [
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
]

const userNames = users
  .where(createLinqPredicate(conditions))
  .orderBy(u => u.name)
  .select(u => u.name)
  .toArray()
```

### 5. Integration with Adapter Methods

```typescript
import { AdapterFindManyParams } from '../src/types'

function findUsers(conditions: CleanedWhere[]): AdapterFindManyParams {
  return {
    model: 'user',
    where: createLinqPredicate(conditions)
  }
}

// Usage
const activeUserParams = findUsers([
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
])
```

### 6. Using WherePredicate Type

```typescript
function createEmailFilter(domain: string): WherePredicate {
  const conditions: CleanedWhere[] = [
    { field: 'email', operator: 'contains', value: domain, connector: 'AND' }
  ]
  return createLinqPredicate(conditions)
}

const companyEmailFilter = createEmailFilter('@company.com')
const companyUsers = users.where(companyEmailFilter).toArray()
```

## Error Handling

The transform functions will throw `RivetKitBetterAuthError` for:
- Unknown operators
- Unimplemented scenarios

```typescript
try {
  const conditions: CleanedWhere[] = [
    { field: 'age', operator: 'invalid_op' as any, value: 25, connector: 'AND' }
  ]
  const predicate = createLinqPredicate(conditions)
  const results = data.where(predicate).toArray()
} catch (error) {
  console.error('Transform error:', error.message)
}
```

## Type Safety

The functions work with TypeScript for better type safety:

```typescript
interface User {
  id: string
  name: string
  isActive: boolean
  age: number
}

const users: User[] = [...]
const conditions: CleanedWhere[] = [
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
]

const predicate = createLinqPredicate(conditions)
const activeUsers: User[] = users.where(predicate).toArray()
```

## Performance Considerations

- Predicate functions are created once and can be reused
- linq-extensions provides lazy evaluation
- Use `toArray()` only when you need the final results
- Consider using `take()` and `skip()` for pagination

## Integration with Better-Auth Adapters

The transform functions are designed to work seamlessly with better-auth adapters:

```typescript
// In rivetkit-adapter.ts
findOne: async ({ model, where, select }) => {
  const result = await authActor.findOne({
    model,
    where: createLinqPredicate(where), // CleanedWhere[] -> WherePredicate
    select
  })
  return result
}
```

## Examples

See the example files:
- `examples/linq-transform-usage.ts` - Basic usage examples
- `examples/adapter-integration-example.ts` - Integration with adapter patterns
- `examples/enhanced-types-usage.ts` - Type-safe usage examples

## Migration from Previous Versions

**Before (SimpleWhereCondition):**
```typescript
const conditions = [
  { field: 'isActive', value: true }
]
const predicate = createSimpleLinqPredicate(conditions)
```

**After (CleanedWhere with operators):**
```typescript
const conditions: CleanedWhere[] = [
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
]
const predicate = createLinqPredicate(conditions)
```

## Key Benefits

1. **Type Safety** - Full TypeScript support with `WherePredicate` type
2. **Operator Support** - Rich set of comparison and string operators
3. **LINQ Integration** - Seamless work with linq-extensions
4. **Performance** - Efficient predicate functions with lazy evaluation
5. **Consistency** - Standardized approach across all adapter operations
6. **Flexibility** - Support for complex multi-condition queries
