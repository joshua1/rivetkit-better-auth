// src/rivetkit-adapter.ts
import {
  createAdapter
} from "better-auth/adapters";
var rivetKitAdapter = (actorClient, config = {}) => createAdapter({
  config: {
    adapterId: "rivetkit-adapter",
    adapterName: "RivetKit Adapter",
    usePlural: true,
    // Default to plural since our state uses plural names
    debugLogs: config.debugLogs ?? false,
    supportsJSON: true,
    supportsDates: true,
    supportsBooleans: true,
    supportsNumericIds: false
    // We use UUIDs
  },
  adapter: ({ debugLog }) => {
    const authActor = actorClient.authActor.getOrCreate(["auth"]);
    return {
      options: config,
      create: async ({
        data,
        model,
        select
      }) => {
        debugLog("create", `[RivetKit Adapter] Creating ${model}:`, data);
        try {
          const result = await authActor.create({
            model,
            data,
            select
          });
          debugLog("create", `[RivetKit Adapter] Created ${model}:`, result);
          return result;
        } catch (error) {
          console.error(`[RivetKit Adapter] Error creating ${model}:`, error);
          throw error;
        }
      },
      findOne: async ({
        model,
        where,
        select
      }) => {
        debugLog(
          "findOne",
          `[RivetKit Adapter] Finding one ${model}:`,
          where
        );
        console.log("findOne", { model, where, select });
        try {
          const result = await authActor.findOne({
            model,
            where,
            select
          });
          console.log(
            "findOne",
            `[RivetKit Adapter] Found ${model}:`,
            result
          );
          return result;
        } catch (error) {
          console.error(`[RivetKit Adapter] Error finding ${model}:`, error);
          throw error;
        }
      },
      findMany: async ({
        model,
        where,
        limit,
        sortBy,
        offset
      }) => {
        debugLog("findMany", `[RivetKit Adapter] Finding many ${model}:`, {
          where,
          limit,
          sortBy,
          offset
        });
        try {
          const result = await authActor.findMany({
            model,
            where,
            limit,
            sortBy,
            offset
          });
          debugLog(
            "findMany",
            `[RivetKit Adapter] Found ${model} records:`,
            result?.length
          );
          return result;
        } catch (error) {
          console.error(
            `[RivetKit Adapter] Error finding many ${model}:`,
            error
          );
          throw error;
        }
      },
      update: async ({
        model,
        where,
        update
      }) => {
        debugLog("update", `[RivetKit Adapter] Updating ${model}:`, {
          where,
          update
        });
        try {
          const result = await authActor.update({
            model,
            where,
            update
          });
          debugLog("update", `[RivetKit Adapter] Updated ${model}:`, result);
          return result;
        } catch (error) {
          console.error(`[RivetKit Adapter] Error updating ${model}:`, error);
          throw error;
        }
      },
      updateMany: async ({
        model,
        where,
        update
      }) => {
        debugLog("updateMany", `[RivetKit Adapter] Updating many ${model}:`, {
          where,
          update
        });
        try {
          const result = await authActor.updateMany({
            model,
            where,
            update
          });
          debugLog(
            "updateMany",
            `[RivetKit Adapter] Updated ${model} records:`,
            result
          );
          return result;
        } catch (error) {
          console.error(
            `[RivetKit Adapter] Error updating many ${model}:`,
            error
          );
          throw error;
        }
      },
      delete: async ({
        model,
        where
      }) => {
        debugLog("delete", `[RivetKit Adapter] Deleting ${model}:`, where);
        try {
          await authActor.delete({
            model,
            where
          });
          debugLog("delete", `[RivetKit Adapter] Deleted ${model}`);
        } catch (error) {
          console.error(`[RivetKit Adapter] Error deleting ${model}:`, error);
          throw error;
        }
      },
      deleteMany: async ({
        model,
        where
      }) => {
        debugLog(
          "deleteMany",
          `[RivetKit Adapter] Deleting many ${model}:`,
          where
        );
        try {
          const result = await authActor.deleteMany({
            model,
            where
          });
          debugLog(
            "deleteMany",
            `[RivetKit Adapter] Deleted ${model} records:`,
            result
          );
          return result;
        } catch (error) {
          console.error(
            `[RivetKit Adapter] Error deleting many ${model}:`,
            error
          );
          throw error;
        }
      },
      count: async ({
        model,
        where
      }) => {
        debugLog("count", `[RivetKit Adapter] Counting ${model}:`, where);
        try {
          const result = await authActor.count({
            model,
            where
          });
          debugLog("count", `[RivetKit Adapter] Count for ${model}:`, result);
          return result;
        } catch (error) {
          console.error(`[RivetKit Adapter] Error counting ${model}:`, error);
          throw error;
        }
      }
    };
  }
});

// src/default-actions.ts
import "linq-extensions";

// src/utils.ts
import { BetterAuthError } from "better-auth";
var RivetKitBetterAuthError = class extends BetterAuthError {
  constructor(message, cause) {
    super(message, cause);
    this.name = "RemultBetterAuthError";
  }
};
function trimLines(str, indentYN = false) {
  const indent = indentYN ? "  " : "";
  return str.trim().split("\n").map((line) => line.trim() ? indent + line.trim() : line.trim()).join("\n");
}
var tableNames = {
  users: "users",
  sessions: "sessions",
  accounts: "accounts",
  verifications: "verifications",
  passkeys: "passkeys",
  organizations: "organizations",
  members: "members",
  invitations: "invitations",
  teams: "teams",
  jwks: "jwks"
};
var defaultActorState = {
  users: [],
  sessions: [],
  accounts: [],
  verifications: [],
  passkeys: [],
  organizations: [],
  members: [],
  invitations: [],
  teams: []
};

// src/transform-where.ts
import "linq-extensions";
function createLinqPredicate(where = []) {
  return transformWhereClause(where);
}
function transformWhereClause(where = []) {
  if (where.length === 0) {
    return (_) => true;
  }
  const predicates = where.map((w) => {
    if (w.connector === "AND") {
      return transformWhereOp(w);
    }
    if (w.connector === "OR") {
      console.warn("OR", w);
      return transformWhereOp(w);
    }
    if (w.operator) {
      console.warn("Where with op only", w);
      return transformWhereOp(w);
    }
    throw new RivetKitBetterAuthError(`Unimplemented scenario for where clause: ${JSON.stringify(w)}`);
  });
  return (item) => predicates.every((predicate) => predicate(item));
}
function transformWhereOp({
  operator,
  value,
  field
}) {
  const op = operator === "starts_with" ? "startsWith" : operator === "ends_with" ? "endsWith" : operator;
  return (item) => {
    const fieldValue = item[field];
    switch (op) {
      case "eq":
        return fieldValue === value;
      case "ne":
        return fieldValue !== value;
      case "lt":
        return value !== null && fieldValue < value;
      case "lte":
        return value !== null && fieldValue <= value;
      case "gt":
        return value !== null && fieldValue > value;
      case "gte":
        return value !== null && fieldValue >= value;
      case "in":
        return Array.isArray(value) ? value.includes(fieldValue) : false;
      case "contains":
        return typeof fieldValue === "string" && typeof value === "string" ? fieldValue.includes(value) : false;
      case "startsWith":
        return typeof fieldValue === "string" && typeof value === "string" ? fieldValue.startsWith(value) : false;
      case "endsWith":
        return typeof fieldValue === "string" && typeof value === "string" ? fieldValue.endsWith(value) : false;
      default:
        throw new RivetKitBetterAuthError(`Unknown operator in better-auth where clause: ${JSON.stringify({ operator, value, field })}`);
    }
  };
}

// src/default-actions.ts
var defaultActions = () => {
  return {
    // Create operation
    create: async (c, params) => {
      try {
        const tableName = c.vars.tableNames[params.model];
        if (c.state[tableName]) {
          const recordExists = c.state[tableName]?.any(
            (k) => k.id === params.data.id
          );
          if (recordExists) {
            throw new RivetKitBetterAuthError(
              `Record already exists: ${params.data.id}`
            );
          }
          c.state[tableName].push(params.data);
          return params.data;
        }
        throw new RivetKitBetterAuthError(
          `Table not found in state: ${tableName}`
        );
      } catch (error) {
        c.log.error(`Auth actor create error for ${params.model}:`, error);
        throw error;
      }
    },
    // Find one operation
    findOne: async (c, params) => {
      try {
        const tableName = c.vars.tableNames[params.model];
        if (c.state[tableName]) {
          return c.state[tableName]?.firstOrNull(
            createLinqPredicate(params.where)
          );
        }
        throw new RivetKitBetterAuthError(
          `Table not found in state: ${tableName}`
        );
      } catch (error) {
        c.log.error(`Auth actor findOne error for ${params.model}:`, error);
        throw error;
      }
    },
    // Find many operation
    findMany: async (c, params) => {
      try {
        const tableName = c.vars.tableNames[params.model];
        if (c.state[tableName]) {
          const records = c.state[tableName];
          let query = records;
          if (params.where && params.where.length > 0) {
            query = query.where(createLinqPredicate(params.where));
          }
          if (params.sortBy && params.sortBy.length > 0) {
            const sortField = params.sortBy[0].field;
            const sortDirection = params.sortBy[0].direction;
            if (sortDirection === "desc") {
              query = query.orderByDescending((item) => item[sortField]);
            } else {
              query = query.orderBy((item) => item[sortField]);
            }
          }
          if (params.offset) {
            query = query.skip(params.offset);
          }
          if (params.limit) {
            query = query.take(params.limit);
          }
          return query.toArray();
        }
        throw new RivetKitBetterAuthError(
          `Table not found in state: ${tableName}`
        );
      } catch (error) {
        c.log.error(`Auth actor findMany error for ${params.model}:`, error);
        throw error;
      }
    },
    // Update operation
    update: async (c, params) => {
      try {
        const tableName = c.vars.tableNames[params.model];
        if (c.state[tableName]) {
          const records = c.state[tableName];
          const recordIndex = records.findIndex(createLinqPredicate(params.where));
          if (recordIndex === -1) {
            throw new Error("Record not found for update");
          }
          const updatedRecord = { ...records[recordIndex], ...params.update };
          records[recordIndex] = updatedRecord;
          return updatedRecord;
        }
        throw new Error("Table not found in state");
      } catch (error) {
        c.log.error(`Auth actor update error for ${params.model}:`, error);
        throw error;
      }
    },
    // Update many operation
    updateMany: async (c, params) => {
      try {
        const tableName = c.vars.tableNames[params.model];
        if (c.state[tableName]) {
          const records = c.state[tableName]?.where(createLinqPredicate(params.where)).map((item) => ({ ...item, ...params.update })).toArray();
          return records.length;
        }
        throw new RivetKitBetterAuthError(
          `Table not found in state: ${tableName}`
        );
      } catch (error) {
        c.log.error(`Auth actor updateMany error for ${params.model}:`, error);
        throw error;
      }
    },
    // Delete operation
    delete: async (c, params) => {
      try {
        const tableName = c.vars.tableNames[params.model];
        if (c.state[tableName]) {
          const predicate = createLinqPredicate(params.where);
          const records = c.state[tableName]?.where((item) => !predicate(item)).toArray();
          c.state[tableName] = records;
          return;
        }
        throw new RivetKitBetterAuthError(
          `Table not found in state: ${tableName}`
        );
      } catch (error) {
        c.log.error(`Auth actor delete error for ${params.model}:`, error);
        throw error;
      }
    },
    // Delete many operation
    deleteMany: async (c, params) => {
      try {
        const tableName = c.vars.tableNames[params.model];
        if (c.state[tableName]) {
          const predicate = createLinqPredicate(params.where);
          const records = c.state[tableName]?.where((item) => !predicate(item)).toArray();
          c.state[tableName] = records;
          return;
        }
        throw new RivetKitBetterAuthError(
          `Table not found in state: ${tableName}`
        );
      } catch (error) {
        c.log.error(`Auth actor deleteMany error for ${params.model}:`, error);
        throw error;
      }
    },
    // Count operation
    count: async (c, params) => {
      try {
        const tableName = c.vars.tableNames[params.model];
        if (c.state[tableName]) {
          const records = c.state[tableName]?.where(createLinqPredicate(params.where)).toArray();
          return records.length;
        }
        throw new RivetKitBetterAuthError(
          `Table not found in state: ${tableName}`
        );
      } catch (error) {
        c.log.error(`Auth actor count error for ${params.model}:`, error);
        throw error;
      }
    }
  };
};
export {
  RivetKitBetterAuthError,
  createLinqPredicate,
  defaultActions,
  defaultActorState,
  rivetKitAdapter,
  tableNames,
  transformWhereClause,
  trimLines
};
