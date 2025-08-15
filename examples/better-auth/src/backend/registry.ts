import {
	defaultActions,
	defaultActorState,
	tableNames,
} from "@joshua1/rivetkit-better-auth"
import { actor, type OnAuthOptions, setup } from "@rivetkit/actor"
import { checkConnState } from './middleware'


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

export const authActor = actor({
	state: { ...defaultActorState },
	vars: { tableNames },
	actions: {
		...defaultActions(),
	},
})

export const registry = setup({
	use: { authActor, chatRoom },
})
