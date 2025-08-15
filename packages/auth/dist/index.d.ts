import * as better_auth from 'better-auth';
import { BetterAuthError } from 'better-auth';
import { Client, Registry } from '@rivetkit/actor';
import { AdapterDebugLogs, CleanedWhere } from 'better-auth/adapters';
import { ActionContext } from '@rivetkit/core';

type ActorServerClient = Client<Registry<any>>;
interface RivetKitAdapterConfig {
    /**
     * Helps you debug issues with the adapter.
     */
    debugLogs?: AdapterDebugLogs;
    /**
     * If the table names in the schema are plural.
     */
    modelNames?: string[];
}
declare const rivetKitAdapter: (actorClient: ActorServerClient, config?: RivetKitAdapterConfig) => (options: better_auth.BetterAuthOptions) => better_auth.Adapter;

interface User {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface Session {
    id: string;
    userId: string;
    token: string;
    expiresAt: Date;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface Account {
    id: string;
    userId: string;
    accountId: string;
    providerId: string;
    accessToken?: string;
    refreshToken?: string;
    idToken?: string;
    accessTokenExpiresAt?: Date;
    refreshTokenExpiresAt?: Date;
    scope?: string;
    password?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface Verification {
    id: string;
    identifier: string;
    value: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
interface UserWithRelations extends User {
    sessions?: Session[];
    accounts?: Account[];
}
interface SessionWithUser extends Session {
    user: User;
}
interface AccountWithUser extends Account {
    user: User;
}
interface AdminUser extends User {
    role?: "admin" | "user";
    banned?: boolean;
    banReason?: string;
    banExpires?: Date;
    impersonatedBy?: string;
}
interface AdminSession extends Session {
    impersonatedBy?: string;
    adminId?: string;
}
interface Organization {
    id: string;
    name: string;
    slug: string;
    logo?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
interface Member {
    id: string;
    organizationId: string;
    userId: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}
interface Invitation {
    id: string;
    organizationId: string;
    email: string;
    role: string;
    status: "pending" | "accepted" | "rejected" | "canceled";
    inviterId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
interface OrganizationUser extends User {
    activeOrganizationId?: string;
}
interface Team {
    id: string;
    name: string;
    slug: string;
    description?: string;
    organizationId: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
interface TeamMember {
    id: string;
    teamId: string;
    userId: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}
interface TeamInvitation {
    id: string;
    teamId: string;
    organizationId: string;
    email: string;
    role: string;
    status: "pending" | "accepted" | "rejected" | "canceled";
    inviterId: string;
    expiresAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
interface EmailOTP {
    id: string;
    email: string;
    code: string;
    expiresAt: Date;
    createdAt: Date;
}
interface OTPUser extends User {
    emailOTPEnabled?: boolean;
}
interface TwoFactorUser extends User {
    twoFactorEnabled?: boolean;
    twoFactorSecret?: string;
    twoFactorBackupCodes?: string;
}
interface MagicLink {
    id: string;
    email: string;
    token: string;
    expiresAt: Date;
    createdAt: Date;
}
interface AnonymousUser {
    id: string;
    linkId: string;
    createdAt: Date;
    updatedAt: Date;
}
interface RateLimit {
    key: string;
    count: number;
    expiresAt: Date;
}
interface Passkey {
    id: string;
    userId: string;
    name: string;
    publicKey: string;
    credentialId: string;
    counter: number;
    deviceType: string;
    backedUp: boolean;
    transports?: string[];
    createdAt: Date;
    updatedAt: Date;
}
interface UsernameUser extends User {
    username?: string;
}
interface PhoneUser extends User {
    phoneNumber?: string;
    phoneNumberVerified?: boolean;
}
interface OrganizationWithMembers extends Organization {
    members?: Member[];
    invitations?: Invitation[];
    teams?: Team[];
}
interface TeamWithMembers extends Team {
    members?: TeamMember[];
    invitations?: TeamInvitation[];
    organization?: Organization;
}
interface MemberWithUser extends Member {
    user: User;
    organization: Organization;
}
interface TeamMemberWithUser extends TeamMember {
    user: User;
    team: Team;
}
interface InvitationWithOrganization extends Invitation {
    organization: Organization;
    inviter: User;
}
interface TeamInvitationWithTeam extends TeamInvitation {
    team: Team;
    organization: Organization;
    inviter: User;
}
interface FullUser extends User, AdminUser, OrganizationUser, TwoFactorUser, OTPUser, UsernameUser, PhoneUser {
}
interface AdditionalUserFields {
    [key: string]: any;
}
interface AdditionalSessionFields {
    [key: string]: any;
}
interface CustomUser extends User, AdditionalUserFields {
}
interface CustomSession extends Session, AdditionalSessionFields {
}
interface SecondaryStorage {
    get: (key: string) => Promise<string | null>;
    set: (key: string, value: string, ttl?: number) => Promise<void>;
    delete: (key: string) => Promise<void>;
}
interface DatabaseAdapter {
    id: string;
    create: (data: any) => Promise<any>;
    findOne: (where: any) => Promise<any>;
    findMany: (where?: any) => Promise<any[]>;
    update: (where: any, update: any) => Promise<any>;
    delete: (where: any) => Promise<any>;
}
interface AuthEntities {
    User: any;
    Session: any;
    Account: any;
    Verification: any;
    AdminUser?: any;
    AdminSession?: any;
    Organization?: any;
    Member?: any;
    Invitation?: any;
    Team?: any;
    TeamMember?: any;
    TeamInvitation?: any;
    EmailOTP?: any;
    TwoFactor?: any;
    MagicLink?: any;
    Passkey?: any;
    AnonymousUser?: any;
}
interface FieldAttributes {
    type: "string" | "number" | "boolean" | "date" | "object" | "json";
    required?: boolean;
    defaultValue?: any;
    input?: boolean;
    unique?: boolean;
    references?: string;
}
interface UserSchema {
    modelName?: string;
    fields?: Partial<Record<keyof User, string>>;
    additionalFields?: Record<string, FieldAttributes>;
}
interface SessionSchema {
    modelName?: string;
    fields?: Partial<Record<keyof Session, string>>;
    additionalFields?: Record<string, FieldAttributes>;
}
interface AccountSchema {
    modelName?: string;
    fields?: Partial<Record<keyof Account, string>>;
}
interface VerificationSchema {
    modelName?: string;
    fields?: Partial<Record<keyof Verification, string>>;
}
interface OrganizationSchema {
    modelName?: string;
    fields?: Partial<Record<keyof Organization, string>>;
    additionalFields?: Record<string, FieldAttributes>;
}
interface MemberSchema {
    modelName?: string;
    fields?: Partial<Record<keyof Member, string>>;
    additionalFields?: Record<string, FieldAttributes>;
}
interface TeamSchema {
    modelName?: string;
    fields?: Partial<Record<keyof Team, string>>;
    additionalFields?: Record<string, FieldAttributes>;
}
interface EmailOTPSchema {
    modelName?: string;
    fields?: Partial<Record<keyof EmailOTP, string>>;
}
interface DatabaseHookContext {
    context: {
        session?: Session;
        user?: User;
        organization?: Organization;
        team?: Team;
        request?: Request;
    };
}
interface DatabaseHook<T> {
    before?: (data: T, ctx: DatabaseHookContext) => Promise<{
        data: T;
    } | false | void>;
    after?: (data: T, ctx: DatabaseHookContext) => Promise<void>;
}
interface DatabaseHooks {
    user?: {
        create?: DatabaseHook<User>;
        update?: DatabaseHook<Partial<User>>;
    };
    session?: {
        create?: DatabaseHook<Session>;
        update?: DatabaseHook<Partial<Session>>;
    };
    account?: {
        create?: DatabaseHook<Account>;
        update?: DatabaseHook<Partial<Account>>;
    };
    organization?: {
        create?: DatabaseHook<Organization>;
        update?: DatabaseHook<Partial<Organization>>;
    };
    member?: {
        create?: DatabaseHook<Member>;
        update?: DatabaseHook<Partial<Member>>;
    };
    team?: {
        create?: DatabaseHook<Team>;
        update?: DatabaseHook<Partial<Team>>;
    };
    teamMember?: {
        create?: DatabaseHook<TeamMember>;
        update?: DatabaseHook<Partial<TeamMember>>;
    };
}
interface BetterAuthConfig {
    database?: any;
    secondaryStorage?: SecondaryStorage;
    user?: UserSchema;
    session?: SessionSchema;
    account?: AccountSchema;
    verification?: VerificationSchema;
    organization?: OrganizationSchema;
    member?: MemberSchema;
    team?: TeamSchema;
    emailOTP?: EmailOTPSchema;
    databaseHooks?: DatabaseHooks;
    plugins?: any[];
    advanced?: {
        database?: {
            generateId?: boolean | (() => string);
        };
    };
}
interface RemultAdapterOptions {
    authEntities: AuthEntities;
    dataProvider?: any;
    debugLogs?: boolean;
    usePlural?: boolean;
}
interface AdminPluginConfig {
    schema?: {
        user?: {
            fields?: Partial<Record<keyof AdminUser, string>>;
        };
        session?: {
            fields?: Partial<Record<keyof AdminSession, string>>;
        };
    };
}
interface OrganizationPluginConfig {
    schema?: {
        organization?: {
            modelName?: string;
            fields?: Partial<Record<keyof Organization, string>>;
        };
        member?: {
            modelName?: string;
            fields?: Partial<Record<keyof Member, string>>;
        };
        invitation?: {
            modelName?: string;
            fields?: Partial<Record<keyof Invitation, string>>;
        };
    };
    allowUserToCreateOrganization?: boolean;
    organizationLimit?: number;
    memberLimit?: number;
}
interface TeamsPluginConfig {
    schema?: {
        team?: {
            modelName?: string;
            fields?: Partial<Record<keyof Team, string>>;
        };
        teamMember?: {
            modelName?: string;
            fields?: Partial<Record<keyof TeamMember, string>>;
        };
        teamInvitation?: {
            modelName?: string;
            fields?: Partial<Record<keyof TeamInvitation, string>>;
        };
    };
    teamLimit?: number;
    memberLimit?: number;
}
interface EmailOTPPluginConfig {
    schema?: {
        emailOTP?: {
            modelName?: string;
            fields?: Partial<Record<keyof EmailOTP, string>>;
        };
    };
    otpLength?: number;
    expiresIn?: number;
    sendOTP?: (email: string, otp: string) => Promise<void>;
}
type AuthEntity = User | Session | Account | Verification;
type AuthEntityWithRelations = UserWithRelations | SessionWithUser | AccountWithUser;
type PluginEntity = AdminUser | AdminSession | Organization | Member | Invitation | Team | TeamMember | TeamInvitation | EmailOTP | TwoFactorUser | MagicLink | AnonymousUser | RateLimit | Passkey | UsernameUser | PhoneUser | OTPUser;
type PluginEntityWithRelations = OrganizationWithMembers | TeamWithMembers | MemberWithUser | TeamMemberWithUser | InvitationWithOrganization | TeamInvitationWithTeam;
type AllAuthEntities = AuthEntity | PluginEntity;
type AllAuthEntitiesWithRelations = AuthEntityWithRelations | PluginEntityWithRelations;
type OrganizationRole = "owner" | "admin" | "member";
type TeamRole = "admin" | "member";
type AdminRole = "admin" | "user";
type InvitationStatus = "pending" | "accepted" | "rejected" | "canceled";
type TeamInvitationStatus = "pending" | "accepted" | "rejected" | "canceled";
type WhereOperator = "eq" | "ne" | "lt" | "lte" | "gt" | "gte" | "in" | "contains" | "starts_with" | "startsWith" | "ends_with" | "endsWith";
type WhereConnector = "AND" | "OR";
interface AdvancedWhereCondition {
    field: string;
    operator: WhereOperator;
    value: any;
    connector: WhereConnector;
}
type SortDirection = "asc" | "desc";
interface SortByCondition {
    field: string;
    direction: SortDirection;
}
interface AdapterCreateParams {
    model: string;
    data: any;
}
interface AdapterFindParams {
    model: string;
    where: CleanedWhere[];
}
interface AdapterFindManyParams {
    model: string;
    where?: CleanedWhere[];
    limit?: number;
    sortBy?: SortByCondition[];
    offset?: number;
}
interface AdapterUpdateParams {
    model: string;
    where: CleanedWhere[];
    update: any;
}
interface AdapterDeleteParams {
    model: string;
    where: CleanedWhere[];
}
interface AdapterCountParams {
    model: string;
    where?: CleanedWhere[];
}

type AC = ActionContext<any, any, any, any, any, any, any>;
declare const defaultActions: () => {
    create: (c: AC, params: AdapterCreateParams) => Promise<any>;
    findOne: <T>(c: AC, params: AdapterFindParams) => Promise<T | null>;
    findMany: <T>(c: AC, params: AdapterFindManyParams) => Promise<T[]>;
    update: <T>(c: AC, params: AdapterUpdateParams) => Promise<T>;
    updateMany: (c: AC, params: AdapterUpdateParams) => Promise<number>;
    delete: (c: AC, params: AdapterDeleteParams) => Promise<void>;
    deleteMany: (c: AC, params: AdapterDeleteParams) => Promise<void>;
    count: (c: AC, params: AdapterCountParams) => Promise<number>;
};

declare class RivetKitBetterAuthError extends BetterAuthError {
    constructor(message: string, cause?: string);
}
declare function trimLines(str: string, indentYN?: boolean): string;
declare const tableNames: {
    readonly users: "users";
    readonly sessions: "sessions";
    readonly accounts: "accounts";
    readonly verifications: "verifications";
    readonly passkeys: "passkeys";
    readonly organizations: "organizations";
    readonly members: "members";
    readonly invitations: "invitations";
    readonly teams: "teams";
    readonly jwks: "jwks";
};
declare const defaultActorState: {
    users: User[];
    sessions: Session[];
    accounts: Account[];
    verifications: Verification[];
    passkeys: Passkey[];
    organizations: Organization[];
    members: Member[];
    invitations: Invitation[];
    teams: Team[];
};

/**
 * Creates a predicate function compatible with linq-extensions where method
 * @param where Array of where conditions from better-auth
 * @returns A predicate function that can be used with array.where()
 */
declare function createLinqPredicate(where?: CleanedWhere[]): (item: any) => boolean;
type WherePredicate = ReturnType<typeof createLinqPredicate>;
declare function transformWhereClause(where?: CleanedWhere[]): (_: any) => boolean;

export { type Account, type AccountSchema, type AccountWithUser, type AdapterCountParams, type AdapterCreateParams, type AdapterDeleteParams, type AdapterFindManyParams, type AdapterFindParams, type AdapterUpdateParams, type AdditionalSessionFields, type AdditionalUserFields, type AdminPluginConfig, type AdminRole, type AdminSession, type AdminUser, type AdvancedWhereCondition, type AllAuthEntities, type AllAuthEntitiesWithRelations, type AnonymousUser, type AuthEntities, type AuthEntity, type AuthEntityWithRelations, type BetterAuthConfig, type CustomSession, type CustomUser, type DatabaseAdapter, type DatabaseHook, type DatabaseHookContext, type DatabaseHooks, type EmailOTP, type EmailOTPPluginConfig, type EmailOTPSchema, type FieldAttributes, type FullUser, type Invitation, type InvitationStatus, type InvitationWithOrganization, type MagicLink, type Member, type MemberSchema, type MemberWithUser, type OTPUser, type Organization, type OrganizationPluginConfig, type OrganizationRole, type OrganizationSchema, type OrganizationUser, type OrganizationWithMembers, type Passkey, type PhoneUser, type PluginEntity, type PluginEntityWithRelations, type RateLimit, type RemultAdapterOptions, RivetKitBetterAuthError, type SecondaryStorage, type Session, type SessionSchema, type SessionWithUser, type SortByCondition, type SortDirection, type Team, type TeamInvitation, type TeamInvitationStatus, type TeamInvitationWithTeam, type TeamMember, type TeamMemberWithUser, type TeamRole, type TeamSchema, type TeamWithMembers, type TeamsPluginConfig, type TwoFactorUser, type User, type UserSchema, type UserWithRelations, type UsernameUser, type Verification, type VerificationSchema, type WhereConnector, type WhereOperator, type WherePredicate, createLinqPredicate, defaultActions, defaultActorState, rivetKitAdapter, tableNames, transformWhereClause, trimLines };
