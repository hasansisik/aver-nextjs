import { createReducer, createAction } from "@reduxjs/toolkit";
import {
  getProjects,
  getProjectBySlug,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  addContentBlock,
  removeContentBlock,
  reorderContentBlocks,
  updateContentBlock
} from "../actions/projectActions";

interface ContentBlock {
  _id?: string;
  type: string;
  content: string;
  order?: number;
  metadata?: any;
}

interface ProjectInfo {
  _id?: string;
  title: string;
  data: string;
}

interface Project {
  _id?: string;                  // MongoDB ObjectId, made optional for new projects
  title: string;
  description?: string;
  image?: string;
  date?: string;                 // Made optional as it might come as createdAt instead
  category?: string;
  color?: string;                // Color for project branding
  slug?: string;                 // Made optional for new drafts
  contentBlocks?: ContentBlock[]; // Made optional for empty projects
  markdownContent?: string;      // Full markdown content
  projectInfo?: ProjectInfo[];   // Array of project info items (client, timeline, etc.)
  isPublished?: boolean;         // Default false if not provided
  isActive?: boolean;            // Default true if not provided
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ProjectState {
  projects: Project[];
  currentProject: Project | null;
  loading: boolean;
  error: string | null;
  success?: boolean;
  message?: string;
  pagination: {
    totalProjects: number;
    currentPage: number;
    totalPages: number;
  };
  lastOptimisticUpdate?: number; // Son optimistik güncelleme zamanı
}

const initialState: ProjectState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
  pagination: {
    totalProjects: 0,
    currentPage: 1,
    totalPages: 0
  }
};

// Define the optimistic update action with proper typing
export const optimisticUpdate = createAction<{
  type: 'currentProject' | 'projects';
  data: any;
}>('project/optimisticUpdate');

export const projectReducer = createReducer(initialState, (builder) => {
  builder
    // Optimistic UI update
    .addCase(optimisticUpdate, (state, action) => {
      if (action.payload.type === 'currentProject') {
        state.currentProject = action.payload.data;
      } else if (action.payload.type === 'projects') {
        state.projects = action.payload.data;
      }
      state.lastOptimisticUpdate = Date.now();
    })
    
    // Get All Projects
    .addCase(getProjects.pending, (state) => {
      state.loading = true;
    })
    .addCase(getProjects.fulfilled, (state, action) => {
      state.loading = false;
      state.projects = action.payload.projects;
      state.pagination = {
        totalProjects: action.payload.totalProjects || 0,
        currentPage: action.payload.currentPage || 1,
        totalPages: action.payload.totalPages || 1
      };
      state.success = true;
    })
    .addCase(getProjects.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Get Project By Slug
    .addCase(getProjectBySlug.pending, (state) => {
      state.loading = true;
      state.error = null; // Clear any previous errors
      console.log("getProjectBySlug.pending - Setting loading to true");
    })
    .addCase(getProjectBySlug.fulfilled, (state, action) => {
      console.log("getProjectBySlug.fulfilled - Received payload:", action.payload);
      state.loading = false;
      
      if (action.payload) {
        state.currentProject = action.payload;
        state.success = true;
        state.error = null;
      } else {
        // Handle edge case where payload is empty but no error was thrown
        state.error = "No project data received";
        state.success = false;
      }
    })
    .addCase(getProjectBySlug.rejected, (state, action) => {
      console.log("getProjectBySlug.rejected - Error:", action.payload);
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    // Get Project By ID
    .addCase(getProjectById.pending, (state) => {
      state.loading = true;
    })
    .addCase(getProjectById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentProject = action.payload;
      state.success = true;
    })
    .addCase(getProjectById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Create Project
    .addCase(createProject.pending, (state) => {
      state.loading = true;
    })
    .addCase(createProject.fulfilled, (state, action) => {
      state.loading = false;
      state.projects = [action.payload, ...state.projects];
      state.currentProject = action.payload;
      state.success = true;
      state.message = "Proje başarıyla oluşturuldu";
    })
    .addCase(createProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Update Project
    .addCase(updateProject.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateProject.fulfilled, (state, action) => {
      state.loading = false;
      // Update project in projects array if it exists
      state.projects = state.projects.map(project => 
        project._id === action.payload._id ? action.payload : project
      );
      state.currentProject = action.payload;
      state.success = true;
      state.message = "Proje başarıyla güncellendi";
    })
    .addCase(updateProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Delete Project
    .addCase(deleteProject.pending, (state) => {
      state.loading = true;
    })
    .addCase(deleteProject.fulfilled, (state, action) => {
      state.loading = false;
      // Remove project from projects array
      state.projects = state.projects.filter(project => project._id !== action.payload.projectId);
      // Clear currentProject if it's the one being deleted
      if (state.currentProject && state.currentProject._id === action.payload.projectId) {
        state.currentProject = null;
      }
      state.success = true;
      state.message = action.payload.message;
    })
    .addCase(deleteProject.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Add Content Block
    .addCase(addContentBlock.pending, (state) => {
      state.loading = true;
    })
    .addCase(addContentBlock.fulfilled, (state, action) => {
      state.loading = false;
      state.currentProject = action.payload;
      // Update project in projects array if it exists
      if (state.projects.some(project => project._id === action.payload._id)) {
        state.projects = state.projects.map(project => 
          project._id === action.payload._id ? action.payload : project
        );
      }
      state.success = true;
      state.message = "İçerik bloğu başarıyla eklendi";
    })
    .addCase(addContentBlock.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Remove Content Block
    .addCase(removeContentBlock.pending, (state) => {
      state.loading = true;
    })
    .addCase(removeContentBlock.fulfilled, (state, action) => {
      state.loading = false;
      state.currentProject = action.payload;
      // Update project in projects array if it exists
      if (state.projects.some(project => project._id === action.payload._id)) {
        state.projects = state.projects.map(project => 
          project._id === action.payload._id ? action.payload : project
        );
      }
      state.success = true;
      state.message = "İçerik bloğu başarıyla kaldırıldı";
    })
    .addCase(removeContentBlock.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Reorder Content Blocks
    .addCase(reorderContentBlocks.pending, (state) => {
      // Eğer son 1 saniye içinde optimistik güncelleme yapılmışsa loading durumunu değiştirme
      if (!state.lastOptimisticUpdate || Date.now() - state.lastOptimisticUpdate > 1000) {
        state.loading = true;
      }
    })
    .addCase(reorderContentBlocks.fulfilled, (state, action) => {
      state.loading = false;
      state.currentProject = action.payload;
      // Update project in projects array if it exists
      if (state.projects.some(project => project._id === action.payload._id)) {
        state.projects = state.projects.map(project => 
          project._id === action.payload._id ? action.payload : project
        );
      }
      state.success = true;
      state.message = "İçerik blokları başarıyla yeniden sıralandı";
      state.lastOptimisticUpdate = undefined; // Optimistik güncelleme flag'ini temizle
    })
    .addCase(reorderContentBlocks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.lastOptimisticUpdate = undefined; // Optimistik güncelleme flag'ini temizle
    })

    // Update Content Block
    .addCase(updateContentBlock.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateContentBlock.fulfilled, (state, action) => {
      state.loading = false;
      state.currentProject = action.payload;
      // Update project in projects array if it exists
      if (state.projects.some(project => project._id === action.payload._id)) {
        state.projects = state.projects.map(project => 
          project._id === action.payload._id ? action.payload : project
        );
      }
      state.success = true;
      state.message = "İçerik bloğu başarıyla güncellendi";
    })
    .addCase(updateContentBlock.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
});

export default projectReducer; 