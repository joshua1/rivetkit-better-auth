import { BetterAuthError } from "better-auth"
import type {
	Account,
	Invitation,
	Member,
	Organization,
	Passkey,
	Session,
	Team,
	User,
	Verification,
} from "./types"

export class RivetKitBetterAuthError extends BetterAuthError {
	constructor(message: string, cause?: string) {
		super(message, cause)
		this.name = "RemultBetterAuthError"
	}
}

export function trimLines(str: string, indentYN = false) {
	const indent = indentYN ? "  " : ""
	return str
		.trim()
		.split("\n")
		.map((line) => (line.trim() ? indent + line.trim() : line.trim()))
		.join("\n")
}

export const tableNames = {
	users: "users",
	sessions: "sessions",
	accounts: "accounts",
	verifications: "verifications",
	passkeys: "passkeys",
	organizations: "organizations",
	members: "members",
	invitations: "invitations",
	teams: "teams",
	jwks: "jwks",
} as const

export type TableNames =
	| "users"
	| "sessions"
	| "accounts"
	| "verifications"
	| "passkeys"
	| "organizations"
	| "members"
	| "invitations"
	| "teams"
	| "jwks"

export const defaultActorState = {
	users: [] as (User & any)[] | User[],
	sessions: [] as (Session & any)[] | Session[],
	accounts: [] as (Account & any)[] | Account[],
	verifications: [] as (Verification & any)[] | Verification[],
	passkeys: [] as (Passkey & any)[] | Passkey[],
	organizations: [] as (Organization & any)[] | Organization[],
	members: [] as (Member & any)[] | Member[],
	invitations: [] as (Invitation & any)[] | Invitation[],
	teams: [] as (Team & any)[] | Team[],
}

export type AuthActorState = typeof defaultActorState