#!/usr/bin/env tsx

import 'linq-extensions'
import { createLinqPredicate, WherePredicate } from '../src/transform-where'
import { AdapterFindParams, AdapterFindManyParams, AdapterUpdateParams, AdapterDeleteParams, AdapterCountParams } from '../src/types'
import type { CleanedWhere } from 'better-auth/adapters'

// Mock the required types and functions for testing
interface MockContext {
  state: { [key: string]: any[] }
  vars: { tableNames: { [key: string]: string } }
  log: { error: (msg: string, error?: any) => void }
}

// Mock data for testing
const mockUsers = [
  { id: '1', email: 'alice@test.com', name: 'Alice', age: 25, isActive: true },
  { id: '2', email: 'bob@test.com', name: 'Bob', age: 30, isActive: false },
  { id: '3', email: 'charlie@test.com', name: 'Charlie', age: 35, isActive: true },
  { id: '4', email: 'diana@test.com', name: 'Diana', age: 28, isActive: true }
]

// Create a mock context
const mockContext: MockContext = {
  state: {
    users: mockUsers
  },
  vars: {
    tableNames: {
      user: 'users'
    }
  },
  log: {
    error: (msg: string, error?: any) => console.error(msg, error)
  }
}

// Test the findOne function logic
function testFindOne() {
  console.log('🧪 Testing findOne logic with WherePredicate\n')
  
  const conditions: CleanedWhere[] = [
    { field: 'email', operator: 'eq', value: 'alice@test.com', connector: 'AND' }
  ]
  
  const params: AdapterFindParams = {
    model: 'user',
    where: createLinqPredicate(conditions)
  }
  
  try {
    const tableName = mockContext.vars.tableNames[params.model]
    
    if (mockContext.state[tableName]) {
      const records = mockContext.state[tableName] as any[]
      const found = records.where(params.where).firstOrDefault()
      const result = found || null
      
      console.log('✅ findOne test passed')
      console.log('Found user:', result?.name)
      return result?.name === 'Alice'
    }
    
    return false
  } catch (error) {
    console.log('❌ findOne test failed:', (error as Error).message)
    return false
  }
}

// Test the findMany function logic
function testFindMany() {
  console.log('\n🧪 Testing findMany logic with WherePredicate\n')
  
  const conditions: CleanedWhere[] = [
    { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
  ]
  
  const params: AdapterFindManyParams = {
    model: 'user',
    where: createLinqPredicate(conditions),
    sortBy: [{ field: 'age', direction: 'asc' }],
    limit: 2,
    offset: 0
  }
  
  try {
    const tableName = mockContext.vars.tableNames[params.model]
    
    if (mockContext.state[tableName]) {
      const records = mockContext.state[tableName] as any[]
      let query: any = records
      
      // Apply where conditions
      if (params.where) {
        query = query.where(params.where)
      }
      
      // Apply sorting
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
      
      const results = query.toArray()
      
      console.log('✅ findMany test passed')
      console.log('Found users:', results.map((u: any) => `${u.name} (${u.age})`))
      
      // Verify results: should be active users, sorted by age, limited to 2
      const expectedNames = ['Alice', 'Diana'] // Ages 25, 28 (sorted)
      const actualNames = results.map((u: any) => u.name)
      
      return results.length === 2 && 
             results.every((u: any) => u.isActive === true) &&
             actualNames[0] === expectedNames[0] &&
             actualNames[1] === expectedNames[1]
    }
    
    return false
  } catch (error) {
    console.log('❌ findMany test failed:', (error as Error).message)
    return false
  }
}

// Test complex filtering
function testComplexFiltering() {
  console.log('\n🧪 Testing complex filtering\n')
  
  const conditions: CleanedWhere[] = [
    { field: 'isActive', operator: 'eq', value: true, connector: 'AND' },
    { field: 'age', operator: 'eq', value: 25, connector: 'AND' }
  ]
  
  const params: AdapterFindManyParams = {
    model: 'user',
    where: createLinqPredicate(conditions)
  }
  
  try {
    const tableName = mockContext.vars.tableNames[params.model]
    
    if (mockContext.state[tableName]) {
      const records = mockContext.state[tableName] as any[]
      const results = records.where(params.where!).toArray()
      
      console.log('✅ Complex filtering test passed')
      console.log('Found users:', results.map((u: any) => `${u.name} (age: ${u.age}, active: ${u.isActive})`))
      
      // Should find only Alice (active and age 25)
      return results.length === 1 && results[0].name === 'Alice'
    }
    
    return false
  } catch (error) {
    console.log('❌ Complex filtering test failed:', (error as Error).message)
    return false
  }
}

// Test update functionality
function testUpdate() {
  console.log('\n🧪 Testing update logic\n')
  
  const conditions: CleanedWhere[] = [
    { field: 'email', operator: 'eq', value: 'bob@test.com', connector: 'AND' }
  ]
  
  const params: AdapterUpdateParams = {
    model: 'user',
    where: createLinqPredicate(conditions),
    update: { name: 'Robert', age: 31 }
  }
  
  try {
    const tableName = mockContext.vars.tableNames[params.model]
    
    if (mockContext.state[tableName]) {
      const records = mockContext.state[tableName] as any[]
      const recordIndex = records.findIndex(params.where)
      
      if (recordIndex !== -1) {
        const updatedRecord = { ...records[recordIndex], ...params.update }
        records[recordIndex] = updatedRecord
        
        console.log('✅ Update test passed')
        console.log('Updated user:', updatedRecord.name)
        return updatedRecord.name === 'Robert' && updatedRecord.age === 31
      }
    }
    
    return false
  } catch (error) {
    console.log('❌ Update test failed:', (error as Error).message)
    return false
  }
}

// Test count functionality
function testCount() {
  console.log('\n🧪 Testing count logic\n')
  
  const conditions: CleanedWhere[] = [
    { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
  ]
  
  const params: AdapterCountParams = {
    model: 'user',
    where: createLinqPredicate(conditions)
  }
  
  try {
    const tableName = mockContext.vars.tableNames[params.model]
    
    if (mockContext.state[tableName]) {
      const records = mockContext.state[tableName] as any[]
      const count = records.where(params.where!).count()
      
      console.log('✅ Count test passed')
      console.log('Active users count:', count)
      
      // Should count 3 active users (Alice, Charlie, Diana)
      return count === 3
    }
    
    return false
  } catch (error) {
    console.log('❌ Count test failed:', (error as Error).message)
    return false
  }
}

// Test WherePredicate type usage
function testWherePredicateType() {
  console.log('\n🧪 Testing WherePredicate type usage\n')
  
  try {
    // Test creating a predicate function
    const createAgePredicate = (minAge: number): WherePredicate => {
      const conditions: CleanedWhere[] = [
        { field: 'age', operator: 'gte', value: minAge, connector: 'AND' }
      ]
      return createLinqPredicate(conditions)
    }
    
    const agePredicate = createAgePredicate(30)
    const records = mockContext.state.users
    const results = records.where(agePredicate).toArray()
    
    console.log('✅ WherePredicate type test passed')
    console.log('Users 30+:', results.map((u: any) => `${u.name} (${u.age})`))
    
    // Should find Bob (30) and Charlie (35)
    return results.length === 2
  } catch (error) {
    console.log('❌ WherePredicate type test failed:', (error as Error).message)
    return false
  }
}

// Run all tests
function runTests() {
  console.log('=== Testing Default Actions with WherePredicate ===\n')
  
  const tests = [
    { name: 'findOne', test: testFindOne },
    { name: 'findMany', test: testFindMany },
    { name: 'complex filtering', test: testComplexFiltering },
    { name: 'update', test: testUpdate },
    { name: 'count', test: testCount },
    { name: 'WherePredicate type', test: testWherePredicateType }
  ]
  
  let passed = 0
  let failed = 0
  
  tests.forEach(({ name, test }) => {
    if (test()) {
      passed++
    } else {
      failed++
    }
  })
  
  console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed`)
  
  if (failed === 0) {
    console.log('🎉 All tests passed!')
    return true
  } else {
    console.log('💥 Some tests failed!')
    return false
  }
}

// Run the tests
if (require.main === module) {
  const success = runTests()
  process.exit(success ? 0 : 1)
}

export { runTests }
