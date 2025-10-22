import { Elysia, t } from "elysia";
import { AuthService } from "../services/auth.service";
import { authPlugin } from "../middleware/auth";
import {
	CreateUserSchema,
	LoginUserSchema,
	UserResponseSchema,
} from "../types/api";

const authService = new AuthService();

export const authRoutes = new Elysia({
	prefix: "/auth",
})
	.use(authPlugin)
	.post(
		"/register",
		async ({ body, jwt, set }) => {
			try {
				const user = await authService.registerUser(body);

				// Generate JWT token
				const token = await jwt.sign({
					userId: user.id,
					email: user.email,
				});

				set.status = 201;
				return {
					user,
					token,
				};
			} catch (error) {
				if (error instanceof Error && error.message.includes("unique")) {
					set.status = 409;
					return {
						error: "Conflict",
						message: "User with this email already exists",
						statusCode: 409,
					};
				}
				throw error;
			}
		},
		{
			body: CreateUserSchema,
			response: {
				201: t.Object({
					user: UserResponseSchema,
					token: t.String(),
				}),
				409: t.Object({
					error: t.String(),
					message: t.String(),
					statusCode: t.Number(),
				}),
			},
			detail: {
				summary: "Register a new user",
				description:
					"Create a new user account and receive a JWT token for authentication",
				tags: ["Authentication"],
			},
		},
	)
	.post(
		"/login",
		async ({ body, jwt }) => {
			try {
				const user = await authService.loginUser(body);

				// Generate JWT token
				const token = await jwt.sign({
					userId: user.id,
					email: user.email,
				});

				return {
					user,
					token,
				};
			} catch (error) {
				throw error;
			}
		},
		{
			body: LoginUserSchema,
			response: {
				200: t.Object({
					user: UserResponseSchema,
					token: t.String(),
				}),
			},
			detail: {
				summary: "Login user",
				description:
					"Authenticate user with email and password, receive JWT token",
				tags: ["Authentication"],
			},
		},
	);
