import { rivetKitAdapter } from "@blujosi/rivetkit-better-auth"
import { betterAuth } from "better-auth"
import type { ActorServerClient } from "."

// Environment variables
// const DATABASE_URL = process.env.DATABASE_URL!
const AUTH_SECRET = process.env.AUTH_SECRET ?? "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const BETTER_AUTH_TRUSTED_ORIGINS =
	process.env.BETTER_AUTH_TRUSTED_ORIGINS ??
	"http://localhost:5173,http://localhost:6420"

// Function to create auth instance with actor server client
export const createAuth = (actorServerClient: ActorServerClient) =>
	betterAuth({
		database: rivetKitAdapter(actorServerClient as any, {
			// usePlural: true, already defaults to true
			debugLogs:
				process.env.NODE_ENV === "development"
					? {
						create: true,
						update: true,
						delete: true,
						findOne: true,
						findMany: true,
						count: true,
					}
					: false
		}),

		secret: AUTH_SECRET,

		trustedOrigins: BETTER_AUTH_TRUSTED_ORIGINS?.split(",").map((origin) =>
			origin.trim(),
		),
		// advanced: {
		// 	database: {
		// 		generateId: false,
		// 	},
		// },

		emailAndPassword: {
			enabled: true,
			requireEmailVerification: false,
			autoSignIn: true,
		},

		// emailVerification: {
		// sendVerificationEmail: async ({ user, url }: { user: any; url: string, token: string }) => {
		//   // Generate OTP email template with JSX Email
		//   const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now
		//   const emailHtml = await getVerificationCodeEmail(url, expires)

		//   // Send email using plunk
		//   await plunk.emails.send({
		//     to: user.email,
		//     subject: "🔐 Verify your App account",
		//     body: emailHtml,
		//     type: "html"
		//   })
		// },
		// autoSignInAfterVerification: true,
		// sendOnSignIn: false,
		//},
		// session: {
		// 	expiresIn: 60 * 60 * 24 * 7, // 7 days
		// 	updateAge: 60 * 60 * 24, // 1 day,
		// 	additionalFields: {
		// 		activeOrganizationId: {
		// 			type: "string",
		// 			required: false,
		// 			input: false,
		// 		},
		// 		impersonatedBy: {
		// 			type: "string",
		// 			required: false,
		// 			input: false,
		// 		},
		// 	},
		// },

		// user: {
		// 	additionalFields: {
		// 		roles: { type: "string[]" },
		// 		givenName: {
		// 			type: "string",
		// 			required: true,
		// 			input: true,
		// 		},
		// 		familyName: {
		// 			type: "string",
		// 			required: true,
		// 			input: true,
		// 		},
		// 		displayName: {
		// 			type: "string",
		// 			required: true,
		// 			input: false,
		// 		},
		// 		// Contact info - fields sent during signup
		// 		phoneNumber: {
		// 			type: "string",
		// 			required: false,
		// 			input: true,
		// 		},
		// 		phoneNumberVerified: {
		// 			type: "boolean",
		// 			required: false,
		// 			defaultValue: false,
		// 			input: false,
		// 		},
		// 		// Profile info
		// 		image: {
		// 			type: "string",
		// 			required: false,
		// 			input: false,
		// 		},
		// 		avatarUrl: {
		// 			type: "string",
		// 			required: false,
		// 			input: true,
		// 		},
		// 		// Status - fields sent during signup
		// 		userStatus: {
		// 			type: "string",
		// 			required: false,
		// 			defaultValue: "Active",
		// 			input: false,
		// 		},
		// 		userType: {
		// 			type: "string",
		// 			required: true,
		// 			input: true,
		// 		},
		// 		acceptTerms: {
		// 			type: "boolean",
		// 			required: false,
		// 			input: false,
		// 		},
		// 		authType: {
		// 			type: "string",
		// 			required: false,
		// 			input: false,
		// 		},
		// 		metadata: {
		// 			type: "string",
		// 			required: false,
		// 			input: true,
		// 		},
		// 	},
		// },
		// plugins: [
		// 	passkey({
		// 		rpID: AUTH_RP_ID || "localhost",
		// 		rpName: process.env.PUBLIC_APP_NAME || "App",
		// 		origin: process.env.PUBLIC_FRONTEND_URL, // SvelteKit dev server URL
		// 		authenticatorSelection: {
		// 			residentKey: "required", // Encourage credential storage
		// 			userVerification: "required", // Prefer biometric/PIN verification
		// 		},
		// 	}),
		// 	emailOTP({
		// 		overrideDefaultEmailVerification: true,
		// 		async sendVerificationOTP({ email, otp, type }) {
		// 			// Generate OTP email template with JSX Email
		// 			const emailType: Omit<
		// 				"sign-in" | "email-verification" | "password-reset",
		// 				"password-reset"
		// 			> = type
		// 			const emailHtml = await getOTPCodeEmail(otp, emailType as any, email)

		// 			// Send email using plunk
		// 			await plunk.emails.send({
		// 				to: email,
		// 				subject:
		// 					type === "sign-in"
		// 						? "🔐 Your App sign-in code"
		// 						: type === "email-verification"
		// 							? "🔐 Verify your App email"
		// 							: "🔑 Reset your App password",
		// 				body: emailHtml,
		// 				type: "html",
		// 			})
		// 		},
		// 		otpLength: 6, // 6-digit OTP
		// 		expiresIn: 600, // 10 minutes
		// 		allowedAttempts: 3, // Allow 3 attempts before invalidating
		// 		disableSignUp: true, // Prevent signup for users not previously registered
		// 		// sendVerificationOnSignUp: true
		// 	}),
		// 	organization({
		// 		creatorRole: Roles.OrgAdmin,
		// 		organizationLimit: 5, // Maximum organizations per user
		// 		membershipLimit: 100, // Maximum members per organization
		// 		schema: {
		// 			organization: {
		// 				additionalFields: {
		// 					businessEmail: {
		// 						type: "string",
		// 						required: true,
		// 						input: true,
		// 					},
		// 					businessAddress: {
		// 						type: "string",
		// 						required: false,
		// 						input: true,
		// 					},
		// 					id: {
		// 						type: "string",
		// 						required: false,
		// 						input: true,
		// 					},
		// 				},
		// 			},
		// 		},
		// 		// Custom roles and permissions - using full access control with all resources
		// 		ac: ac as any, // Type assertion to work around TypeScript compatibility
		// 		roles,
		// 		allowUserToCreateOrganization: (user) => {
		// 			console.log("user for role ", JSON.stringify(user))
		// 			const isTrue = isUserInRole(user as UserDbType, Roles.OrgAdmin)
		// 			console.log("user can create roles", isTrue)
		// 			return isTrue
		// 		},
		// 		// Organization creation hooks - using proper better-auth API
		// 		organizationCreation: {
		// 			disabled: false,
		// 			beforeCreate: async ({ organization, user }) => {
		// 				// Custom logic before organization is created
		// 				console.log(
		// 					"Creating organization:",
		// 					organization.name,
		// 					"for user:",
		// 					user.email,
		// 				)
		// 				return {
		// 					data: {
		// 						...organization,
		// 						// Additional metadata can be added here if needed
		// 						metadata: JSON.stringify({
		// 							createdVia: "signup",
		// 							businessType: "standard",
		// 							createdBy: user.id,
		// 						}),
		// 					},
		// 				}
		// 			},
		// 			afterCreate: async ({ organization, user, member }) => {
		// 				//create a team HQ team
		// 				// const teamResponse = await auth.api.createTeam({
		// 				//   body: {
		// 				//     name: 'HQ',
		// 				//     organizationId: organization.id
		// 				//   },
		// 				//   headers: request?.headers

		// 				// })
		// 				// if (!teamResponse?.id) {
		// 				//   throw new APIError(StatusCodes.INTERNAL_SERVER_ERROR, {
		// 				//     message: 'Failed to create default team',
		// 				//     status: StatusCodes.INTERNAL_SERVER_ERROR
		// 				//   })
		// 				// }
		// 				// Send welcome email to the user who created the organization
		// 				console.log(
		// 					"Sending welcome email for new organization:",
		// 					organization.name,
		// 					"to user:",
		// 					user.email,
		// 				)
		// 				const authActor = actorServerClient.authActor.getOrCreate(["auth"])
		// 				await authActor.update({
		// 					model: "user",
		// 					where: [{ field: "id", value: user.id }],
		// 					update: {
		// 						organizationId: organization.id,
		// 						teamId: member.teamId,
		// 					},
		// 				})
		// 				await authActor.update({
		// 					model: "teams",
		// 					where: [{ field: "id", value: member.teamId }],
		// 					update: {
		// 						teamId: member.teamId,
		// 					},
		// 				})

		// 				try {
		// 					// Generate dashboard URL for the new organization
		// 					const dashboardUrl = `${process.env.PUBLIC_FRONTEND_URL}/dashboard?org=${organization.id}`

		// 					// Generate the welcome email HTML
		// 					const emailHtml = await getNewOrganizationEmail({
		// 						userName: user.name || user.email,
		// 						userEmail: user.email,
		// 						organizationName: organization.name,
		// 						organizationId: organization.id,
		// 						dashboardUrl,
		// 						logoUrl: organization.logo || undefined,
		// 					})

		// 					// Send the welcome email using Plunk
		// 					await plunk.emails.send({
		// 						to: user.email,
		// 						subject: `🎉 Welcome to App! Your organization "${organization.name}" is ready`,
		// 						body: emailHtml,
		// 						type: "html",
		// 					})

		// 					console.log("Welcome email sent successfully to:", user.email)
		// 				} catch (emailError) {
		// 					console.error("Failed to send welcome email:", emailError)
		// 					// Don't throw here - we don't want organization creation to fail if email fails
		// 					// The organization is still created successfully
		// 				}
		// 			},
		// 		},

		// 		// Organization deletion hooks
		// 		organizationDeletion: {
		// 			disabled: false,
		// 		},

		// 		// Teams configuration
		// 		teams: {
		// 			enabled: true,
		// 			maximumTeams: 300, // Allow up to 20 teams per organization
		// 			allowRemovingAllTeams: false, // Prevent removing the last team
		// 			maximumMembersPerTeam: 500, // Maximum members per team
		// 		},

		// 		// Invitation configuration
		// 		invitationExpiresIn: 48 * 60 * 60, // 48 hours in seconds
		// 		cancelPendingInvitationsOnReInvite: true,
		// 		invitationLimit: 100, // Maximum invitations per user

		// 		// Email invitation handler
		// 		async sendInvitationEmail(data) {
		// 			// Generate invitation link with the invitation ID
		// 			const inviteLink = `${process.env.PUBLIC_FRONTEND_URL}/invitation/${data.id}`

		// 			console.log("Sending invitation email:", {
		// 				email: data.email,
		// 				inviterName: data.inviter.user.name || data.inviter.user.email,
		// 				organizationName: data.organization.name,
		// 				role: data.role,
		// 				teamId: data.invitation.teamId,
		// 				inviteLink,
		// 			})

		// 			// Send invitation email using Plunk
		// 			try {
		// 				const emailHtml = await getInvitationEmail({
		// 					inviterName: data.inviter.user.name || data.inviter.user.email,
		// 					organizationName: data.organization.name,
		// 					teamName: data.invitation.teamId ? "Team Member" : undefined, // We don't have team name in data, but we know if they're assigned to a team
		// 					role: Array.isArray(data.role) ? data.role.join(", ") : data.role,
		// 					inviteLink,
		// 					logoUrl: data.organization.logo || undefined,
		// 				})

		// 				await plunk.emails.send({
		// 					to: data.email,
		// 					subject: `You're invited to join ${data.organization.name}`,
		// 					body: emailHtml,
		// 					type: "html",
		// 				})

		// 				console.log("Invitation email sent successfully to:", data.email)
		// 			} catch (emailError) {
		// 				console.error("Failed to send invitation email:", emailError)
		// 				// Don't throw here - we don't want invitation creation to fail if email fails
		// 				// The invitation is still created and can be resent later
		// 			}
		// 		},
		// 	}),
		// 	admin(adminConfig),
		// ],
		// databaseHooks: {
		// 	user: {
		// 		create: {
		// 			before: async (ctx) => {
		// 				try {
		// 					console.log("Before user createhook - signup validation:", {
		// 						userType: ctx["userType"],
		// 						email: ctx?.email,
		// 					})
		// 					console.log(JSON.stringify(ctx))
		// 					// Temporarily disable organization existence check to debug
		// 					// TODO: Re-enable after fixing actor client issues

		// 					// Only check for Staff users
		// 					if (ctx["userType"] === UserAccountTypes.Staff && ctx.email) {
		// 						const emailDomain = getDomain(ctx.email)
		// 						const orgExists = await doesOrgExists(emailDomain)

		// 						if (orgExists) {
		// 							throw new APIError(StatusCodes.BAD_REQUEST, {
		// 								message:
		// 									"Business already registered, please use an invite link to sign up",
		// 								status: StatusCodes.BAD_REQUEST,
		// 							})
		// 						}
		// 					}

		// 					// Continue with normal flow
		// 					return
		// 				} catch (error) {
		// 					console.error("Before hook error:", error)
		// 					// Re-throw APIError as-is, wrap other errors
		// 					if (error instanceof APIError) {
		// 						throw error
		// 					}
		// 					throw new APIError(StatusCodes.INTERNAL_SERVER_ERROR, {
		// 						message: "Failed to validate signup request",
		// 						status: StatusCodes.INTERNAL_SERVER_ERROR,
		// 					})
		// 				}
		// 			},
		// 			after: async (ctx) => {
		// 				try {
		// 					const userCtx = ctx as any
		// 					console.log("After user create hook:", {
		// 						userId: ctx.id,
		// 						metadata: userCtx.metadata,
		// 					})

		// 					// Parse metadata if it exists
		// 					if (userCtx.metadata) {
		// 						// Check if metadata is already an object or needs parsing
		// 						let metadata = userCtx.metadata
		// 						if (typeof metadata === "string") {
		// 							metadata = JSON.parse(metadata)
		// 						}
		// 						console.log("Parsed metadata:", metadata)
		// 						const authActor = actorServerClient.authActor.getOrCreate([
		// 							"auth",
		// 						])
		// 						// Update user with organizationId from metadata
		// 						if (metadata.organizationId) {
		// 							await authActor.update({
		// 								model: "user",
		// 								where: [{ field: "id", value: ctx.id }],
		// 								update: { organizationId: metadata.organizationId },
		// 							})
		// 							console.log(
		// 								"Updated user organizationId:",
		// 								metadata.organizationId,
		// 							)
		// 						}
		// 					}
		// 				} catch (error) {
		// 					console.error("After user create hook error:", error)
		// 					// Don't throw here - user is already created, just log the error
		// 				}
		// 			},
		// 		},
		// 	},
		// },
	})
