import type {
	AdapterCountParams,
	AdapterCreateParams,
	AdapterDeleteParams,
	AdapterFindManyParams,
	AdapterFindParams,
	AdapterUpdateParams,
} from "./types"
import "linq-extensions"
import type { ActionContext } from "@rivetkit/core"
import { createLinqPredicate } from "./transform-where"
import { RivetKitBetterAuthError } from "./utils"

type AC = ActionContext<any, any, any, any, any, any, any>

export const defaultActions = () => {
	return {
		// Create operation
		create: async (c: AC, params: AdapterCreateParams) => {
			try {
				const tableName = c.vars.tableNames[params.model]

				// Add to actor state
				if (c.state[tableName]) {
					const recordExists = c.state[tableName]?.any(
						(k: any) => k.id === params.data.id,
					)
					if (recordExists) {
						throw new RivetKitBetterAuthError(
							`Record already exists: ${params.data.id}`,
						)
					}
					c.state[tableName].push(params.data)
					c.broadcast("items.created", { tableName, records: [params.data] })
					return params.data as Promise<typeof params.data>
				}
				throw new RivetKitBetterAuthError(
					`Table not found in state: ${tableName}`,
				)
			} catch (error) {
				c.log.error(`Auth actor create error for ${params.model}:`, error)
				throw error
			}
		},

		// Find one operation
		findOne: async <T>(c: AC, params: AdapterFindParams) => {
			try {
				const tableName = c.vars.tableNames[params.model]
				// Search in actor state
				if (c.state[tableName]) {
					return c.state[tableName]?.firstOrNull(
						createLinqPredicate(params.where),
					) as Promise<T | null>
				}
				throw new RivetKitBetterAuthError(
					`Table not found in state: ${tableName}`,
				)
			} catch (error) {
				c.log.error(`Auth actor findOne error for ${params.model}:`, error)
				throw error
			}
		},

		// Find many operation
		findMany: async <T>(c: AC, params: AdapterFindManyParams): Promise<T[]> => {
			try {
				const tableName = c.vars.tableNames[params.model]

				// Search in actor state
				if (c.state[tableName]) {
					const records = c.state[tableName] as T[]
					let query: any = records

					// Apply where conditions if specified
					if (params.where && params.where.length > 0) {
						query = query.where(createLinqPredicate(params.where))
					}

					// Apply sorting if specified
					if (params.sortBy && params.sortBy.length > 0) {
						const sortField = params.sortBy[0].field
						const sortDirection = params.sortBy[0].direction

						if (sortDirection === "desc") {
							query = query.orderByDescending((item: any) => item[sortField])
						} else {
							query = query.orderBy((item: any) => item[sortField])
						}
					}

					// Apply offset and limit
					if (params.offset) {
						query = query.skip(params.offset)
					}

					if (params.limit) {
						query = query.take(params.limit)
					}

					// Execute the query and return results
					return query.toArray() as Promise<T[]>
				}

				throw new RivetKitBetterAuthError(
					`Table not found in state: ${tableName}`,
				)
			} catch (error) {
				c.log.error(`Auth actor findMany error for ${params.model}:`, error)
				throw error
			}
		},

		// Update operation
		update: async <T>(c: AC, params: AdapterUpdateParams) => {
			try {
				const tableName = c.vars.tableNames[params.model]

				// Find and update in actor state
				if (c.state[tableName]) {
					const records = c.state[tableName] as any[]
					const recordIndex = records.findIndex(createLinqPredicate(params.where))

					if (recordIndex === -1) {
						throw new Error("Record not found for update")
					}

					// Update the record
					const updatedRecord = { ...records[recordIndex], ...params.update }
					records[recordIndex] = updatedRecord
					c.broadcast("items.updated", { tableName, records })

					return updatedRecord as Promise<T>
				}

				throw new Error("Table not found in state")
			} catch (error) {
				c.log.error(`Auth actor update error for ${params.model}:`, error)
				throw error
			}
		},

		// Update many operation
		updateMany: async (c: AC, params: AdapterUpdateParams) => {
			try {
				const tableName = c.vars.tableNames[params.model]

				// Find and update multiple records in actor state
				if (c.state[tableName]) {
					const records = c.state[tableName]
						?.where(createLinqPredicate(params.where))
						.map((item: any) => ({ ...item, ...params.update }))
						.toArray()
					c.broadcast("items.updated", { tableName, records })
					return records.length as Promise<number>
				}

				throw new RivetKitBetterAuthError(
					`Table not found in state: ${tableName}`,
				)
			} catch (error) {
				c.log.error(`Auth actor updateMany error for ${params.model}:`, error)
				throw error
			}
		},

		// Delete operation
		delete: async (c: AC, params: AdapterDeleteParams) => {
			try {
				const tableName = c.vars.tableNames[params.model]

				// Find and delete from actor state
				if (c.state[tableName]) {
					const predicate = createLinqPredicate(params.where)
					const records = c.state[tableName]?.where((item: any) => !predicate(item)).toArray()
					c.state[tableName] = records
					c.broadcast("items.deleted", { tableName, records })
					return
				}
				throw new RivetKitBetterAuthError(
					`Table not found in state: ${tableName}`,
				)
			} catch (error) {
				c.log.error(`Auth actor delete error for ${params.model}:`, error)
				throw error
			}
		},

		// Delete many operation
		deleteMany: async (c: AC, params: AdapterDeleteParams) => {
			try {
				const tableName = c.vars.tableNames[params.model]

				// Find and delete multiple records from actor state
				if (c.state[tableName]) {
					const predicate = createLinqPredicate(params.where)
					const records = c.state[tableName]?.where((item: any) => !predicate(item)).toArray()
					c.state[tableName] = records
					c.broadcast("items.deleted", { tableName, records })
					return
				}
				throw new RivetKitBetterAuthError(
					`Table not found in state: ${tableName}`,
				)
			} catch (error) {
				c.log.error(`Auth actor deleteMany error for ${params.model}:`, error)
				throw error
			}
		},

		// Count operation
		count: async (c: AC, params: AdapterCountParams): Promise<number> => {
			try {
				const tableName = c.vars.tableNames[params.model]

				// Count records in actor state
				if (c.state[tableName]) {
					const records = c.state[tableName]?.where(createLinqPredicate(params.where)).toArray()
					return records.length as Promise<number>
				}
				throw new RivetKitBetterAuthError(
					`Table not found in state: ${tableName}`,
				)
			} catch (error) {
				c.log.error(`Auth actor count error for ${params.model}:`, error)
				throw error
			}
		},
	}
}
