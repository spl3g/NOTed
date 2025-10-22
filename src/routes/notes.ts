import { Elysia, t } from "elysia";
import { NotesService } from "../services/notes.service";
import { requireAuth } from "../middleware/auth";
import {
	CreateNoteSchema,
	UpdateNoteSchema,
	ShareNoteSchema,
	NoteIdSchema,
} from "../types/api";

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

// Create route for public note access - no authentication required
const publicNotesRoute = new Elysia().get(
	"/public/notes/:id",
	async ({ params, set }) => {
		// For public notes, we don't need authentication
		// The service method should check if the note is public
		const note = await notesService.getPublicNoteById(params.id);

		if (!note || !note.public) {
			set.status = 404;
			return {
				error: "Not Found",
				message: "Note not found or is not public",
				statusCode: 404,
			};
		}

		// Set accessType to "public" to indicate this is a public note
		return { ...note, accessType: "public" as const };
	},
	{
		params: NoteIdSchema,
		response: {
			200: NoteResponseSchema,
			404: ErrorResponseSchema,
		},
		detail: {
			summary: "Get a public note",
			description: "Retrieve a public note by ID",
			tags: ["Notes"],
		},
	},
);

// Create authenticated route group - for authenticated operations only
const authenticatedNotesRoutes = new Elysia({
	prefix: "/notes",
	detail: { security: [{ bearerAuth: [] }] },
})
	.use(requireAuth)
	.post(
		"/",
		async ({ body, auth, set }) => {
			if (!auth) {
				throw new Error("Authentication required");
			}

			if (!auth.userId) {
				throw new Error("User ID not found in authentication context");
			}

			try {
				const note = await notesService.createNote(body, auth.userId);
				set.status = 201;
				return note;
			} catch (error) {
				throw error;
			}
		},
		{
			body: CreateNoteSchema,
			response: {
				201: NoteResponseSchema,
			},
			detail: {
				summary: "Create a new note",
				description: "Create a new note with optional public visibility",
				tags: ["Notes"],
			},
		},
	)
	.get(
		"/:id",
		async ({ params, auth, set }) => {
			// This will get notes with access (owned, shared, or public) for authenticated users
			const note = await notesService.getNoteById(params.id, auth.userId);

			if (!note) {
				set.status = 404;
				return {
					error: "Not Found",
					message: "Note not found or access denied",
					statusCode: 404,
				};
			}

			return note;
		},
		{
			params: NoteIdSchema,
			response: {
				200: NoteResponseSchema,
				404: ErrorResponseSchema,
			},
			detail: {
				summary: "Get a specific note",
				description:
					"Retrieve a note by ID. User must own the note, have it shared with them, or it must be public",
				tags: ["Notes"],
			},
		},
	)
	.patch(
		"/:id",
		async ({ params, body, auth, set }) => {
			const note = await notesService.updateNote(params.id, body, auth.userId);

			if (!note) {
				set.status = 404;
				return {
					error: "Not Found",
					message: "Note not found or access denied",
					statusCode: 404,
				};
			}

			return note;
		},
		{
			params: NoteIdSchema,
			body: UpdateNoteSchema,
			response: {
				200: NoteResponseSchema,
				404: ErrorResponseSchema,
			},
			detail: {
				summary: "Update a note",
				description:
					"Update the contents or visibility of a note. User must own the note",
				tags: ["Notes"],
			},
		},
	)
	.delete(
		"/:id",
		async ({ params, auth, set }) => {
			const success = await notesService.deleteNote(params.id, auth.userId);

			if (!success) {
				set.status = 404;
				return {
					error: "Not Found",
					message: "Note not found or access denied",
					statusCode: 404,
				};
			}

			set.status = 244;
			return;
		},
		{
			params: NoteIdSchema,
			response: {
				244: t.Void(),
				404: ErrorResponseSchema,
			},
			detail: {
				summary: "Delete a note",
				description: "Delete a note permanently. User must own the note",
				tags: ["Notes"],
			},
		},
	)
	.post(
		"/:id/share",
		async ({ params, body, auth, set }) => {
			const success = await notesService.shareNoteWithUser(
				params.id,
				body.userId,
				auth.userId,
			);

			if (!success) {
				set.status = 404;
				return {
					error: "Not Found",
					message: "Note not found or access denied",
					statusCode: 404,
				};
			}

			return {
				message: "Note shared successfully",
			};
		},
		{
			params: NoteIdSchema,
			body: ShareNoteSchema,
			response: {
				200: t.Object({
					message: t.String(),
				}),
				404: ErrorResponseSchema,
			},
			detail: {
				summary: "Share a note",
				description:
					"Share a note with another user by their user ID. User must own the note",
				tags: ["Notes"],
			},
		},
	)
	.post(
		"/:id/revoke",
		async ({ params, body, auth, set }) => {
			const success = await notesService.revokeNoteShareFromUser(
				params.id,
				body.userId,
				auth.userId,
			);

			if (!success) {
				set.status = 404;
				return {
					error: "Not Found",
					message: "Note not found or access denied",
					statusCode: 404,
				};
			}

			return {
				message: "Note share revoked successfully",
			};
		},
		{
			params: NoteIdSchema,
			body: ShareNoteSchema,
			response: {
				200: t.Object({
					message: t.String(),
				}),
				404: ErrorResponseSchema,
			},
			detail: {
				summary: "Revoke note sharing",
				description:
					"Revoke access to a note from another user. User must own the note",
				tags: ["Notes"],
			},
		},
	);

// Export both route groups
export const notesRoutes = new Elysia()
	.use(publicNotesRoute)
	.use(authenticatedNotesRoutes);
