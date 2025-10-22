import { Elysia, t } from "elysia";
import { NotesService } from "../services/notes.service";
import { requireAuth } from "../middleware/auth";
import { UserIdSchema } from "../types/api";

const notesService = new NotesService();

const NoteResponseSchema = t.Object({
	id: t.String(),
	owner: t.Union([t.String(), t.Null()]),
	contents: t.String(),
	public: t.Union([t.Boolean(), t.Null()]),
	createdAt: t.Union([t.Date(), t.Null()]),
	updatedAt: t.Union([t.Date(), t.Null()]),
	accessType: t.Optional(
		t.Union([t.Literal("owned"), t.Literal("shared"), t.Literal("public")]),
	),
});

const ErrorResponseSchema = t.Object({
	error: t.String(),
	message: t.String(),
	statusCode: t.Number(),
});

export const userRoutes = new Elysia({
	prefix: "/users",
	detail: { security: [{ bearerAuth: [] }] },
})
	.use(requireAuth)
	.get(
		"/:id/notes",
		async ({ params, auth, set }) => {
			// Users can only access their own notes
			if (params.id !== auth.userId) {
				set.status = 403;
				return {
					error: "Forbidden",
					message: "Access denied",
					statusCode: 403,
				};
			}

			const notes = await notesService.getUserNotes(auth.userId);
			return notes;
		},
		{
			params: UserIdSchema,
			response: {
				200: t.Array(NoteResponseSchema),
				403: ErrorResponseSchema,
			},
			detail: {
				summary: "Get user notes",
				description:
					"Get all notes owned by a specific user. Users can only access their own notes",
				tags: ["Users"],
			},
		},
	);
