# @joshua1/rivetkit-better-auth

A RivetKit adapter for Better Auth that provides seamless authentication integration with RivetKit actors using in-memory state management.

## Installation

```bash
npm install @joshua1/rivetkit-better-auth better-auth
# or
pnpm add @joshua1/rivetkit-better-auth better-auth
```

## Quick Start

### 1. Set Up Authentication

First, create your Better Auth configuration with the RivetKit adapter:

```typescript
// auth.ts
import { rivetKitAdapter } from "@joshua1/rivetkit-better-auth"
import { betterAuth } from "better-auth"
import type { ActorServerClient } from "./index"

// Environment variables
const AUTH_SECRET = process.env.AUTH_SECRET ?? "your-secret-key"
const BETTER_AUTH_TRUSTED_ORIGINS = 
  process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? 
  "http://localhost:5173,http://localhost:6420"

export const createAuth = (actorServerClient: ActorServerClient) =>
  betterAuth({
    database: rivetKitAdapter(actorServerClient, {
      debugLogs: process.env.NODE_ENV === "development" ? {
        create: true,
        update: true,
        delete: true,
        findOne: true,
        findMany: true,
        count: true,
      } : false
    }),
    
    secret: AUTH_SECRET,
    
    trustedOrigins: BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map((origin) =>
      origin.trim(),
    ),
    
    emailAndPassword: {
      enabled: true,
      requireEmailVerification: false,
      autoSignIn: true,
    },
  })
```

### 2. Create the Auth Actor

Define your authentication actor using the provided defaults:

```typescript
// registry.ts
import {
  defaultActions,
  defaultActorState,
  tableNames,
} from "@joshua1/rivetkit-better-auth"
import { actor, setup } from "@rivetkit/actor"

export const authActor = actor({
  state: { ...defaultActorState },
  vars: { tableNames },
  actions: {
    ...defaultActions(),
  },
})

export const registry = setup({
  use: { authActor },
})
```

### 3. Set Up Server with Better Auth Routes

Create your main server file that integrates everything:

```typescript
// index.ts
import "@dotenvx/dotenvx/config"
import { ALLOWED_PUBLIC_HEADERS } from "@rivetkit/actor"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { createMiddleware } from "hono/factory"
import { logger } from "hono/logger"
import { createAuth } from "./auth"
import { registry } from "./registry"

const isProd = process.env.NODE_ENV === "production"

// Create server and client
const { serve, client: actorServerClient } = registry.createServer({
  cors: {
    origin: isProd ? "https://your-prod-domain.com" : "*",
  },
})

export type ActorServerClient = typeof actorServerClient

// Create auth instance with the actor server client
const auth = createAuth(actorServerClient)

export type BetterAuthType = {
  user: typeof auth.$Infer.Session.user | null
  session: typeof auth.$Infer.Session.session | null
}

export type AuthUserType = typeof auth.$Infer.Session.user
export type AuthSessionType = typeof auth.$Infer.Session.session
export { auth }

// Create the main app
const app = new Hono().basePath("/api")

// Middleware
app.use("*", logger())

const mw = createMiddleware(async (c, next) => {
  c.set("actorClient", actorServerClient)
  await next()
})
app.use(mw)

app.use(
  "*",
  cors({
    origin: process.env.BETTER_AUTH_TRUSTED_ORIGINS?.toString()
      ?.split(",")
      ?.map((origin) => origin.trim()) || [
        "http://localhost:5173",
        "http://localhost:8080",
      ],
    allowHeaders: ["Content-Type", "Authorization", ...ALLOWED_PUBLIC_HEADERS],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
)

// Health check
app.get("/", (c) => {
  return c.json({
    message: "Auth service",
    status: "healthy",
    timestamp: new Date().toISOString(),
  })
})

// Better Auth routes - handles all /auth/** endpoints
app.on(["GET", "POST"], "/auth/**", (c) => auth.handler(c.req.raw))

serve(app)
```

### 4. Add Authentication Middleware

Create middleware to protect your actors:

```typescript
// middleware.ts
import type { defaultActorState } from "@joshua1/rivetkit-better-auth"
import type { OnAuthOptions } from "@rivetkit/actor"
import { Unauthorized } from "@rivetkit/actor/errors"
import { auth } from "./"

export type UserType = (typeof defaultActorState.users)[0]
export type SessionType = (typeof defaultActorState.sessions)[0]

export const checkConnState = async (
  opts: OnAuthOptions,
): Promise<{
  user: UserType
  session: SessionType
}> => {
  try {
    const { request } = opts

    // Use Better Auth to validate the session
    const authResult = await auth.api.getSession({
      headers: request.headers,
    })
    if (!authResult) throw new Unauthorized()

    return {
      user: authResult.user as UserType,
      session: authResult.session as SessionType,
    }
  } catch (error) {
    console.error(error)
    throw new Error("Invalid or expired authentication token")
  }
}
```

### 5. Create Protected Actors

Use the middleware in your actors to require authentication:

```typescript
// In your registry.ts, add protected actors
import { checkConnState } from './middleware'

export const chatRoom = actor({
  // onAuth runs on the server & before connecting to the actor
  onAuth: async (opts: OnAuthOptions) => {
    return await checkConnState(opts)
  },
  state: {
    messages: [],
  },
  actions: {
    sendMessage: (c, message: string) => {
      // Access Better Auth user with c.conn.auth
      const newMessage = {
        id: crypto.randomUUID(),
        userId: c.conn.auth.user.id,
        username: c.conn.auth.user.name,
        message,
        timestamp: Date.now(),
      }

      c.state.messages.push(newMessage)
      c.broadcast("newMessage", newMessage)

      return newMessage
    },
  },
})

// Add to registry
export const registry = setup({
  use: { authActor, chatRoom },
})
```

## API Reference

### Default Exports

The package provides several key exports:

#### `defaultActorState`
Pre-configured state object containing all Better Auth tables:

```typescript
export const defaultActorState = {
  users: [] as User[],
  sessions: [] as Session[],
  accounts: [] as Account[],
  verifications: [] as Verification[],
  passkeys: [] as Passkey[],
  organizations: [] as Organization[],
  members: [] as Member[],
  invitations: [] as Invitation[],
  teams: [] as Team[]
}
```

#### `defaultActions()`
Function that returns CRUD operations for all auth tables:

- `create(c, params)` - Create new records
- `findOne(c, params)` - Find single record
- `findMany(c, params)` - Find multiple records with filtering, sorting, pagination
- `update(c, params)` - Update single record
- `updateMany(c, params)` - Update multiple records
- `delete(c, params)` - Delete single record
- `deleteMany(c, params)` - Delete multiple records
- `count(c, params)` - Count records with filtering

#### `tableNames`
Mapping object for Better Auth table names:

```typescript
export const tableNames = {
  'users': 'users',
  'sessions': 'sessions',
  'accounts': 'accounts',
  'verifications': 'verifications',
  'passkeys': 'passkeys',
  'organizations': 'organizations',
  'members': 'members',
  'invitations': 'invitations',
  'teams': 'teams',
  'jwks': 'jwks'
} as const
```

## Extensibility

### Extending State

You can extend the default actor state with additional properties:

```typescript
import { defaultActorState } from '@joshua1/rivetkit-better-auth'

const extendedState = {
  ...defaultActorState,
  // Add custom state properties
  userPreferences: [] as UserPreference[],
  auditLogs: [] as AuditLog[]
}

export const authActor = actor({
  state: extendedState,
  vars: { tableNames },
  actions: {
    ...defaultActions(),
    // Custom actions that work with extended state
    saveUserPreference: async (c, params) => {
      c.state.userPreferences.push({
        id: crypto.randomUUID(),
        userId: params.userId,
        ...params.preference
      })
    }
  }
})
```

### Extending Actions

Add custom actions alongside the default ones:

```typescript
export const authActor = actor({
  state: { ...defaultActorState },
  vars: { tableNames },
  actions: {
    ...defaultActions(),
    
    // Custom authentication actions
    getUserProfile: async (c, userId: string) => {
      return c.state.users.find(user => user.id === userId)
    },
    
    updateUserProfile: async (c, params) => {
      const userIndex = c.state.users.findIndex(u => u.id === params.userId)
      if (userIndex !== -1) {
        c.state.users[userIndex] = { ...c.state.users[userIndex], ...params.updates }
        return c.state.users[userIndex]
      }
      throw new Error('User not found')
    }
  },
})
```

### Overriding Properties

You can override any default properties:

```typescript
export const authActor = actor({
  state: { 
    ...defaultActorState,
    users: [] // Override with custom user type
  },
  vars: { 
    tableNames: {
      ...tableNames,
      users: 'custom_users' // Override table name
    }
  },
  actions: {
    ...defaultActions(),
    // Override specific actions
    create: async (c, params) => {
      // Custom create logic
      console.log('Creating:', params.model)
      return defaultActions().create(c, params)
    }
  },
})
```

## Environment Variables

```bash
# Required
AUTH_SECRET=your-secret-key-here

# Optional
BETTER_AUTH_TRUSTED_ORIGINS=http://localhost:5173,http://localhost:6420
NODE_ENV=development
```

## License

MIT License - see LICENSE file for details.
