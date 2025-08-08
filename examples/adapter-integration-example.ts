import 'linq-extensions'
import { createLinqPredicate, WherePredicate } from '../src/transform-where'
import { AdapterFindParams, AdapterFindManyParams, AdapterUpdateParams, AdapterDeleteParams, AdapterCountParams } from '../src/types'
import type { CleanedWhere } from 'better-auth/adapters'

// Example showing how to integrate the transform functions in a better-auth adapter

interface AuthRecord {
  id: string
  userId?: string
  email?: string
  providerId?: string
  accountId?: string
  createdAt: Date
  updatedAt: Date
  [key: string]: any
}

// Mock data store
const mockDataStore = {
  users: [
    { id: '1', email: 'user1@example.com', name: 'User One', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
    { id: '2', email: 'user2@example.com', name: 'User Two', createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02') },
    { id: '3', email: 'admin@example.com', name: 'Admin User', createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-03') }
  ],
  accounts: [
    { id: '1', userId: '1', providerId: 'google', accountId: 'google123', createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
    { id: '2', userId: '2', providerId: 'github', accountId: 'github456', createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02') },
    { id: '3', userId: '3', providerId: 'google', accountId: 'google789', createdAt: new Date('2024-01-03'), updatedAt: new Date('2024-01-03') }
  ],
  sessions: [
    { id: '1', userId: '1', token: 'token123', expiresAt: new Date('2024-12-31'), createdAt: new Date('2024-01-01'), updatedAt: new Date('2024-01-01') },
    { id: '2', userId: '2', token: 'token456', expiresAt: new Date('2024-12-31'), createdAt: new Date('2024-01-02'), updatedAt: new Date('2024-01-02') }
  ]
}

// Example adapter methods using the new WherePredicate approach

/**
 * Find one record using WherePredicate
 */
function findOne<T extends AuthRecord>(
  tableName: keyof typeof mockDataStore,
  params: AdapterFindParams
): T | null {
  const records = mockDataStore[tableName] as T[]
  
  return records.where(params.where).firstOrDefault() || null
}

/**
 * Find many records using WherePredicate
 */
function findMany<T extends AuthRecord>(
  tableName: keyof typeof mockDataStore,
  params: AdapterFindManyParams
): T[] {
  const records = mockDataStore[tableName] as T[]
  let query: any = records
  
  // Apply where conditions if specified
  if (params.where) {
    query = query.where(params.where)
  }
  
  // Apply sorting if specified
  if (params.sortBy && params.sortBy.length > 0) {
    const sortField = params.sortBy[0].field
    const sortDirection = params.sortBy[0].direction
    
    if (sortDirection === 'desc') {
      query = query.orderByDescending((item: any) => item[sortField])
    } else {
      query = query.orderBy((item: any) => item[sortField])
    }
  }
  
  // Apply offset and limit
  if (params.offset) {
    query = query.skip(params.offset)
  }
  
  if (params.limit) {
    query = query.take(params.limit)
  }
  
  return query.toArray()
}

/**
 * Update records using WherePredicate
 */
function updateMany<T extends AuthRecord>(
  tableName: keyof typeof mockDataStore,
  params: AdapterUpdateParams
): number {
  const records = mockDataStore[tableName] as T[]
  const matchingRecords = records.where(params.where).toArray()
  
  matchingRecords.forEach(record => {
    Object.assign(record, params.update, { updatedAt: new Date() })
  })
  
  return matchingRecords.length
}

/**
 * Delete records using WherePredicate
 */
function deleteMany(
  tableName: keyof typeof mockDataStore,
  params: AdapterDeleteParams
): number {
  const records = mockDataStore[tableName]
  const matchingRecords = records.where(params.where).toArray()
  const matchingIds = matchingRecords.map(r => r.id)
  
  // Remove matching records
  const remainingRecords = records.where(r => !matchingIds.includes(r.id)).toArray()
  
  // Update the store (in a real implementation, this would be handled differently)
  ;(mockDataStore[tableName] as any[]) = remainingRecords
  
  return matchingRecords.length
}

/**
 * Count records using WherePredicate
 */
function count(
  tableName: keyof typeof mockDataStore,
  params: AdapterCountParams
): number {
  const records = mockDataStore[tableName]
  
  if (params.where) {
    return records.where(params.where).count()
  }
  
  return records.length
}

// Example usage demonstrations
console.log('=== Adapter Integration Examples ===\n')

// Example 1: Find user by email using CleanedWhere conditions
console.log('1. Find user by email:')
const emailConditions: CleanedWhere[] = [
  { field: 'email', operator: 'eq', value: 'user1@example.com', connector: 'AND' }
]

const findUserParams: AdapterFindParams = {
  model: 'user',
  where: createLinqPredicate(emailConditions)
}

const user = findOne('users', findUserParams)
console.log('Found user:', user?.name)

// Example 2: Find all Google accounts
console.log('\n2. Find all Google accounts:')
const googleConditions: CleanedWhere[] = [
  { field: 'providerId', operator: 'eq', value: 'google', connector: 'AND' }
]

const findAccountsParams: AdapterFindManyParams = {
  model: 'account',
  where: createLinqPredicate(googleConditions)
}

const googleAccounts = findMany('accounts', findAccountsParams)
console.log('Google accounts:', googleAccounts.map(a => a.accountId))

// Example 3: Find users created after a specific date
console.log('\n3. Find users created after a specific date:')
const dateConditions: CleanedWhere[] = [
  { field: 'createdAt', operator: 'gt', value: new Date('2024-01-01'), connector: 'AND' }
]

const findRecentParams: AdapterFindManyParams = {
  model: 'user',
  where: createLinqPredicate(dateConditions)
}

const recentUsers = findMany('users', findRecentParams)
console.log('Recent users:', recentUsers.map(u => u.name))

// Example 4: Count total sessions
console.log('\n4. Count total sessions:')
const countParams: AdapterCountParams = {
  model: 'session'
}

const sessionCount = count('sessions', countParams)
console.log('Total sessions:', sessionCount)

// Example 5: Update user information
console.log('\n5. Update user information:')
const updateConditions: CleanedWhere[] = [
  { field: 'email', operator: 'eq', value: 'admin@example.com', connector: 'AND' }
]

const updateParams: AdapterUpdateParams = {
  model: 'user',
  where: createLinqPredicate(updateConditions),
  update: { name: 'Super Admin' }
}

const updatedCount = updateMany('users', updateParams)
console.log('Updated records:', updatedCount)

// Verify the update
const verifyParams: AdapterFindParams = {
  model: 'user',
  where: createLinqPredicate(updateConditions)
}

const updatedUser = findOne('users', verifyParams)
console.log('Updated user name:', updatedUser?.name)

// Example 6: Complex query with multiple conditions
console.log('\n6. Complex query - find accounts for specific users:')
const userIdConditions: CleanedWhere[] = [
  { field: 'userId', operator: 'in', value: ['1', '2'], connector: 'AND' }
]

const findUserAccountsParams: AdapterFindManyParams = {
  model: 'account',
  where: createLinqPredicate(userIdConditions)
}

const userAccounts = findMany('accounts', findUserAccountsParams)
console.log('User accounts:', userAccounts.map(a => `${a.providerId}:${a.accountId}`))

// Example 7: Pagination example
console.log('\n7. Pagination example:')
const paginationParams: AdapterFindManyParams = {
  model: 'user',
  limit: 2,
  offset: 0
}

const page1 = findMany('users', paginationParams)

const page2Params: AdapterFindManyParams = {
  model: 'user',
  limit: 2,
  offset: 2
}

const page2 = findMany('users', page2Params)
console.log('Page 1:', page1.map(u => u.name))
console.log('Page 2:', page2.map(u => u.name))

// Example 8: Using WherePredicate directly
console.log('\n8. Using WherePredicate directly:')
function createEmailPredicate(email: string): WherePredicate {
  const conditions: CleanedWhere[] = [
    { field: 'email', operator: 'contains', value: email, connector: 'AND' }
  ]
  return createLinqPredicate(conditions)
}

const emailPredicate = createEmailPredicate('example.com')
const exampleUsers = mockDataStore.users.where(emailPredicate).toArray()
console.log('Users with example.com emails:', exampleUsers.map(u => u.email))

console.log('\n=== Integration examples completed ===')
