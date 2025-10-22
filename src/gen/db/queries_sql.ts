import { Sql } from "postgres";

export const createUserQuery = `-- name: CreateUser :one
INSERT INTO "user" (email, password) VALUES ($1, $2) RETURNING id, email`;

export interface CreateUserArgs {
    email: string;
    password: string;
}

export interface CreateUserRow {
    id: string;
    email: string;
}

export async function createUser(sql: Sql, args: CreateUserArgs): Promise<CreateUserRow | null> {
    const rows = await sql.unsafe(createUserQuery, [args.email, args.password]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        email: row[1]
    };
}

export const getUserByEmailQuery = `-- name: GetUserByEmail :one
SELECT id, email, password FROM "user" WHERE email = $1`;

export interface GetUserByEmailArgs {
    email: string;
}

export interface GetUserByEmailRow {
    id: string;
    email: string;
    password: string;
}

export async function getUserByEmail(sql: Sql, args: GetUserByEmailArgs): Promise<GetUserByEmailRow | null> {
    const rows = await sql.unsafe(getUserByEmailQuery, [args.email]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        email: row[1],
        password: row[2]
    };
}

export const getUserByIdQuery = `-- name: GetUserById :one
SELECT id, email FROM "user" WHERE id = $1`;

export interface GetUserByIdArgs {
    id: string;
}

export interface GetUserByIdRow {
    id: string;
    email: string;
}

export async function getUserById(sql: Sql, args: GetUserByIdArgs): Promise<GetUserByIdRow | null> {
    const rows = await sql.unsafe(getUserByIdQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        email: row[1]
    };
}

export const createNoteQuery = `-- name: CreateNote :one
INSERT INTO note (owner, contents, public) VALUES ($1, $2, $3) RETURNING id, owner, contents, public`;

export interface CreateNoteArgs {
    owner: string | null;
    contents: string;
    public: boolean | null;
}

export interface CreateNoteRow {
    id: string;
    owner: string | null;
    contents: string;
    public: boolean | null;
}

export async function createNote(sql: Sql, args: CreateNoteArgs): Promise<CreateNoteRow | null> {
    const rows = await sql.unsafe(createNoteQuery, [args.owner, args.contents, args.public]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        owner: row[1],
        contents: row[2],
        public: row[3]
    };
}

export const getNoteByIdQuery = `-- name: GetNoteById :one
SELECT id, owner, contents, public FROM note WHERE id = $1`;

export interface GetNoteByIdArgs {
    id: string;
}

export interface GetNoteByIdRow {
    id: string;
    owner: string | null;
    contents: string;
    public: boolean | null;
}

export async function getNoteById(sql: Sql, args: GetNoteByIdArgs): Promise<GetNoteByIdRow | null> {
    const rows = await sql.unsafe(getNoteByIdQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        owner: row[1],
        contents: row[2],
        public: row[3]
    };
}

export const getPublicNoteByIdQuery = `-- name: GetPublicNoteById :one
SELECT id, owner, contents, public, created_at, updated_at FROM note WHERE id = $1 AND public = true`;

export interface GetPublicNoteByIdArgs {
    id: string;
}

export interface GetPublicNoteByIdRow {
    id: string;
    owner: string | null;
    contents: string;
    public: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function getPublicNoteById(sql: Sql, args: GetPublicNoteByIdArgs): Promise<GetPublicNoteByIdRow | null> {
    const rows = await sql.unsafe(getPublicNoteByIdQuery, [args.id]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        owner: row[1],
        contents: row[2],
        public: row[3],
        createdAt: row[4],
        updatedAt: row[5]
    };
}

export const deleteNoteQuery = `-- name: DeleteNote :exec
DELETE FROM note WHERE id = $1 AND owner = $2`;

export interface DeleteNoteArgs {
    id: string;
    owner: string | null;
}

export async function deleteNote(sql: Sql, args: DeleteNoteArgs): Promise<void> {
    await sql.unsafe(deleteNoteQuery, [args.id, args.owner]);
}

export const updateNoteQuery = `-- name: UpdateNote :one
UPDATE note SET contents = COALESCE($2, contents), public = COALESCE($3, public) WHERE id = $1 AND owner = $4 RETURNING id, owner, contents, public`;

export interface UpdateNoteArgs {
    id: string;
    contents: string;
    public: boolean | null;
    owner: string | null;
}

export interface UpdateNoteRow {
    id: string;
    owner: string | null;
    contents: string;
    public: boolean | null;
}

export async function updateNote(sql: Sql, args: UpdateNoteArgs): Promise<UpdateNoteRow | null> {
    const rows = await sql.unsafe(updateNoteQuery, [args.id, args.contents, args.public, args.owner]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        owner: row[1],
        contents: row[2],
        public: row[3]
    };
}

export const shareNoteQuery = `-- name: ShareNote :exec
INSERT INTO note_shared_to_user (note_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING`;

export interface ShareNoteArgs {
    noteId: string;
    userId: string;
}

export async function shareNote(sql: Sql, args: ShareNoteArgs): Promise<void> {
    await sql.unsafe(shareNoteQuery, [args.noteId, args.userId]);
}

export const revokeNoteShareQuery = `-- name: RevokeNoteShare :exec
DELETE FROM note_shared_to_user WHERE note_id = $1 AND user_id = $2`;

export interface RevokeNoteShareArgs {
    noteId: string;
    userId: string;
}

export async function revokeNoteShare(sql: Sql, args: RevokeNoteShareArgs): Promise<void> {
    await sql.unsafe(revokeNoteShareQuery, [args.noteId, args.userId]);
}

export const getNotesForUserQuery = `-- name: GetNotesForUser :many
SELECT n.id, n.owner, n.contents, n.public
FROM note n
LEFT JOIN note_shared_to_user s ON s.note_id = n.id
WHERE n.owner = $1 OR s.user_id = $1 OR n.public = true`;

export interface GetNotesForUserArgs {
    owner: string | null;
}

export interface GetNotesForUserRow {
    id: string;
    owner: string | null;
    contents: string;
    public: boolean | null;
}

export async function getNotesForUser(sql: Sql, args: GetNotesForUserArgs): Promise<GetNotesForUserRow[]> {
    return (await sql.unsafe(getNotesForUserQuery, [args.owner]).values()).map(row => ({
        id: row[0],
        owner: row[1],
        contents: row[2],
        public: row[3]
    }));
}

export const isNoteSharedToUserQuery = `-- name: IsNoteSharedToUser :one
SELECT EXISTS(SELECT 1 FROM note_shared_to_user WHERE note_id = $1 AND user_id = $2) as exists`;

export interface IsNoteSharedToUserArgs {
    noteId: string;
    userId: string;
}

export interface IsNoteSharedToUserRow {
    exists: boolean;
}

export async function isNoteSharedToUser(sql: Sql, args: IsNoteSharedToUserArgs): Promise<IsNoteSharedToUserRow | null> {
    const rows = await sql.unsafe(isNoteSharedToUserQuery, [args.noteId, args.userId]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        exists: row[0]
    };
}

export const getUserNotesQuery = `-- name: GetUserNotes :many
SELECT n.id, n.contents, n.public, n.created_at, n.updated_at
FROM note n
WHERE n.owner = $1
ORDER BY n.updated_at DESC`;

export interface GetUserNotesArgs {
    owner: string | null;
}

export interface GetUserNotesRow {
    id: string;
    contents: string;
    public: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function getUserNotes(sql: Sql, args: GetUserNotesArgs): Promise<GetUserNotesRow[]> {
    return (await sql.unsafe(getUserNotesQuery, [args.owner]).values()).map(row => ({
        id: row[0],
        contents: row[1],
        public: row[2],
        createdAt: row[3],
        updatedAt: row[4]
    }));
}

export const getSharedNotesForUserQuery = `-- name: GetSharedNotesForUser :many
SELECT n.id, n.owner, n.contents, n.public, n.created_at, n.updated_at
FROM note n
JOIN note_shared_to_user s ON s.note_id = n.id
WHERE s.user_id = $1
ORDER BY n.updated_at DESC`;

export interface GetSharedNotesForUserArgs {
    userId: string;
}

export interface GetSharedNotesForUserRow {
    id: string;
    owner: string | null;
    contents: string;
    public: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function getSharedNotesForUser(sql: Sql, args: GetSharedNotesForUserArgs): Promise<GetSharedNotesForUserRow[]> {
    return (await sql.unsafe(getSharedNotesForUserQuery, [args.userId]).values()).map(row => ({
        id: row[0],
        owner: row[1],
        contents: row[2],
        public: row[3],
        createdAt: row[4],
        updatedAt: row[5]
    }));
}

export const getPublicNotesQuery = `-- name: GetPublicNotes :many
SELECT n.id, n.owner, n.contents, n.created_at, n.updated_at
FROM note n
WHERE n.public = true
ORDER BY n.created_at DESC`;

export interface GetPublicNotesRow {
    id: string;
    owner: string | null;
    contents: string;
    createdAt: Date | null;
    updatedAt: Date | null;
}

export async function getPublicNotes(sql: Sql): Promise<GetPublicNotesRow[]> {
    return (await sql.unsafe(getPublicNotesQuery, []).values()).map(row => ({
        id: row[0],
        owner: row[1],
        contents: row[2],
        createdAt: row[3],
        updatedAt: row[4]
    }));
}

export const getNotesForUserWithDetailsQuery = `-- name: GetNotesForUserWithDetails :many
SELECT 
  n.id, 
  n.owner, 
  n.contents, 
  n.public, 
  n.created_at, 
  n.updated_at,
  CASE 
    WHEN n.owner = $1 THEN 'owned'
    WHEN s.user_id = $1 THEN 'shared'
    WHEN n.public = true THEN 'public'
  END as access_type
FROM note n
LEFT JOIN note_shared_to_user s ON s.note_id = n.id AND s.user_id = $1
WHERE n.owner = $1 OR s.user_id = $1 OR n.public = true
ORDER BY n.updated_at DESC`;

export interface GetNotesForUserWithDetailsArgs {
    owner: string | null;
}

export interface GetNotesForUserWithDetailsRow {
    id: string;
    owner: string | null;
    contents: string;
    public: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    accessType: string | null;
}

export async function getNotesForUserWithDetails(sql: Sql, args: GetNotesForUserWithDetailsArgs): Promise<GetNotesForUserWithDetailsRow[]> {
    return (await sql.unsafe(getNotesForUserWithDetailsQuery, [args.owner]).values()).map(row => ({
        id: row[0],
        owner: row[1],
        contents: row[2],
        public: row[3],
        createdAt: row[4],
        updatedAt: row[5],
        accessType: row[6]
    }));
}

export const updateNoteTimestampQuery = `-- name: UpdateNoteTimestamp :exec
UPDATE note SET updated_at = now() WHERE id = $1`;

export interface UpdateNoteTimestampArgs {
    id: string;
}

export async function updateNoteTimestamp(sql: Sql, args: UpdateNoteTimestampArgs): Promise<void> {
    await sql.unsafe(updateNoteTimestampQuery, [args.id]);
}

export const getNoteWithAccessQuery = `-- name: GetNoteWithAccess :one
SELECT 
  n.id, 
  n.owner, 
  n.contents, 
  n.public, 
  n.created_at, 
  n.updated_at,
  CASE 
    WHEN n.owner = $2 THEN 'owned'
    WHEN s.user_id = $2 THEN 'shared'
    WHEN n.public = true THEN 'public'
    ELSE 'none'
  END as access_type
FROM note n
LEFT JOIN note_shared_to_user s ON s.note_id = n.id AND s.user_id = $2
WHERE n.id = $1 AND (n.owner = $2 OR s.user_id = $2 OR n.public = true)`;

export interface GetNoteWithAccessArgs {
    id: string;
    owner: string | null;
}

export interface GetNoteWithAccessRow {
    id: string;
    owner: string | null;
    contents: string;
    public: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
    accessType: string;
}

export async function getNoteWithAccess(sql: Sql, args: GetNoteWithAccessArgs): Promise<GetNoteWithAccessRow | null> {
    const rows = await sql.unsafe(getNoteWithAccessQuery, [args.id, args.owner]).values();
    if (rows.length !== 1) {
        return null;
    }
    const row = rows[0];
    return {
        id: row[0],
        owner: row[1],
        contents: row[2],
        public: row[3],
        createdAt: row[4],
        updatedAt: row[5],
        accessType: row[6]
    };
}

