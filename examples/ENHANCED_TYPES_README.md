# Enhanced Types Documentation

This document explains the enhanced type system for the better-auth adapter, which provides better type safety, more comprehensive querying capabilities, and improved developer experience.

## Overview

The enhanced types in `src/types.ts` provide:
- Type-safe where conditions with operators
- Comprehensive sorting options
- Pagination support
- Field validation
- Query builder patterns
- Better integration with linq-extensions

## Core Types

### Where Conditions

#### `SimpleWhereCondition`
Basic field-value equality conditions:
```typescript
interface SimpleWhereCondition {
  field: string
  value: any
}
```

#### `AdvancedWhereCondition`
Advanced conditions with operators:
```typescript
interface AdvancedWhereCondition {
  field: string
  operator: WhereOperator
  value: any
  connector: WhereConnector
}
```

#### `WhereOperator`
Supported query operators:
```typescript
type WhereOperator = 
  | 'eq'           // Equal
  | 'ne'           // Not equal
  | 'lt'           // Less than
  | 'lte'          // Less than or equal
  | 'gt'           // Greater than
  | 'gte'          // Greater than or equal
  | 'in'           // Value in array
  | 'contains'     // String contains
  | 'starts_with'  // String starts with
  | 'startsWith'   // Alternative syntax
  | 'ends_with'    // String ends with
  | 'endsWith'     // Alternative syntax
```

### Sorting

#### `SortByCondition`
Type-safe sorting specification:
```typescript
interface SortByCondition {
  field: string
  direction: SortDirection // 'asc' | 'desc'
}
```

### Pagination

#### `PaginationParams`
Flexible pagination options:
```typescript
interface PaginationParams {
  page?: number      // Page number (1-based)
  pageSize?: number  // Items per page
  offset?: number    // Direct offset
  limit?: number     // Direct limit
}
```

#### `PaginatedResult<T>`
Comprehensive pagination result:
```typescript
interface PaginatedResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  hasNext: boolean
  hasPrevious: boolean
}
```

## Enhanced Adapter Parameters

### `AdapterFindParams`
```typescript
interface AdapterFindParams {
  model: string
  where: SimpleWhereCondition[]
  select?: string[]
}
```

### `AdapterFindManyParams`
```typescript
interface AdapterFindManyParams {
  model: string
  where?: SimpleWhereCondition[]
  limit?: number
  sortBy?: SortByCondition[]
  offset?: number
  select?: string[]
}
```

### `AdapterUpdateParams`
```typescript
interface AdapterUpdateParams {
  model: string
  where: SimpleWhereCondition[]
  update: any
  select?: string[]
}
```

### `AdapterDeleteParams`
```typescript
interface AdapterDeleteParams {
  model: string
  where: SimpleWhereCondition[]
}
```

### `AdapterCountParams`
```typescript
interface AdapterCountParams {
  model: string
  where?: SimpleWhereCondition[]
}
```

## Usage Examples

### Basic Querying
```typescript
import { AdapterFindManyParams, SimpleWhereCondition } from './types'

const params: AdapterFindManyParams = {
  model: 'user',
  where: [
    { field: 'isActive', value: true },
    { field: 'emailVerified', value: true }
  ],
  sortBy: [
    { field: 'createdAt', direction: 'desc' }
  ],
  limit: 10,
  offset: 0
}
```

### Pagination
```typescript
function createPaginatedQuery(
  model: string,
  where: SimpleWhereCondition[] = [],
  page: number = 1,
  pageSize: number = 10
): AdapterFindManyParams {
  return {
    model,
    where,
    limit: pageSize,
    offset: (page - 1) * pageSize
  }
}
```

### Type-Safe Updates
```typescript
const updateParams: AdapterUpdateParams = {
  model: 'user',
  where: [{ field: 'id', value: '123' }],
  update: {
    name: 'New Name',
    updatedAt: new Date()
  },
  select: ['id', 'name', 'updatedAt']
}
```

### Query Builder Pattern
```typescript
class QueryBuilder {
  private params: Partial<AdapterFindManyParams> = {}
  
  constructor(model: string) {
    this.params.model = model
  }
  
  where(conditions: SimpleWhereCondition[]): this {
    this.params.where = conditions
    return this
  }
  
  orderBy(field: string, direction: 'asc' | 'desc' = 'asc'): this {
    if (!this.params.sortBy) this.params.sortBy = []
    this.params.sortBy.push({ field, direction })
    return this
  }
  
  limit(count: number): this {
    this.params.limit = count
    return this
  }
  
  build(): AdapterFindManyParams {
    return this.params as AdapterFindManyParams
  }
}

// Usage
const query = new QueryBuilder('user')
  .where([{ field: 'isActive', value: true }])
  .orderBy('createdAt', 'desc')
  .limit(20)
  .build()
```

## Integration with LINQ Extensions

The enhanced types work seamlessly with the transform functions:

```typescript
import { createSimpleLinqPredicate } from './transform-where'

const conditions: SimpleWhereCondition[] = [
  { field: 'isActive', value: true }
]

const predicate = createSimpleLinqPredicate(conditions)
const results = data.where(predicate).toArray()
```

## Validation

### Field Validation
```typescript
interface FieldValidation {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}
```

### Model Validation
```typescript
interface ModelValidation {
  [fieldName: string]: FieldValidation
}
```

## Benefits

1. **Type Safety**: Catch errors at compile time
2. **IntelliSense**: Better IDE support and autocomplete
3. **Consistency**: Standardized parameter formats
4. **Flexibility**: Support for complex queries
5. **Integration**: Seamless work with linq-extensions
6. **Validation**: Built-in validation support
7. **Documentation**: Self-documenting code through types

## Migration Guide

### From Old Types
```typescript
// Old
const params = {
  model: 'user',
  where: [{ field: 'email', value: 'test@example.com' }]
}

// New (same syntax, better types)
const params: AdapterFindParams = {
  model: 'user',
  where: [{ field: 'email', value: 'test@example.com' }]
}
```

### Adding Sorting
```typescript
// Old (not supported)
// New
const params: AdapterFindManyParams = {
  model: 'user',
  where: [{ field: 'isActive', value: true }],
  sortBy: [{ field: 'createdAt', direction: 'desc' }]
}
```

### Adding Pagination
```typescript
// Old (manual)
const params = {
  model: 'user',
  limit: 10,
  offset: 20
}

// New (type-safe)
const params: AdapterFindManyParams = {
  model: 'user',
  limit: 10,
  offset: 20
}
```

## See Also

- `examples/enhanced-types-usage.ts` - Comprehensive usage examples
- `examples/linq-transform-usage.ts` - LINQ integration examples
- `src/transform-where.ts` - Transform function implementations
