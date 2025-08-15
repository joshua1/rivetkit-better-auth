import type { Client, Registry } from "@rivetkit/actor"
import {
	type AdapterDebugLogs,
	type CustomAdapter,
	createAdapter,
} from "better-auth/adapters"
import { createLinqPredicate } from "./transform-where"

type ActorServerClient = Client<Registry<any>>

// RivetKit adapter config options
interface RivetKitAdapterConfig {
	/**
	 * Helps you debug issues with the adapter.
	 */
	debugLogs?: AdapterDebugLogs
	/**
	 * If the table names in the schema are plural.
	 */

	modelNames?: string[]
}

export const rivetKitAdapter = (
	actorClient: ActorServerClient,
	config: RivetKitAdapterConfig = {},
) =>
	createAdapter({
		config: {
			adapterId: "rivetkit-adapter",
			adapterName: "RivetKit Adapter",
			usePlural: true, // Default to plural since our state uses plural names
			debugLogs: config.debugLogs ?? false,
			supportsJSON: true,
			supportsDates: true,
			supportsBooleans: true,
			supportsNumericIds: false, // We use UUIDs
		},
		adapter: ({ debugLog }) => {
			const authActor = actorClient.authActor.getOrCreate(["auth"])

			return {
				options: config,

				create: async <T extends Record<string, any>>({
					data,
					model,
					select,
				}: Parameters<CustomAdapter["create"]>[0]) => {
					debugLog("create", `[RivetKit Adapter] Creating ${model}:`, data)

					try {
						const result = await authActor.create({
							model,
							data,
							select,
						})

						debugLog("create", `[RivetKit Adapter] Created ${model}:`, result)
						return result as T
					} catch (error) {
						console.error(`[RivetKit Adapter] Error creating ${model}:`, error)
						throw error
					}
				},

				findOne: async <T>({
					model,
					where,
					select,
				}: Parameters<CustomAdapter["findOne"]>[0]) => {
					debugLog(
						"findOne",
						`[RivetKit Adapter] Finding one ${model}:`,
						where,
					)
					console.log("findOne", { model, where, select })
					try {
						const result = await authActor.findOne({
							model,
							where,
							select,
						})

						console.log(
							"findOne",
							`[RivetKit Adapter] Found ${model}:`,
							result,
						)
						return result as T | null
					} catch (error) {
						console.error(`[RivetKit Adapter] Error finding ${model}:`, error)
						throw error
					}
				},

				findMany: async <T>({
					model,
					where,
					limit,
					sortBy,
					offset,
				}: Parameters<CustomAdapter["findMany"]>[0]) => {
					debugLog("findMany", `[RivetKit Adapter] Finding many ${model}:`, {
						where,
						limit,
						sortBy,
						offset,
					})

					try {
						const result: any[] = (await authActor.findMany({
							model,
							where,
							limit,
							sortBy,
							offset,
						})) as any[]

						debugLog(
							"findMany",
							`[RivetKit Adapter] Found ${model} records:`,
							result?.length,
						)
						return result as T[]
					} catch (error) {
						console.error(
							`[RivetKit Adapter] Error finding many ${model}:`,
							error,
						)
						throw error
					}
				},

				update: async <T>({
					model,
					where,
					update,
				}: Parameters<CustomAdapter["update"]>[0]) => {
					debugLog("update", `[RivetKit Adapter] Updating ${model}:`, {
						where,
						update,
					})

					try {
						const result = await authActor.update({
							model,
							where,
							update,
						})

						debugLog("update", `[RivetKit Adapter] Updated ${model}:`, result)
						return result as T | null
					} catch (error) {
						console.error(`[RivetKit Adapter] Error updating ${model}:`, error)
						throw error
					}
				},

				updateMany: async ({
					model,
					where,
					update,
				}: Parameters<CustomAdapter["updateMany"]>[0]) => {
					debugLog("updateMany", `[RivetKit Adapter] Updating many ${model}:`, {
						where,
						update,
					})

					try {
						const result = await authActor.updateMany({
							model,
							where,
							update,
						})

						debugLog(
							"updateMany",
							`[RivetKit Adapter] Updated ${model} records:`,
							result,
						)
						return result as number
					} catch (error) {
						console.error(
							`[RivetKit Adapter] Error updating many ${model}:`,
							error,
						)
						throw error
					}
				},

				delete: async ({
					model,
					where,
				}: Parameters<CustomAdapter["delete"]>[0]) => {
					debugLog("delete", `[RivetKit Adapter] Deleting ${model}:`, where)

					try {
						await authActor.delete({
							model,
							where,
						})

						debugLog("delete", `[RivetKit Adapter] Deleted ${model}`)
					} catch (error) {
						console.error(`[RivetKit Adapter] Error deleting ${model}:`, error)
						throw error
					}
				},

				deleteMany: async ({
					model,
					where,
				}: Parameters<CustomAdapter["deleteMany"]>[0]) => {
					debugLog(
						"deleteMany",
						`[RivetKit Adapter] Deleting many ${model}:`,
						where,
					)

					try {
						const result = await authActor.deleteMany({
							model,
							where,
						})

						debugLog(
							"deleteMany",
							`[RivetKit Adapter] Deleted ${model} records:`,
							result,
						)
						return result as number
					} catch (error) {
						console.error(
							`[RivetKit Adapter] Error deleting many ${model}:`,
							error,
						)
						throw error
					}
				},

				count: async ({
					model,
					where,
				}: Parameters<CustomAdapter["count"]>[0]) => {
					debugLog("count", `[RivetKit Adapter] Counting ${model}:`, where)

					try {
						const result = await authActor.count({
							model,
							where,
						})

						debugLog("count", `[RivetKit Adapter] Count for ${model}:`, result)
						return result as number
					} catch (error) {
						console.error(`[RivetKit Adapter] Error counting ${model}:`, error)
						throw error
					}
				},
			}
		},
	})
