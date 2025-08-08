import 'linq-extensions'
import {
  AdapterFindManyParams,
  AdapterFindParams,
  AdapterUpdateParams,
  AdapterDeleteParams,
  AdapterCountParams,
  SortByCondition,
  SortDirection,
  User,
  Session,
  Account
} from '../src/types'
import { createLinqPredicate, WherePredicate } from '../src/transform-where'
import type { CleanedWhere } from 'better-auth/adapters'

// Example usage of enhanced types

console.log('=== Enhanced Types Usage Examples ===\n')

// Example 1: Type-safe where conditions using WherePredicate
console.log('1. Type-safe where conditions with WherePredicate:')

const userWhereConditions: CleanedWhere[] = [
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' },
  { field: 'email', operator: 'eq', value: 'user@example.com', connector: 'AND' }
]

const findUserParams: AdapterFindParams = {
  model: 'user',
  where: createLinqPredicate(userWhereConditions)
}

console.log('Find user params structure:', {
  model: findUserParams.model,
  whereType: typeof findUserParams.where
})

// Example 2: Type-safe sorting and pagination
console.log('\n2. Type-safe sorting and pagination:')

const sortConditions: SortByCondition[] = [
  { field: 'createdAt', direction: 'desc' },
  { field: 'name', direction: 'asc' }
]

const findManyConditions: CleanedWhere[] = [
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
]

const findManyParams: AdapterFindManyParams = {
  model: 'user',
  where: createLinqPredicate(findManyConditions),
  sortBy: sortConditions,
  limit: 10,
  offset: 0
}

console.log('Find many params structure:', {
  model: findManyParams.model,
  whereType: typeof findManyParams.where,
  sortBy: findManyParams.sortBy,
  limit: findManyParams.limit,
  offset: findManyParams.offset
})

// Example 3: Update with type safety
console.log('\n3. Type-safe updates:')

const updateConditions: CleanedWhere[] = [
  { field: 'id', operator: 'eq', value: '123', connector: 'AND' }
]

const updateParams: AdapterUpdateParams = {
  model: 'user',
  where: createLinqPredicate(updateConditions),
  update: {
    name: 'Updated Name',
    updatedAt: new Date()
  }
}

console.log('Update params structure:', {
  model: updateParams.model,
  whereType: typeof updateParams.where,
  update: updateParams.update
})

// Example 4: Delete operations
console.log('\n4. Type-safe deletes:')

const deleteConditions: CleanedWhere[] = [
  { field: 'userId', operator: 'eq', value: '123', connector: 'AND' },
  { field: 'expiresAt', operator: 'lt', value: new Date(), connector: 'AND' }
]

const deleteParams: AdapterDeleteParams = {
  model: 'session',
  where: createLinqPredicate(deleteConditions)
}

console.log('Delete params structure:', {
  model: deleteParams.model,
  whereType: typeof deleteParams.where
})

// Example 5: Count with conditions
console.log('\n5. Type-safe counting:')

const countConditions: CleanedWhere[] = [
  { field: 'emailVerified', operator: 'eq', value: true, connector: 'AND' }
]

const countParams: AdapterCountParams = {
  model: 'user',
  where: createLinqPredicate(countConditions)
}

console.log('Count params structure:', {
  model: countParams.model,
  whereType: typeof countParams.where
})

// Example 6: Working with WherePredicate type directly
console.log('\n6. Working with WherePredicate type:')

function createUserFilter(email: string, isActive: boolean): WherePredicate {
  const conditions: CleanedWhere[] = [
    { field: 'email', operator: 'contains', value: email, connector: 'AND' },
    { field: 'isActive', operator: 'eq', value: isActive, connector: 'AND' }
  ]
  return createLinqPredicate(conditions)
}

const userFilter = createUserFilter('example.com', true)
console.log('Created user filter predicate:', typeof userFilter)

// Example 7: Complex conditions with multiple operators
console.log('\n7. Complex conditions with multiple operators:')

const complexConditions: CleanedWhere[] = [
  { field: 'age', operator: 'gte', value: 18, connector: 'AND' },
  { field: 'age', operator: 'lt', value: 65, connector: 'AND' },
  { field: 'email', operator: 'contains', value: '@company.com', connector: 'AND' },
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
]

const complexParams: AdapterFindManyParams = {
  model: 'user',
  where: createLinqPredicate(complexConditions),
  sortBy: [{ field: 'createdAt', direction: 'desc' }],
  limit: 50
}

console.log('Complex query params:', {
  model: complexParams.model,
  conditionsCount: complexConditions.length,
  whereType: typeof complexParams.where
})

// Example 8: Pagination helper function
console.log('\n8. Pagination helper function:')

function createPaginatedQuery(
  model: string,
  conditions: CleanedWhere[] = [],
  page: number = 1,
  pageSize: number = 10
): AdapterFindManyParams {
  return {
    model,
    where: conditions.length > 0 ? createLinqPredicate(conditions) : undefined,
    limit: pageSize,
    offset: (page - 1) * pageSize
  }
}

const paginatedQuery = createPaginatedQuery('user', 
  [{ field: 'isActive', operator: 'eq', value: true, connector: 'AND' }], 
  2, 5
)

console.log('Paginated query:', {
  model: paginatedQuery.model,
  limit: paginatedQuery.limit,
  offset: paginatedQuery.offset,
  hasWhere: !!paginatedQuery.where
})

// Example 9: Type-safe field validation
console.log('\n9. Type-safe field validation:')

function validateCleanedWhereConditions(conditions: CleanedWhere[]): boolean {
  return conditions.every(condition => {
    // Basic validation
    if (!condition.field || typeof condition.field !== 'string') {
      console.error('Invalid field name:', condition.field)
      return false
    }
    
    if (condition.value === undefined) {
      console.error('Undefined value for field:', condition.field)
      return false
    }
    
    if (!condition.operator) {
      console.error('Missing operator for field:', condition.field)
      return false
    }
    
    return true
  })
}

const validConditions: CleanedWhere[] = [
  { field: 'email', operator: 'eq', value: 'test@example.com', connector: 'AND' },
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
]

const invalidConditions: CleanedWhere[] = [
  { field: '', operator: 'eq', value: 'test', connector: 'AND' },
  { field: 'email', operator: 'eq', value: undefined, connector: 'AND' }
]

console.log('Valid conditions:', validateCleanedWhereConditions(validConditions))
console.log('Invalid conditions:', validateCleanedWhereConditions(invalidConditions))

// Example 10: Working with the predicate functions and mock data
console.log('\n10. Using predicate functions with mock data:')

const mockUsers: User[] = [
  { 
    id: '1', 
    name: 'Alice', 
    email: 'alice@test.com', 
    emailVerified: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  },
  { 
    id: '2', 
    name: 'Bob', 
    email: 'bob@test.com', 
    emailVerified: false,
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02')
  }
]

const whereConditions: CleanedWhere[] = [
  { field: 'emailVerified', operator: 'eq', value: true, connector: 'AND' }
]

const predicate = createLinqPredicate(whereConditions)
const filteredUsers = mockUsers.where(predicate).toArray()

console.log('Filtered users:', filteredUsers.map(u => ({ name: u.name, verified: u.emailVerified })))

// Example 11: Demonstrating type safety
console.log('\n11. Type safety demonstration:')

// This would cause a TypeScript error if uncommented:
// const invalidParams: AdapterFindParams = {
//   model: 'user',
//   where: 'invalid string' // Error: Type 'string' is not assignable to type 'WherePredicate'
// }

// This is the correct way:
const correctParams: AdapterFindParams = {
  model: 'user',
  where: createLinqPredicate([
    { field: 'id', operator: 'eq', value: '123', connector: 'AND' }
  ])
}

console.log('Correct params created successfully:', typeof correctParams.where)

console.log('\n=== Enhanced types examples completed ===')
