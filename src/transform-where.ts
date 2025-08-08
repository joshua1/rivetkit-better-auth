import type { CleanedWhere } from "better-auth/adapters"
import { RivetKitBetterAuthError } from "./utils"
import 'linq-extensions'

/**
 * Creates a predicate function compatible with linq-extensions where method
 * @param where Array of where conditions from better-auth
 * @returns A predicate function that can be used with array.where()
 */
export function createLinqPredicate(where: CleanedWhere[] = []): (item: any) => boolean {
	return transformWhereClause(where)
}

export type WherePredicate = ReturnType<typeof createLinqPredicate>


export function transformWhereClause(where: CleanedWhere[] = []) {
	if (where.length === 0) {
		return (item: any) => true // Return all items if no conditions
	}

	const predicates = where.map((w) => {
		if (w.connector === "AND") {
			return transformWhereOp(w)
		}

		if (w.connector === "OR") {
			// This situation does not show up in adapter tests. Just log it if it comes up to see
			// realistic data points
			console.warn("OR", w)
			return transformWhereOp(w)
		}

		if (w.operator) {
			// This situation does not show up in adapter tests. Just log it if it comes up to see
			// realistic data points
			console.warn("Where with op only", w)
			return transformWhereOp(w)
		}

		throw new RivetKitBetterAuthError(`Unimplemented scenario for where clause: ${JSON.stringify(w)}`)
	})

	// For AND operations (default), all predicates must be true
	// For OR operations, we would need to handle them differently
	return (item: any) => predicates.every(predicate => predicate(item))
}

function transformWhereOp({
	operator,
	value,
	field,
}: CleanedWhere): (item: any) => boolean {
	const op = operator === "starts_with" ? "startsWith" : operator === "ends_with" ? "endsWith" : operator

	return (item: any) => {
		const fieldValue = item[field]

		switch (op) {
			case "eq":
				return fieldValue === value
			case "ne":
				return fieldValue !== value
			case "lt":
				return value !== null && fieldValue < value
			case "lte":
				return value !== null && fieldValue <= value
			case "gt":
				return value !== null && fieldValue > value
			case "gte":
				return value !== null && fieldValue >= value
			case "in":
				return Array.isArray(value) ? (value as any[]).includes(fieldValue) : false
			case "contains":
				return typeof fieldValue === 'string' && typeof value === 'string'
					? fieldValue.includes(value)
					: false
			case "startsWith":
				return typeof fieldValue === 'string' && typeof value === 'string'
					? fieldValue.startsWith(value)
					: false
			case "endsWith":
				return typeof fieldValue === 'string' && typeof value === 'string'
					? fieldValue.endsWith(value)
					: false
			default:
				throw new RivetKitBetterAuthError(`Unknown operator in better-auth where clause: ${JSON.stringify({ operator, value, field })}`)
		}
	}
}
