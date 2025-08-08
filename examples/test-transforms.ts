#!/usr/bin/env tsx

import 'linq-extensions'
import { createLinqPredicate } from '../src/transform-where'
import type { CleanedWhere } from 'better-auth/adapters'

// Test data
const testData = [
  { id: '1', name: 'Alice', age: 25, isActive: true, email: 'alice@test.com' },
  { id: '2', name: 'Bob', age: 30, isActive: false, email: 'bob@test.com' },
  { id: '3', name: 'Charlie', age: 35, isActive: true, email: 'charlie@example.com' }
]

function runTests() {
  console.log('🧪 Testing LINQ Transform Functions\n')
  
  let passed = 0
  let failed = 0
  
  function test(name: string, testFn: () => boolean) {
    try {
      const result = testFn()
      if (result) {
        console.log(`✅ ${name}`)
        passed++
      } else {
        console.log(`❌ ${name}`)
        failed++
      }
    } catch (error) {
      console.log(`❌ ${name} - Error: ${(error as Error).message}`)
      failed++
    }
  }
  
  // Test 1: Simple equality
  test('Simple equality filter', () => {
    const conditions: CleanedWhere[] = [
      { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
    ]
    const predicate = createLinqPredicate(conditions)
    const results = testData.where(predicate).toArray()
    return results.length === 2 && results.every(r => r.isActive === true)
  })
  
  // Test 2: Multiple conditions
  test('Multiple AND conditions', () => {
    const conditions: CleanedWhere[] = [
      { field: 'isActive', operator: 'eq', value: true, connector: 'AND' },
      { field: 'age', operator: 'eq', value: 25, connector: 'AND' }
    ]
    const predicate = createLinqPredicate(conditions)
    const results = testData.where(predicate).toArray()
    return results.length === 1 && results[0].name === 'Alice'
  })
  
  // Test 3: Greater than operator
  test('Greater than operator', () => {
    const conditions: CleanedWhere[] = [
      { field: 'age', operator: 'gt', value: 30, connector: 'AND' }
    ]
    const predicate = createLinqPredicate(conditions)
    const results = testData.where(predicate).toArray()
    return results.length === 1 && results[0].name === 'Charlie'
  })
  
  // Test 4: String contains
  test('String contains operator', () => {
    const conditions: CleanedWhere[] = [
      { field: 'email', operator: 'contains', value: 'test', connector: 'AND' }
    ]
    const predicate = createLinqPredicate(conditions)
    const results = testData.where(predicate).toArray()
    return results.length === 2
  })
  
  // Test 5: String starts with
  test('String starts with operator', () => {
    const conditions: CleanedWhere[] = [
      { field: 'name', operator: 'starts_with', value: 'A', connector: 'AND' }
    ]
    const predicate = createLinqPredicate(conditions)
    const results = testData.where(predicate).toArray()
    return results.length === 1 && results[0].name === 'Alice'
  })
  
  // Test 6: Less than or equal
  test('Less than or equal operator', () => {
    const conditions: CleanedWhere[] = [
      { field: 'age', operator: 'lte', value: 30, connector: 'AND' }
    ]
    const predicate = createLinqPredicate(conditions)
    const results = testData.where(predicate).toArray()
    return results.length === 2
  })
  
  // Test 7: Not equal
  test('Not equal operator', () => {
    const conditions: CleanedWhere[] = [
      { field: 'name', operator: 'ne', value: 'Bob', connector: 'AND' }
    ]
    const predicate = createLinqPredicate(conditions)
    const results = testData.where(predicate).toArray()
    return results.length === 2 && !results.some(r => r.name === 'Bob')
  })
  
  // Test 8: Empty conditions
  test('Empty conditions (should return all)', () => {
    const predicate = createLinqPredicate([])
    const results = testData.where(predicate).toArray()
    return results.length === testData.length
  })
  
  // Test 9: Chaining with other LINQ methods
  test('Chaining with orderBy and select', () => {
    const conditions: CleanedWhere[] = [
      { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
    ]
    const predicate = createLinqPredicate(conditions)
    const results = testData
      .where(predicate)
      .orderBy(x => x.age)
      .select(x => x.name)
      .toArray()
    return results.length === 2 && results[0] === 'Alice' && results[1] === 'Charlie'
  })
  
  // Test 10: In operator
  test('In operator', () => {
    const conditions: CleanedWhere[] = [
      { field: 'name', operator: 'in', value: ['Alice', 'Bob'], connector: 'AND' }
    ]
    const predicate = createLinqPredicate(conditions)
    const results = testData.where(predicate).toArray()
    return results.length === 2
  })
  
  // Test 11: Greater than or equal
  test('Greater than or equal operator', () => {
    const conditions: CleanedWhere[] = [
      { field: 'age', operator: 'gte', value: 30, connector: 'AND' }
    ]
    const predicate = createLinqPredicate(conditions)
    const results = testData.where(predicate).toArray()
    return results.length === 2 // Bob and Charlie
  })
  
  // Test 12: String ends with
  test('String ends with operator', () => {
    const conditions: CleanedWhere[] = [
      { field: 'email', operator: 'ends_with', value: '.com', connector: 'AND' }
    ]
    const predicate = createLinqPredicate(conditions)
    const results = testData.where(predicate).toArray()
    return results.length === 3 // All emails end with .com
  })
  
  // Test 13: Complex multiple conditions
  test('Complex multiple conditions', () => {
    const conditions: CleanedWhere[] = [
      { field: 'age', operator: 'gte', value: 25, connector: 'AND' },
      { field: 'age', operator: 'lt', value: 35, connector: 'AND' },
      { field: 'isActive', operator: 'eq', value: true, connector: 'AND' }
    ]
    const predicate = createLinqPredicate(conditions)
    const results = testData.where(predicate).toArray()
    return results.length === 1 && results[0].name === 'Alice'
  })
  
  // Test 14: Error handling for invalid operator
  test('Error handling for invalid operator', () => {
    try {
      const conditions: CleanedWhere[] = [
        { field: 'age', operator: 'invalid_op' as any, value: 25, connector: 'AND' }
      ]
      const predicate = createLinqPredicate(conditions)
      testData.where(predicate).toArray()
      return false // Should have thrown an error
    } catch (error) {
      return true // Expected error
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
