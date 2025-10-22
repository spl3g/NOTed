import { sql } from '../config/database';
import {
  createNote,
  getNoteById,
  updateNote,
  deleteNote,
  shareNote,
  revokeNoteShare,
  getNotesForUserWithDetails,
  getNoteWithAccess,
  updateNoteTimestamp,
  getPublicNoteById,
} from '../gen/db/queries_sql';
import type { CreateNoteRequest, UpdateNoteRequest, NoteResponse, AuthContext } from '../types/api';

export class NotesService {
  async createNote(noteData: CreateNoteRequest, userId: string): Promise<NoteResponse> {
    const note = await createNote(sql, {
      owner: userId,
      contents: noteData.contents,
      public: noteData.public,
    });

    if (!note) {
      throw new Error('Failed to create note');
    }

    return {
      id: note.id,
      owner: note.owner,
      contents: note.contents,
      public: note.public,
      createdAt: null, // Will be populated by database
      updatedAt: null,
      accessType: 'owned',
    };
  }

  async getNoteById(noteId: string, userId: string): Promise<NoteResponse | null> {
    const note = await getNoteWithAccess(sql, {
      id: noteId,
      owner: userId,
    });

    if (!note) {
      return null;
    }

    return {
      id: note.id,
      owner: note.owner,
      contents: note.contents,
      public: note.public,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      accessType: note.accessType as 'owned' | 'shared' | 'public',
    };
  }

  async getPublicNoteById(noteId: string): Promise<NoteResponse | null> {
    const note = await getPublicNoteById(sql, {
      id: noteId,
    });

    if (!note) {
      return null;
    }

    return {
      id: note.id,
      owner: note.owner,
      contents: note.contents,
      public: note.public,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      accessType: 'public',
    };
  }

  async updateNote(noteId: string, updateData: UpdateNoteRequest, userId: string): Promise<NoteResponse | null> {
    // First check if user has access to the note
    const existingNote = await getNoteWithAccess(sql, {
      id: noteId,
      owner: userId,
    });

    if (!existingNote || existingNote.accessType !== 'owned') {
      return null;
    }

    const note = await updateNote(sql, {
      id: noteId,
      contents: updateData.contents || existingNote.contents,
      public: updateData.public !== undefined ? updateData.public : existingNote.public,
      owner: userId,
    });

    if (!note) {
      return null;
    }

    // Update timestamp
    await updateNoteTimestamp(sql, { id: noteId });

    return {
      id: note.id,
      owner: note.owner,
      contents: note.contents,
      public: note.public,
      createdAt: existingNote.createdAt,
      updatedAt: new Date(),
      accessType: 'owned',
    };
  }

  async deleteNote(noteId: string, userId: string): Promise<boolean> {
    const result = await deleteNote(sql, {
      id: noteId,
      owner: userId,
    });

    return true; // deleteNote doesn't return a value, so we assume success
  }

  async shareNoteWithUser(noteId: string, targetUserId: string, userId: string): Promise<boolean> {
    // First check if user owns the note
    const note = await getNoteById(sql, { id: noteId });
    if (!note || note.owner !== userId) {
      return false;
    }

    await shareNote(sql, {
      noteId,
      userId: targetUserId,
    });

    return true;
  }

  async revokeNoteShareFromUser(noteId: string, targetUserId: string, userId: string): Promise<boolean> {
    // First check if user owns the note
    const note = await getNoteById(sql, { id: noteId });
    if (!note || note.owner !== userId) {
      return false;
    }

    await revokeNoteShare(sql, {
      noteId,
      userId: targetUserId,
    });

    return true;
  }

  async getUserNotes(userId: string): Promise<NoteResponse[]> {
    const notes = await getNotesForUserWithDetails(sql, {
      owner: userId,
    });

    return notes.map(note => ({
      id: note.id,
      owner: note.owner,
      contents: note.contents,
      public: note.public,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
      accessType: note.accessType as 'owned' | 'shared' | 'public',
    }));
  }
}