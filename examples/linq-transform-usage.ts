import 'linq-extensions'
import { createLinqPredicate, transformWhereClause, WherePredicate } from '../src/transform-where'
import type { CleanedWhere } from 'better-auth/adapters'

// Sample data for testing
interface User {
  id: string
  name: string
  email: string
  age: number
  isActive: boolean
  tags: string[]
}

const users: User[] = [
  { id: '1', name: 'Alice', email: 'alice@example.com', age: 25, isActive: true, tags: ['admin', 'user'] },
  { id: '2', name: 'Bob', email: 'bob@example.com', age: 30, isActive: false, tags: ['user'] },
  { id: '3', name: 'Charlie', email: 'charlie@example.com', age: 35, isActive: true, tags: ['moderator', 'user'] },
  { id: '4', name: 'Diana', email: 'diana@example.com', age: 28, isActive: true, tags: ['user'] },
  { id: '5', name: 'Eve', email: 'eve@example.com', age: 22, isActive: false, tags: ['guest'] }
]

console.log('=== LINQ-Extensions Transform Usage Examples ===\n')

// Example 1: Basic equality conditions
console.log('1. Basic equality conditions:')
const basicConditions: CleanedWhere[] = [
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' },
  { field: 'age', operator: 'eq', value: 25, connector: 'AND' }
]

const basicPredicate = createLinqPredicate(basicConditions)
const activeUsers25 = users.where(basicPredicate).toArray()
console.log('Active users aged 25:', activeUsers25.map(u => u.name))

// Example 2: Advanced conditions with operators
console.log('\n2. Advanced conditions with operators:')
const advancedConditions: CleanedWhere[] = [
  { field: 'age', operator: 'gt', value: 25, connector: 'AND' },
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
]

const advancedPredicate = createLinqPredicate(advancedConditions)
const activeUsersOver25 = users.where(advancedPredicate).toArray()
console.log('Active users over 25:', activeUsersOver25.map(u => `${u.name} (${u.age})`))

// Example 3: String operations
console.log('\n3. String operations:')
const stringConditions: CleanedWhere[] = [
  { field: 'name', operator: 'starts_with', value: 'A', connector: 'AND' }
]

const stringPredicate = createLinqPredicate(stringConditions)
const usersStartingWithA = users.where(stringPredicate).toArray()
console.log('Users whose name starts with A:', usersStartingWithA.map(u => u.name))

// Example 4: Contains operation
console.log('\n4. Contains operation:')
const containsConditions: CleanedWhere[] = [
  { field: 'email', operator: 'contains', value: 'example', connector: 'AND' }
]

const containsPredicate = createLinqPredicate(containsConditions)
const exampleUsers = users.where(containsPredicate).toArray()
console.log('Users with example.com email:', exampleUsers.map(u => u.email))

// Example 5: Chaining with other LINQ operations
console.log('\n5. Chaining with other LINQ operations:')
const chainConditions: CleanedWhere[] = [
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
]

const chainPredicate = createLinqPredicate(chainConditions)
const activeUserNames = users
  .where(chainPredicate)
  .orderBy(u => u.age)
  .select(u => `${u.name} (${u.age})`)
  .toArray()

console.log('Active users ordered by age:', activeUserNames)

// Example 6: Using WherePredicate type for function parameters
console.log('\n6. Function with WherePredicate parameter:')
function findUsersByPredicate(userData: User[], predicate: WherePredicate): User[] {
  return userData.where(predicate).toArray()
}

const youngActiveConditions: CleanedWhere[] = [
  { field: 'age', operator: 'lt', value: 30, connector: 'AND' },
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
]

const youngActivePredicate = createLinqPredicate(youngActiveConditions)
const youngActiveUsers = findUsersByPredicate(users, youngActivePredicate)

console.log('Young active users:', youngActiveUsers.map(u => `${u.name} (${u.age})`))

// Example 7: Complex filtering with dynamic conditions
console.log('\n7. Complex filtering with dynamic conditions:')
function createUserFilter(filters: {
  minAge?: number
  maxAge?: number
  isActive?: boolean
  nameStartsWith?: string
}): WherePredicate {
  const conditions: CleanedWhere[] = []
  
  if (filters.minAge !== undefined) {
    conditions.push({ field: 'age', operator: 'gte', value: filters.minAge, connector: 'AND' })
  }
  
  if (filters.maxAge !== undefined) {
    conditions.push({ field: 'age', operator: 'lte', value: filters.maxAge, connector: 'AND' })
  }
  
  if (filters.isActive !== undefined) {
    conditions.push({ field: 'isActive', operator: 'eq', value: filters.isActive, connector: 'AND' })
  }
  
  if (filters.nameStartsWith) {
    conditions.push({ field: 'name', operator: 'starts_with', value: filters.nameStartsWith, connector: 'AND' })
  }
  
  return createLinqPredicate(conditions)
}

const filterPredicate = createUserFilter({
  minAge: 25,
  maxAge: 32,
  isActive: true
})

const filteredUsers = users.where(filterPredicate).toArray()
console.log('Users aged 25-32 who are active:', filteredUsers.map(u => `${u.name} (${u.age})`))

// Example 8: Error handling
console.log('\n8. Error handling:')
try {
  const invalidConditions: CleanedWhere[] = [
    { field: 'age', operator: 'invalid_op' as any, value: 25, connector: 'AND' }
  ]
  
  const invalidPredicate = createLinqPredicate(invalidConditions)
  users.where(invalidPredicate).toArray()
} catch (error) {
  console.log('Caught expected error:', error.message)
}

// Example 9: Using transformWhereClause directly
console.log('\n9. Using transformWhereClause directly:')
const directConditions: CleanedWhere[] = [
  { field: 'age', operator: 'gte', value: 30, connector: 'AND' }
]

const directPredicate = transformWhereClause(directConditions)
const matureUsers = users.where(directPredicate).toArray()
console.log('Users 30 and older:', matureUsers.map(u => `${u.name} (${u.age})`))

// Example 10: Empty conditions (returns all items)
console.log('\n10. Empty conditions:')
const emptyPredicate = createLinqPredicate([])
const allUsers = users.where(emptyPredicate).toArray()
console.log('All users (empty conditions):', allUsers.map(u => u.name))

console.log('\n=== Examples completed ===')
