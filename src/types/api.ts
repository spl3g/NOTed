import { t } from 'elysia';

// User schemas
export const CreateUserSchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 6 }),
});

export const LoginUserSchema = t.Object({
  email: t.String({ format: 'email' }),
  password: t.String({ minLength: 1 }),
});

export const UserResponseSchema = t.Object({
  id: t.String(),
  email: t.String(),
});

// Note schemas
export const CreateNoteSchema = t.Object({
  contents: t.String({ minLength: 1 }),
  public: t.Optional(t.Boolean()),
});

export const UpdateNoteSchema = t.Object({
  contents: t.Optional(t.String({ minLength: 1 })),
  public: t.Optional(t.Boolean()),
});

export const ShareNoteSchema = t.Object({
  userId: t.String({ format: 'uuid' }),
});

// Parameter schemas
export const NoteIdSchema = t.Object({
  id: t.String({ format: 'uuid' }),
});

export const UserIdSchema = t.Object({
  id: t.String({ format: 'uuid' }),
});

// Response types
export interface CreateUserRequest {
  email: string;
  password: string;
}

export interface LoginUserRequest {
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  email: string;
}

export interface CreateNoteRequest {
  contents: string;
  public?: boolean;
}

export interface UpdateNoteRequest {
  contents?: string;
  public?: boolean;
}

export interface ShareNoteRequest {
  userId: string;
}

export interface NoteResponse {
  id: string;
  owner: string | null;
  contents: string;
  public: boolean | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  accessType?: 'owned' | 'shared' | 'public';
}

export interface AuthContext {
  userId: string;
  email: string;
}

export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
}