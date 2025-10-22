-- name: CreateUser :one
INSERT INTO "user" (email, password) VALUES ($1, $2) RETURNING id, email;


-- name: GetUserByEmail :one
SELECT id, email, password FROM "user" WHERE email = $1;


-- name: GetUserById :one
SELECT id, email FROM "user" WHERE id = $1;


-- name: CreateNote :one
INSERT INTO note (owner, contents, public) VALUES ($1, $2, $3) RETURNING id, owner, contents, public;


-- name: GetNoteById :one
SELECT id, owner, contents, public FROM note WHERE id = $1;

-- name: GetPublicNoteById :one
SELECT id, owner, contents, public, created_at, updated_at FROM note WHERE id = $1 AND public = true;


-- name: DeleteNote :exec
DELETE FROM note WHERE id = $1 AND owner = $2;


-- name: UpdateNote :one
UPDATE note SET contents = COALESCE($2, contents), public = COALESCE($3, public) WHERE id = $1 AND owner = $4 RETURNING id, owner, contents, public;


-- name: ShareNote :exec
INSERT INTO note_shared_to_user (note_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING;


-- name: RevokeNoteShare :exec
DELETE FROM note_shared_to_user WHERE note_id = $1 AND user_id = $2;


-- name: GetNotesForUser :many
SELECT n.id, n.owner, n.contents, n.public
FROM note n
LEFT JOIN note_shared_to_user s ON s.note_id = n.id
WHERE n.owner = $1 OR s.user_id = $1 OR n.public = true;


-- name: IsNoteSharedToUser :one
SELECT EXISTS(SELECT 1 FROM note_shared_to_user WHERE note_id = $1 AND user_id = $2) as exists;

-- name: GetUserNotes :many
SELECT n.id, n.contents, n.public, n.created_at, n.updated_at
FROM note n
WHERE n.owner = $1
ORDER BY n.updated_at DESC;

-- name: GetSharedNotesForUser :many
SELECT n.id, n.owner, n.contents, n.public, n.created_at, n.updated_at
FROM note n
JOIN note_shared_to_user s ON s.note_id = n.id
WHERE s.user_id = $1
ORDER BY n.updated_at DESC;

-- name: GetPublicNotes :many
SELECT n.id, n.owner, n.contents, n.created_at, n.updated_at
FROM note n
WHERE n.public = true
ORDER BY n.created_at DESC;

-- name: GetNotesForUserWithDetails :many
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
ORDER BY n.updated_at DESC;

-- name: UpdateNoteTimestamp :exec
UPDATE note SET updated_at = now() WHERE id = $1;

-- name: GetNoteWithAccess :one
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
WHERE n.id = $1 AND (n.owner = $2 OR s.user_id = $2 OR n.public = true);
