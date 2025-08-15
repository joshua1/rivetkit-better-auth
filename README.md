# @joshua1/rivetkit-better-auth

A RivetKit adapter for Better Auth that provides seamless authentication integration with RivetKit actors using in-memory state management.

## Installation

```bash
npm install @joshua1/rivetkit-better-auth better-auth
# or
pnpm add @joshua1/rivetkit-better-auth better-auth
```

## Quick Start Guide

Follow these steps to integrate Better Auth with RivetKit actors in your project.

### Step 1: Define the Auth Actor

Create your authentication actor using the provided defaults. From `examples/better-auth/src/backend/registry.ts`:

```typescript
import {
	defaultActions,
	defaultActorState,
	tableNames,
} from "@joshua1/rivetkit-better-auth"
import { actor, type OnAuthOptions, setup } from "@rivetkit/actor"
import { checkConnState } from './middleware'

export const authActor = actor({
	state: { ...defaultActorState },
	vars: { tableNames },
	actions: {
		...defaultActions(),
	},
})
```

### Step 2: Set Up Authentication

Create your Better Auth configuration with the RivetKit adapter. Here's the actual implementation from `examples/better-auth/src/backend/auth.ts`:

```typescript
import { rivetKitAdapter } from "@joshua1/rivetkit-better-auth"
import { betterAuth } from "better-auth"
import type { ActorServerClient } from "."

// Environment variables
const AUTH_SECRET = process.env.AUTH_SECRET ?? "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const BETTER_AUTH_TRUSTED_ORIGINS =
	process.env.BETTER_AUTH_TRUSTED_ORIGINS ??
	"http://localhost:5173,http://localhost:6420"

// Function to create auth instance with actor server client
export const createAuth = (actorServerClient: ActorServerClient) =>
	betterAuth({
		database: rivetKitAdapter(actorServerClient as any, {
			// usePlural: true, already defaults to true
			debugLogs:
				process.env.NODE_ENV === "development"
					? {
						create: true,
						update: true,
						delete: true,
						findOne: true,
						findMany: true,
						count: true,
					}
					: false
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


### Step 3: Set Up Server with Better Auth Routes

Instantiate everything in your main server file. From `examples/better-auth/src/backend/index.ts`:

```typescript
import "@dotenvx/dotenvx/config"
import { ALLOWED_PUBLIC_HEADERS } from "@rivetkit/actor"
import { Hono } from "hono"
import { cors } from "hono/cors"
import { createMiddleware } from "hono/factory"
import { logger } from "hono/logger"
import { createAuth } from "./auth"
import { registry } from "./registry"

export * from "./registry"

const isProd = process.env.NODE_ENV === "production"

const { serve, client: actorServerClient } = registry.createServer({
	cors: {
		origin: isProd ? "https://some-prod-address.ai" : "*",
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

// Create the main app with Variables type for our routes
const app = new Hono().basePath("/api")

// Middleware
app.use("*", logger())

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
		message: "This Backend service",
		status: "healthy",
		timestamp: new Date().toISOString(),
	})
})

// Routes - Better Auth handles all /auth/** endpoints
app.on(["GET", "POST"], "/auth/**", (c) => auth.handler(c.req.raw))

serve(app)
```


### Step 4: Create Authentication Hook

Create middleware to protect your actors. From `examples/better-auth/src/backend/middleware.ts`:

```typescript
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


//in other actors you can use this in onAuth Call

export const chatRoom = actor({
	// onAuth runs on the server & before connecting to the actor
	onAuth: async (opts: OnAuthOptions) => {
		return await checkConnState(opts)
	},
	state: {
		messages: [],
	} as State,
	actions: {
		sendMessage: (c, message: string) => {
			// Access Better Auth with c.conn.auth
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
		getMessages: (c) => {
			return c.state.messages
		},
	},
})

```

### Step 5: Add AuthActor to Registry

Complete your registry setup by adding the authActor. From `examples/better-auth/src/backend/registry.ts`:

```typescript
// Example of additional protected actor using authentication
interface State {
	messages: Message[]
}

interface Message {
	id: string
	userId: string
	username: string
	message: string
	timestamp: number
}

export const chatRoom = actor({
	// onAuth runs on the server & before connecting to the actor
	onAuth: async (opts: OnAuthOptions) => {
		return await checkConnState(opts)
	},
	state: {
		messages: [],
	} as State,
	actions: {
		sendMessage: (c, message: string) => {
			// Access Better Auth with c.conn.auth
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
		getMessages: (c) => {
			return c.state.messages
		},
	},
})

// Registry with both authActor and protected chatRoom
export const registry = setup({
	use: { authActor, chatRoom },
})
```

## API Reference

### Default Exports

The `@joshua1/rivetkit-better-auth` package provides several key exports:

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

The library is designed to be extensible via the auth actor definition. You can extend state, vars, defaultActions, and override properties as needed.

### Extending State

You can extend the default actor state with additional properties:

```typescript
import { defaultActorState } from '@joshua1/rivetkit-better-auth'

interface UserPreference {
	id: string
	userId: string
	theme: string
	language: string
}

interface AuditLog {
	id: string
	userId: string
	action: string
	timestamp: number
}

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
		saveUserPreference: async (c, params: { userId: string, preference: Omit<UserPreference, 'id' | 'userId'> }) => {
			const newPreference = {
				id: crypto.randomUUID(),
				userId: params.userId,
				...params.preference
			}
			c.state.userPreferences.push(newPreference)
			return newPreference
		},
		getUserPreferences: async (c, userId: string) => {
			return c.state.userPreferences.filter(pref => pref.userId === userId)
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

		updateUserProfile: async (c, params: { userId: string, updates: Partial<User> }) => {
			const userIndex = c.state.users.findIndex(u => u.id === params.userId)
			if (userIndex !== -1) {
				c.state.users[userIndex] = { ...c.state.users[userIndex], ...params.updates }
				return c.state.users[userIndex]
			}
			throw new Error('User not found')
		},

		getActiveUserSessions: async (c, userId: string) => {
			return c.state.sessions.filter(session =>
				session.userId === userId &&
				new Date(session.expiresAt) > new Date()
			)
		}
	},
})
```

### Overriding Properties

You can override any default properties:

```typescript
// Custom table names
const customTableNames = {
	...tableNames,
	users: 'app_users', // Override table name
	sessions: 'user_sessions'
}

// Custom state with different types
interface CustomUser extends User {
	companyId?: string
	role: 'admin' | 'user' | 'moderator'
}

const customState = {
	...defaultActorState,
	users: [] as CustomUser[], // Override with custom user type
}

export const authActor = actor({
	state: customState,
	vars: {
		tableNames: customTableNames
	},
	actions: {
		...defaultActions(),
		// Override specific actions
		create: async (c, params) => {
			// Custom create logic with logging
			console.log('Creating:', params.model, params.data)

			// Add custom validation
			if (params.model === 'users' && !params.data.role) {
				params.data.role = 'user' // Set default role
			}

			// Call original create action
			return defaultActions().create(c, params)
		}
	},
})
```

### Extending Vars

Add custom variables alongside tableNames:

```typescript
export const authActor = actor({
	state: { ...defaultActorState },
	vars: {
		tableNames,
		// Add custom vars
		maxLoginAttempts: 5,
		sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
		allowedRoles: ['admin', 'user', 'moderator'] as const
	},
	actions: {
		...defaultActions(),

		validateLoginAttempts: async (c, email: string) => {
			// Use custom vars in actions
			const attempts = c.state.auditLogs?.filter(log =>
				log.action === 'failed_login' &&
				log.metadata?.email === email &&
				Date.now() - log.timestamp < 60 * 60 * 1000 // Last hour
			).length || 0

			return attempts < c.vars.maxLoginAttempts
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

## Example Project

For a complete working example, see the `examples/better-auth` directory in this repository, which demonstrates:

- Full Better Auth setup with RivetKit adapter
- Protected actors with authentication middleware
- Real-time chat functionality
- Frontend integration with React
- Environment configuration

## License

MIT License - see LICENSE file for details.
```
