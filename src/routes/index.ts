import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { openapi } from "@elysiajs/openapi";
import { authRoutes } from "./auth";
import { notesRoutes } from "./notes";
import { userRoutes } from "./users";

export const routes = new Elysia()
	.use(
		cors({
			origin: true,
			credentials: true,
		}),
	)
	.use(
		openapi({
			documentation: {
				components: {
					securitySchemes: {
						bearerAuth: {
							type: "http",
							scheme: "bearer",
							bearerFormat: "JWT",
						},
					},
				},
			},
			provider: "swagger-ui",
		}),
	)
	.group("/api/v1", (app) =>
		app.use(authRoutes).use(notesRoutes).use(userRoutes),
	)
	.get("/", () => ({
		message: "NOTed API",
		version: "1.0.0",
		documentation: "/openapi",
		openapi: "/openapi/json",
		endpoints: {
			auth: "/api/v1/auth",
			users: "/api/v1/users",
			notes: "/api/v1/notes",
		},
	}));
