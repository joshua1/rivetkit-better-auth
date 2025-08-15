import type { CleanedWhere } from "better-auth/adapters"
import type { WherePredicate } from "./transform-where"

// Core Better Auth entity types
export interface User {
	id: string
	name: string
	email: string
	emailVerified: boolean
	image?: string
	createdAt: Date
	updatedAt: Date
}

export interface Session {
	id: string
	userId: string
	token: string
	expiresAt: Date
	ipAddress?: string
	userAgent?: string
	createdAt: Date
	updatedAt: Date
}

export interface Account {
	id: string
	userId: string
	accountId: string
	providerId: string
	accessToken?: string
	refreshToken?: string
	idToken?: string
	accessTokenExpiresAt?: Date
	refreshTokenExpiresAt?: Date
	scope?: string
	password?: string
	createdAt: Date
	updatedAt: Date
}

export interface Verification {
	id: string
	identifier: string
	value: string
	expiresAt: Date
	createdAt: Date
	updatedAt: Date
}

// Extended types with relationships
export interface UserWithRelations extends User {
	sessions?: Session[]
	accounts?: Account[]
}

export interface SessionWithUser extends Session {
	user: User
}

export interface AccountWithUser extends Account {
	user: User
}

// Admin Plugin Types
export interface AdminUser extends User {
	role?: "admin" | "user"
	banned?: boolean
	banReason?: string
	banExpires?: Date
	impersonatedBy?: string
}

export interface AdminSession extends Session {
	impersonatedBy?: string
	adminId?: string
}

// Organization Plugin Types
export interface Organization {
	id: string
	name: string
	slug: string
	logo?: string
	metadata?: Record<string, any>
	createdAt: Date
	updatedAt: Date
}

export interface Member {
	id: string
	organizationId: string
	userId: string
	email: string
	role: string
	createdAt: Date
	updatedAt: Date
}

export interface Invitation {
	id: string
	organizationId: string
	email: string
	role: string
	status: "pending" | "accepted" | "rejected" | "canceled"
	inviterId: string
	expiresAt: Date
	createdAt: Date
	updatedAt: Date
}

export interface OrganizationUser extends User {
	activeOrganizationId?: string
}

// Teams Plugin Types (extends Organization plugin)
export interface Team {
	id: string
	name: string
	slug: string
	description?: string
	organizationId: string
	metadata?: Record<string, any>
	createdAt: Date
	updatedAt: Date
}

export interface TeamMember {
	id: string
	teamId: string
	userId: string
	role: string
	createdAt: Date
	updatedAt: Date
}

export interface TeamInvitation {
	id: string
	teamId: string
	organizationId: string
	email: string
	role: string
	status: "pending" | "accepted" | "rejected" | "canceled"
	inviterId: string
	expiresAt: Date
	createdAt: Date
	updatedAt: Date
}

// Email OTP Plugin Types
export interface EmailOTP {
	id: string
	email: string
	code: string
	expiresAt: Date
	createdAt: Date
}

export interface OTPUser extends User {
	emailOTPEnabled?: boolean
}

// Two Factor Authentication Plugin Types
export interface TwoFactorUser extends User {
	twoFactorEnabled?: boolean
	twoFactorSecret?: string
	twoFactorBackupCodes?: string
}

// Magic Link plugin types
export interface MagicLink {
	id: string
	email: string
	token: string
	expiresAt: Date
	createdAt: Date
}

// Anonymous plugin types
export interface AnonymousUser {
	id: string
	linkId: string
	createdAt: Date
	updatedAt: Date
}

// Rate limiting types
export interface RateLimit {
	key: string
	count: number
	expiresAt: Date
}

// Passkey/WebAuthn types
export interface Passkey {
	id: string
	userId: string
	name: string
	publicKey: string
	credentialId: string
	counter: number
	deviceType: string
	backedUp: boolean
	transports?: string[]
	createdAt: Date
	updatedAt: Date
}

// Username plugin types
export interface UsernameUser extends User {
	username?: string
}

// Phone number plugin types
export interface PhoneUser extends User {
	phoneNumber?: string
	phoneNumberVerified?: boolean
}

// Plugin relationships and extended types
export interface OrganizationWithMembers extends Organization {
	members?: Member[]
	invitations?: Invitation[]
	teams?: Team[]
}

export interface TeamWithMembers extends Team {
	members?: TeamMember[]
	invitations?: TeamInvitation[]
	organization?: Organization
}

export interface MemberWithUser extends Member {
	user: User
	organization: Organization
}

export interface TeamMemberWithUser extends TeamMember {
	user: User
	team: Team
}

export interface InvitationWithOrganization extends Invitation {
	organization: Organization
	inviter: User
}

export interface TeamInvitationWithTeam extends TeamInvitation {
	team: Team
	organization: Organization
	inviter: User
}

// Combined user types for multiple plugins
export interface FullUser
	extends User,
	AdminUser,
	OrganizationUser,
	TwoFactorUser,
	OTPUser,
	UsernameUser,
	PhoneUser {
	// All plugin fields combined
}

// Generic additional fields interface for extending entities
export interface AdditionalUserFields {
	[key: string]: any
}

export interface AdditionalSessionFields {
	[key: string]: any
}

// Core Auth entities with customizable additional fields
export interface CustomUser extends User, AdditionalUserFields { }
export interface CustomSession extends Session, AdditionalSessionFields { }

// Secondary storage interface
export interface SecondaryStorage {
	get: (key: string) => Promise<string | null>
	set: (key: string, value: string, ttl?: number) => Promise<void>
	delete: (key: string) => Promise<void>
}

// Database adapter types
export interface DatabaseAdapter {
	id: string
	create: (data: any) => Promise<any>
	findOne: (where: any) => Promise<any>
	findMany: (where?: any) => Promise<any[]>
	update: (where: any, update: any) => Promise<any>
	delete: (where: any) => Promise<any>
}

// Auth entities configuration
export interface AuthEntities {
	User: any
	Session: any
	Account: any
	Verification: any
	// Admin plugin
	AdminUser?: any
	AdminSession?: any
	// Organization plugin
	Organization?: any
	Member?: any
	Invitation?: any
	// Teams plugin
	Team?: any
	TeamMember?: any
	TeamInvitation?: any
	// Email OTP plugin
	EmailOTP?: any
	// Other plugins
	TwoFactor?: any
	MagicLink?: any
	Passkey?: any
	AnonymousUser?: any
}

// Field attributes for schema extension
export interface FieldAttributes {
	type: "string" | "number" | "boolean" | "date" | "object" | "json"
	required?: boolean
	defaultValue?: any
	input?: boolean
	unique?: boolean
	references?: string
}

// Schema customization types
export interface UserSchema {
	modelName?: string
	fields?: Partial<Record<keyof User, string>>
	additionalFields?: Record<string, FieldAttributes>
}

export interface SessionSchema {
	modelName?: string
	fields?: Partial<Record<keyof Session, string>>
	additionalFields?: Record<string, FieldAttributes>
}

export interface AccountSchema {
	modelName?: string
	fields?: Partial<Record<keyof Account, string>>
}

export interface VerificationSchema {
	modelName?: string
	fields?: Partial<Record<keyof Verification, string>>
}

export interface OrganizationSchema {
	modelName?: string
	fields?: Partial<Record<keyof Organization, string>>
	additionalFields?: Record<string, FieldAttributes>
}

export interface MemberSchema {
	modelName?: string
	fields?: Partial<Record<keyof Member, string>>
	additionalFields?: Record<string, FieldAttributes>
}

export interface TeamSchema {
	modelName?: string
	fields?: Partial<Record<keyof Team, string>>
	additionalFields?: Record<string, FieldAttributes>
}

export interface EmailOTPSchema {
	modelName?: string
	fields?: Partial<Record<keyof EmailOTP, string>>
}

// Database hooks types
export interface DatabaseHookContext {
	context: {
		session?: Session
		user?: User
		organization?: Organization
		team?: Team
		request?: Request
	}
}

export interface DatabaseHook<T> {
	before?: (
		data: T,
		ctx: DatabaseHookContext,
	) => Promise<{ data: T } | false | void>
	after?: (data: T, ctx: DatabaseHookContext) => Promise<void>
}

export interface DatabaseHooks {
	user?: {
		create?: DatabaseHook<User>
		update?: DatabaseHook<Partial<User>>
	}
	session?: {
		create?: DatabaseHook<Session>
		update?: DatabaseHook<Partial<Session>>
	}
	account?: {
		create?: DatabaseHook<Account>
		update?: DatabaseHook<Partial<Account>>
	}
	organization?: {
		create?: DatabaseHook<Organization>
		update?: DatabaseHook<Partial<Organization>>
	}
	member?: {
		create?: DatabaseHook<Member>
		update?: DatabaseHook<Partial<Member>>
	}
	team?: {
		create?: DatabaseHook<Team>
		update?: DatabaseHook<Partial<Team>>
	}
	teamMember?: {
		create?: DatabaseHook<TeamMember>
		update?: DatabaseHook<Partial<TeamMember>>
	}
}

// Better Auth configuration types
export interface BetterAuthConfig {
	database?: any
	secondaryStorage?: SecondaryStorage
	user?: UserSchema
	session?: SessionSchema
	account?: AccountSchema
	verification?: VerificationSchema
	organization?: OrganizationSchema
	member?: MemberSchema
	team?: TeamSchema
	emailOTP?: EmailOTPSchema
	databaseHooks?: DatabaseHooks
	plugins?: any[]
	advanced?: {
		database?: {
			generateId?: boolean | (() => string)
		}
	}
}

// Remult adapter specific types
export interface RemultAdapterOptions {
	authEntities: AuthEntities
	dataProvider?: any
	debugLogs?: boolean
	usePlural?: boolean
}

// Plugin configuration types
export interface AdminPluginConfig {
	schema?: {
		user?: {
			fields?: Partial<Record<keyof AdminUser, string>>
		}
		session?: {
			fields?: Partial<Record<keyof AdminSession, string>>
		}
	}
}

export interface OrganizationPluginConfig {
	schema?: {
		organization?: {
			modelName?: string
			fields?: Partial<Record<keyof Organization, string>>
		}
		member?: {
			modelName?: string
			fields?: Partial<Record<keyof Member, string>>
		}
		invitation?: {
			modelName?: string
			fields?: Partial<Record<keyof Invitation, string>>
		}
	}
	allowUserToCreateOrganization?: boolean
	organizationLimit?: number
	memberLimit?: number
}

export interface TeamsPluginConfig {
	schema?: {
		team?: {
			modelName?: string
			fields?: Partial<Record<keyof Team, string>>
		}
		teamMember?: {
			modelName?: string
			fields?: Partial<Record<keyof TeamMember, string>>
		}
		teamInvitation?: {
			modelName?: string
			fields?: Partial<Record<keyof TeamInvitation, string>>
		}
	}
	teamLimit?: number
	memberLimit?: number
}

export interface EmailOTPPluginConfig {
	schema?: {
		emailOTP?: {
			modelName?: string
			fields?: Partial<Record<keyof EmailOTP, string>>
		}
	}
	otpLength?: number
	expiresIn?: number
	sendOTP?: (email: string, otp: string) => Promise<void>
}

// Export all entity types as union for convenience
export type AuthEntity = User | Session | Account | Verification
export type AuthEntityWithRelations =
	| UserWithRelations
	| SessionWithUser
	| AccountWithUser

// Plugin entity types union
export type PluginEntity =
	| AdminUser
	| AdminSession
	| Organization
	| Member
	| Invitation
	| Team
	| TeamMember
	| TeamInvitation
	| EmailOTP
	| TwoFactorUser
	| MagicLink
	| AnonymousUser
	| RateLimit
	| Passkey
	| UsernameUser
	| PhoneUser
	| OTPUser

// Plugin entity with relations types
export type PluginEntityWithRelations =
	| OrganizationWithMembers
	| TeamWithMembers
	| MemberWithUser
	| TeamMemberWithUser
	| InvitationWithOrganization
	| TeamInvitationWithTeam

// All possible entity types
export type AllAuthEntities = AuthEntity | PluginEntity
export type AllAuthEntitiesWithRelations =
	| AuthEntityWithRelations
	| PluginEntityWithRelations

// Role and permission types
export type OrganizationRole = "owner" | "admin" | "member"
export type TeamRole = "admin" | "member"
export type AdminRole = "admin" | "user"

// Status types
export type InvitationStatus = "pending" | "accepted" | "rejected" | "canceled"
export type TeamInvitationStatus =
	| "pending"
	| "accepted"
	| "rejected"
	| "canceled"

// Enhanced where clause types
export type WhereOperator =
	| "eq"
	| "ne"
	| "lt"
	| "lte"
	| "gt"
	| "gte"
	| "in"
	| "contains"
	| "starts_with"
	| "startsWith"
	| "ends_with"
	| "endsWith"

export type WhereConnector = "AND" | "OR"

export interface AdvancedWhereCondition {
	field: string
	operator: WhereOperator
	value: any
	connector: WhereConnector
}

// Sort direction type
export type SortDirection = "asc" | "desc"

export interface SortByCondition {
	field: string
	direction: SortDirection
}

// Enhanced adapter parameter types
export interface AdapterCreateParams {
	model: string
	data: any
}

export interface AdapterFindParams {
	model: string
	where: CleanedWhere[]
}

export interface AdapterFindManyParams {
	model: string
	where?: CleanedWhere[]
	limit?: number
	sortBy?: SortByCondition[]
	offset?: number
}

export interface AdapterUpdateParams {
	model: string
	where: CleanedWhere[]
	update: any
}

export interface AdapterDeleteParams {
	model: string
	where: CleanedWhere[]
}

export interface AdapterCountParams {
	model: string
	where?: CleanedWhere[]
}
