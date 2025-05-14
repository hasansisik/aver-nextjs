import { createReducer } from "@reduxjs/toolkit";
import {
  getHeader,
  updateHeader,
  addMenuItem,
  removeMenuItem,
  reorderMenuItems
} from "../actions/headerActions";

interface HeaderLink {
  _id?: string;
  name: string;
  link: string;
  isActive?: boolean;
  order?: number;
}

interface HeaderState {
  header: {
    mainMenu: HeaderLink[];
    socialLinks: HeaderLink[];
    logoText?: string;
    logoUrl?: string;
    isActive?: boolean;
  };
  loading: boolean;
  error: string | null;
  success?: boolean;
  message?: string;
  lastOptimisticUpdate?: number; // Son optimistik güncelleme zamanı
}

const initialState: HeaderState = {
  header: {
    mainMenu: [],
    socialLinks: [],
  },
  loading: false,
  error: null,
};

export const headerReducer = createReducer(initialState, (builder) => {
  builder
    // Optimistik UI güncellemesi
    .addCase('header/optimisticUpdate', (state, action) => {
      state.header = action.payload;
      state.lastOptimisticUpdate = Date.now();
    })
    
    // Get Header
    .addCase(getHeader.pending, (state) => {
      state.loading = true;
    })
    .addCase(getHeader.fulfilled, (state, action) => {
      state.loading = false;
      state.header = action.payload;
      state.success = true;
    })
    .addCase(getHeader.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Update Header
    .addCase(updateHeader.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateHeader.fulfilled, (state, action) => {
      state.loading = false;
      state.header = action.payload;
      state.success = true;
      state.message = "Header başarıyla güncellendi";
    })
    .addCase(updateHeader.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Add Menu Item
    .addCase(addMenuItem.pending, (state) => {
      state.loading = true;
    })
    .addCase(addMenuItem.fulfilled, (state, action) => {
      state.loading = false;
      state.header = action.payload;
      state.success = true;
      state.message = "Menü öğesi başarıyla eklendi";
    })
    .addCase(addMenuItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Remove Menu Item
    .addCase(removeMenuItem.pending, (state) => {
      state.loading = true;
    })
    .addCase(removeMenuItem.fulfilled, (state, action) => {
      state.loading = false;
      state.header = action.payload;
      state.success = true;
      state.message = "Menü öğesi başarıyla kaldırıldı";
    })
    .addCase(removeMenuItem.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Reorder Menu Items
    .addCase(reorderMenuItems.pending, (state) => {
      // Eğer son 1 saniye içinde optimistik güncelleme yapılmışsa loading durumunu değiştirme
      if (!state.lastOptimisticUpdate || Date.now() - state.lastOptimisticUpdate > 1000) {
        state.loading = true;
      }
    })
    .addCase(reorderMenuItems.fulfilled, (state, action) => {
      state.loading = false;
      // Sunucudan gelen veriyi kullan
      state.header = action.payload;
      state.success = true;
      state.message = "Menü öğeleri başarıyla yeniden sıralandı";
      state.lastOptimisticUpdate = undefined; // Optimistik güncelleme flag'ini temizle
    })
    .addCase(reorderMenuItems.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
      state.lastOptimisticUpdate = undefined; // Optimistik güncelleme flag'ini temizle
    });
});

export default headerReducer; 