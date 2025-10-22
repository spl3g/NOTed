import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { config } from "../config/env";
import type { AuthContext } from "../types/api";

export const authPlugin = new Elysia({ name: "auth:plugin" })
	.use(
		jwt({
			name: "jwt",
			secret: config.jwtSecret,
		}),
	)
	.derive({ as: "global" }, async ({ headers, jwt }) => {
		const authHeader = headers.authorization;
		if (!authHeader?.startsWith("Bearer ")) {
			return { auth: null };
		}

		const token = authHeader.slice(7).trim();

		try {
			const payload = await jwt.verify(token);

			if (payload && typeof payload === "object" && "userId" in payload) {
				return {
					auth: {
						userId: payload.userId as string,
						email: payload.email as string,
					} as AuthContext,
				};
			}
			return { auth: null };
		} catch {
			return { auth: null };
		}
	});

export const requireAuth = new Elysia({ name: "auth:require" })
	.use(authPlugin)
	.derive({ as: "scoped" }, ({ auth, set }) => {
		if (!auth) {
			set.status = 401;
			throw new Error("Unauthorized");
		}
		return { auth };
	});
