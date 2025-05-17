import { createReducer, createAction } from "@reduxjs/toolkit";
import {
  getServices,
  getServiceBySlug,
  getServiceById,
  createService,
  updateService,
  deleteService,
  addContentBlock,
  removeContentBlock,
  reorderContentBlocks,
  updateContentBlock,
  updateFeature,
  removeFeature
} from "../actions/serviceActions";

interface ContentBlock {
  _id?: string;
  type: string;
  content: string;
  order?: number;
  metadata?: any;
}

interface Feature {
  _id?: string;
  title: string;
  order?: number;
}

interface Service {
  _id?: string;                  // MongoDB ObjectId, made optional for new services
  title: string;
  description?: string;
  icon?: string;
  image?: string;
  slug?: string;                // Made optional for new drafts
  contentBlocks?: ContentBlock[]; // Made optional for empty services
  markdownContent?: string;      // Added for full markdown content
  features?: Feature[];         // Service features list
  isPublished?: boolean;        // Default false if not provided
  isActive?: boolean;           // Default true if not provided
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface ServiceState {
  services: Service[];
  currentService: Service | null;
  loading: boolean;
  error: string | null;
  success?: boolean;
  message?: string;
  pagination: {
    totalServices: number;
    currentPage: number;
    totalPages: number;
  };
  lastOptimisticUpdate?: number; // Son optimistik güncelleme zamanı
}

const initialState: ServiceState = {
  services: [],
  currentService: null,
  loading: false,
  error: null,
  pagination: {
    totalServices: 0,
    currentPage: 1,
    totalPages: 0
  }
};

// Define the optimistic update action with proper typing
export const optimisticUpdate = createAction<{
  type: 'currentService' | 'services';
  data: any;
}>('service/optimisticUpdate');

export const serviceReducer = createReducer(initialState, (builder) => {
  builder
    // Optimistic UI update
    .addCase(optimisticUpdate, (state, action) => {
      if (action.payload.type === 'currentService') {
        state.currentService = action.payload.data;
      } else if (action.payload.type === 'services') {
        state.services = action.payload.data;
      }
      state.lastOptimisticUpdate = Date.now();
    })
    
    // Get All Services
    .addCase(getServices.pending, (state) => {
      state.loading = true;
    })
    .addCase(getServices.fulfilled, (state, action) => {
      state.loading = false;
      state.services = action.payload.services;
      state.pagination = {
        totalServices: action.payload.totalServices || 0,
        currentPage: action.payload.currentPage || 1,
        totalPages: action.payload.totalPages || 1
      };
      state.success = true;
    })
    .addCase(getServices.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Get Service By Slug
    .addCase(getServiceBySlug.pending, (state) => {
      state.loading = true;
      state.error = null; // Clear any previous errors
      console.log("getServiceBySlug.pending - Setting loading to true");
    })
    .addCase(getServiceBySlug.fulfilled, (state, action) => {
      console.log("getServiceBySlug.fulfilled - Received payload:", action.payload);
      state.loading = false;
      
      if (action.payload) {
        state.currentService = action.payload;
        state.success = true;
        state.error = null;
      } else {
        // Handle edge case where payload is empty but no error was thrown
        state.error = "No service data received";
        state.success = false;
      }
    })
    .addCase(getServiceBySlug.rejected, (state, action) => {
      console.log("getServiceBySlug.rejected - Error:", action.payload);
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    // Get Service By ID
    .addCase(getServiceById.pending, (state) => {
      state.loading = true;
    })
    .addCase(getServiceById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentService = action.payload;
      state.success = true;
    })
    .addCase(getServiceById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Create Service
    .addCase(createService.pending, (state) => {
      state.loading = true;
    })
    .addCase(createService.fulfilled, (state, action) => {
      state.loading = false;
      state.services = [action.payload, ...state.services];
      state.currentService = action.payload;
      state.success = true;
      state.message = "Servis başarıyla oluşturuldu";
    })
    .addCase(createService.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Update Service
    .addCase(updateService.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateService.fulfilled, (state, action) => {
      state.loading = false;
      // Update service in services array if it exists
      state.services = state.services.map(service => 
        service._id === action.payload._id ? action.payload : service
      );
      state.currentService = action.payload;
      state.success = true;
      state.message = "Servis başarıyla güncellendi";
    })
    .addCase(updateService.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Delete Service
    .addCase(deleteService.pending, (state) => {
      state.loading = true;
    })
    .addCase(deleteService.fulfilled, (state, action) => {
      state.loading = false;
      // Remove service from services array
      state.services = state.services.filter(service => service._id !== action.payload.serviceId);
      // Clear currentService if it's the one being deleted
      if (state.currentService && state.currentService._id === action.payload.serviceId) {
        state.currentService = null;
      }
      state.success = true;
      state.message = action.payload.message;
    })
    .addCase(deleteService.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Add Content Block
    .addCase(addContentBlock.pending, (state) => {
      state.loading = true;
    })
    .addCase(addContentBlock.fulfilled, (state, action) => {
      state.loading = false;
      state.currentService = action.payload;
      // Update service in services array if it exists
      if (state.services.some(service => service._id === action.payload._id)) {
        state.services = state.services.map(service => 
          service._id === action.payload._id ? action.payload : service
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
      state.currentService = action.payload;
      // Update service in services array if it exists
      if (state.services.some(service => service._id === action.payload._id)) {
        state.services = state.services.map(service => 
          service._id === action.payload._id ? action.payload : service
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
      state.currentService = action.payload;
      // Update service in services array if it exists
      if (state.services.some(service => service._id === action.payload._id)) {
        state.services = state.services.map(service => 
          service._id === action.payload._id ? action.payload : service
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
      state.currentService = action.payload;
      // Update service in services array if it exists
      if (state.services.some(service => service._id === action.payload._id)) {
        state.services = state.services.map(service => 
          service._id === action.payload._id ? action.payload : service
        );
      }
      state.success = true;
      state.message = "İçerik bloğu başarıyla güncellendi";
    })
    .addCase(updateContentBlock.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Update Feature
    .addCase(updateFeature.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateFeature.fulfilled, (state, action) => {
      state.loading = false;
      state.currentService = action.payload;
      // Update service in services array if it exists
      if (state.services.some(service => service._id === action.payload._id)) {
        state.services = state.services.map(service => 
          service._id === action.payload._id ? action.payload : service
        );
      }
      state.success = true;
      state.message = "Özellik başarıyla güncellendi";
    })
    .addCase(updateFeature.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Remove Feature
    .addCase(removeFeature.pending, (state) => {
      state.loading = true;
    })
    .addCase(removeFeature.fulfilled, (state, action) => {
      state.loading = false;
      state.currentService = action.payload;
      // Update service in services array if it exists
      if (state.services.some(service => service._id === action.payload._id)) {
        state.services = state.services.map(service => 
          service._id === action.payload._id ? action.payload : service
        );
      }
      state.success = true;
      state.message = "Özellik başarıyla kaldırıldı";
    })
    .addCase(removeFeature.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
});

export default serviceReducer; 