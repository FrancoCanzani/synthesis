import { create } from 'zustand';
import { Note } from '@/lib/types';
import { getToken } from '../helpers';

interface NotesState {
  notes: Note[];
  currentNote: Note | null;
  isLoading: boolean;
  error: string | null;
  fetchNotes: (userId: string) => Promise<void>;
  fetchNote: (id: string) => Promise<void>;
  upsertNote: (note: Partial<Note>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
  setCurrentNote: (note: Note | null) => void;
}

const API_URL = import.meta.env.VITE_API_URL;

export const useNotesStore = create<NotesState>((set) => ({
  notes: [],
  currentNote: null,
  isLoading: false,
  error: null,

  fetchNotes: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = await getToken();
      console.log('Token:', token);
      const response = await fetch(`${API_URL}/notes/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch notes');
      const notes = await response.json();
      set({ notes, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  fetchNote: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/notes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch note');
      const note = await response.json();
      set({ currentNote: note, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  upsertNote: async (note: Partial<Note>) => {
    try {
      const token = await getToken();
      const response = await fetch(`${API_URL}/notes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify(note),
      });
      if (!response.ok) throw new Error('Failed to save note');
      const updatedNote = await response.json();

      set((state) => ({
        notes: state.notes.map((n) =>
          n.id === updatedNote.id ? updatedNote : n
        ),
        currentNote:
          state.currentNote?.id === updatedNote.id
            ? updatedNote
            : state.currentNote,
      }));
    } catch (error) {
      set({ error: (error as Error).message });
    }
  },

  deleteNote: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const token = await getToken();

      const response = await fetch(`${API_URL}/notes/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to delete note');
      set((state) => ({
        notes: state.notes.filter((note) => note.id !== id),
        currentNote: state.currentNote?.id === id ? null : state.currentNote,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  setCurrentNote: (note: Note | null) => {
    set({ currentNote: note });
  },
}));
