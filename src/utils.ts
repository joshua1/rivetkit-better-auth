import type { Account, Invitation, Member, Organization, Passkey, Session, Team, User, Verification } from './types'

import { BetterAuthError } from "better-auth"

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

export const defaultActorState={
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
