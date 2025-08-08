# rivetkit-better-auth

Adapter to use [better-auth](https://www.better-auth.com) with [RivetKit](https://rivetkit.com) actors

## Installation

```sh
pnpm add @joshua1/rivetkit-better-auth

# or

npm i @joshua1/rivetkit-better-auth
```

## Overview

This adapter provides seamless integration between Better Auth and RivetKit actors, allowing you to use Better Auth's authentication system with RivetKit's actor-based architecture. The adapter handles data operations through RivetKit actors and provides LINQ-style querying capabilities.

## Features

- **RivetKit Actor Integration** - Works with RivetKit's actor system
- **LINQ-Extensions Support** - Advanced querying with LINQ-style operations
- **Type Safety** - Full TypeScript support with proper type inference
- **Flexible Querying** - Support for complex where conditions and operators
- **Better Auth Compatibility** - Full compatibility with Better Auth's adapter interface

## Usage

### Basic Setup

First, set up your RivetKit actor that will handle authentication data operations:


```typescript
// auth-actor.ts
import { defineActor } from '@rivetkit/actor'
import { defaultActions } from '@joshua1/rivetkit-better-auth'

export const authActor = defineActor({
  name: 'auth',
  actions: defaultActions(),
  // ... other actor configuration
})
```

### Initialize Better Auth with RivetKit Adapter

```typescript
import { betterAuth } from "better-auth"
import { rivetKitAdapter } from "@joshua1/rivetkit-better-auth"
import { authActor } from "./auth-actor"

export const auth = betterAuth({
  database: rivetKitAdapter({
    authActor: authActor,
    debugLogs: true // optional, for debugging
  }),
  // ... other Better Auth options
})
```

## Configuration Options

The `rivetKitAdapter` accepts the following options:

- `authActor`: **Required** - Your RivetKit actor instance that handles auth operations
- `debugLogs`: **Optional** (default: `false`) - Enable debug logging for adapter operations

## Advanced Usage

### Custom Actor Implementation

You can create a custom actor with your own data handling logic:

```typescript
import { defineActor } from '@rivetkit/actor'
import { AdapterFindParams, AdapterFindManyParams } from '@joshua1/rivetkit-better-auth'

export const customAuthActor = defineActor({
  name: 'customAuth',
  actions: {
    async findOne(c: any, params: AdapterFindParams) {
      // Your custom findOne implementation
      // Use params.where (WherePredicate) to filter data
    },

    async findMany(c: any, params: AdapterFindManyParams) {
      // Your custom findMany implementation
      // Supports where, sortBy, limit, offset
    },

    // ... other required actions
  }
})
```

### LINQ-Style Querying

The adapter uses LINQ-extensions for powerful querying capabilities:

```typescript
import { createLinqPredicate } from '@joshua1/rivetkit-better-auth'
import type { CleanedWhere } from 'better-auth/adapters'

// Create complex where conditions
const conditions: CleanedWhere[] = [
  { field: 'isActive', operator: 'eq', value: true, connector: 'AND' },
  { field: 'age', operator: 'gte', value: 18, connector: 'AND' },
  { field: 'email', operator: 'contains', value: '@company.com', connector: 'AND' }
]

const predicate = createLinqPredicate(conditions)
const results = data.where(predicate).toArray()
```

### Supported Operators

- `eq` - Equality
- `ne` - Not equal
- `lt` - Less than
- `lte` - Less than or equal
- `gt` - Greater than
- `gte` - Greater than or equal
- `in` - Value in array
- `contains` - String contains
- `starts_with` - String starts with
- `ends_with` - String ends with

## Examples

See the [examples directory](./examples/) for comprehensive usage examples:

- [LINQ Transform Usage](./examples/linq-transform-usage.ts)
- [Adapter Integration](./examples/adapter-integration-example.ts)
- [Enhanced Types Usage](./examples/enhanced-types-usage.ts)
- [Transform Tests](./examples/test-transforms.ts)

## API Reference

For detailed API documentation, see [LINQ Transform README](./examples/LINQ_TRANSFORM_README.md).

## Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## License

MIT License - see LICENSE file for details.
