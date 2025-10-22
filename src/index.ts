import { Elysia } from "elysia";
import { routes } from "./routes";
import { errorHandler } from "./middleware/error";
import { config } from "./config/env";
import { logger } from "@bogeychan/elysia-logger";

const app = new Elysia()
	.use(errorHandler)
	.use(routes)
	.use(
		logger({
			level: "debug",
		}),
	)
	.listen(config.port);

console.log(
	`🦊 NOTed API is running at http://${app.server?.hostname}:${app.server?.port}`,
);
