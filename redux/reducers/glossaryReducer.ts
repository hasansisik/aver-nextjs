import { createReducer } from "@reduxjs/toolkit";
import {
  getGlossaryTerms,
  getGlossaryTermBySlug,
  getGlossaryTermById,
  createGlossaryTerm,
  updateGlossaryTerm,
  deleteGlossaryTerm
} from "../actions/glossaryActions";

interface GlossaryTerm {
  _id?: string;
  title: string;
  description: string;
  content?: string;
  slug?: string;
  category?: string;
  isActive?: boolean;
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface GlossaryState {
  glossaryTerms: GlossaryTerm[];
  currentTerm: GlossaryTerm | null;
  loading: boolean;
  error: string | null;
  success?: boolean;
  message?: string;
}

const initialState: GlossaryState = {
  glossaryTerms: [],
  currentTerm: null,
  loading: false,
  error: null,
};

export const glossaryReducer = createReducer(initialState, (builder) => {
  builder
    // Get All Glossary Terms
    .addCase(getGlossaryTerms.pending, (state) => {
      state.loading = true;
    })
    .addCase(getGlossaryTerms.fulfilled, (state, action) => {
      state.loading = false;
      state.glossaryTerms = action.payload.glossaryTerms;
      state.success = true;
    })
    .addCase(getGlossaryTerms.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Get Glossary Term By Slug
    .addCase(getGlossaryTermBySlug.pending, (state) => {
      state.loading = true;
      state.error = null; // Clear any previous errors
    })
    .addCase(getGlossaryTermBySlug.fulfilled, (state, action) => {
      state.loading = false;
      
      if (action.payload) {
        state.currentTerm = action.payload;
        state.success = true;
        state.error = null;
      } else {
        // Handle edge case where payload is empty but no error was thrown
        state.error = "No glossary term data received";
        state.success = false;
      }
    })
    .addCase(getGlossaryTermBySlug.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    // Get Glossary Term By ID
    .addCase(getGlossaryTermById.pending, (state) => {
      state.loading = true;
    })
    .addCase(getGlossaryTermById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentTerm = action.payload;
      state.success = true;
    })
    .addCase(getGlossaryTermById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Create Glossary Term
    .addCase(createGlossaryTerm.pending, (state) => {
      state.loading = true;
    })
    .addCase(createGlossaryTerm.fulfilled, (state, action) => {
      state.loading = false;
      state.glossaryTerms = [action.payload, ...state.glossaryTerms];
      state.currentTerm = action.payload;
      state.success = true;
      state.message = "Sözlük terimi başarıyla oluşturuldu";
    })
    .addCase(createGlossaryTerm.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Update Glossary Term
    .addCase(updateGlossaryTerm.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateGlossaryTerm.fulfilled, (state, action) => {
      state.loading = false;
      // Update term in glossaryTerms array if it exists
      state.glossaryTerms = state.glossaryTerms.map(term => 
        term._id === action.payload._id ? action.payload : term
      );
      state.currentTerm = action.payload;
      state.success = true;
      state.message = "Sözlük terimi başarıyla güncellendi";
    })
    .addCase(updateGlossaryTerm.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Delete Glossary Term
    .addCase(deleteGlossaryTerm.pending, (state) => {
      state.loading = true;
    })
    .addCase(deleteGlossaryTerm.fulfilled, (state, action) => {
      state.loading = false;
      // Remove term from glossaryTerms array
      state.glossaryTerms = state.glossaryTerms.filter(term => term._id !== action.payload.termId);
      // Clear currentTerm if it's the one being deleted
      if (state.currentTerm && state.currentTerm._id === action.payload.termId) {
        state.currentTerm = null;
      }
      state.success = true;
      state.message = action.payload.message;
    })
    .addCase(deleteGlossaryTerm.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
});

export default glossaryReducer; 