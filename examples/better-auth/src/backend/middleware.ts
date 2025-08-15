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
