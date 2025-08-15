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
const mw = createMiddleware(async (c, next) => {
	c.set("actorClient", actorServerClient) //To use in other hono routes where needed
	await next()
})
app.use(mw)
console.log(
	"truested origins are ",
	process.env.BETTER_AUTH_TRUSTED_ORIGINS?.toString()
		?.split(",")
		?.map((origin) => origin.trim()),
)
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

// Routes
app.on(["GET", "POST"], "/auth/**", (c) => auth.handler(c.req.raw))

serve(app)
