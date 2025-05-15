import { createReducer } from "@reduxjs/toolkit";
import {
  getFooter,
  updateFooter,
  addMenuItem,
  removeMenuItem,
  reorderMenuItems
} from "../actions/footerActions";

interface FooterLink {
  _id?: string;
  name: string;
  link: string;
  isActive?: boolean;
  order?: number;
}

interface FooterState {
  footer: {
    footerMenu: FooterLink[];
    socialLinks: FooterLink[];
    ctaText?: string;
    ctaLink?: string;
    copyright?: string;
    developerInfo?: string;
    developerLink?: string;
    isActive?: boolean;
  };
  loading: boolean;
  error: string | null;
  success?: boolean;
  message?: string;
  lastOptimisticUpdate?: number; // Son optimistik güncelleme zamanı
}

const initialState: FooterState = {
  footer: {
    footerMenu: [],
    socialLinks: [],
    ctaText: "Let's make something",
    ctaLink: "/contact",
    copyright: "© 2023 Aver. All rights reserved.",
    developerInfo: "Developed by Platol",
    developerLink: "https://themeforest.net/user/platol/portfolio"
  },
  loading: false,
  error: null,
};

export const footerReducer = createReducer(initialState, (builder) => {
  builder
    // Optimistik UI güncellemesi
    .addCase('footer/optimisticUpdate', (state, action) => {
      state.footer = action.payload;
      state.lastOptimisticUpdate = Date.now();
    })
    
    // Get Footer
    .addCase(getFooter.pending, (state) => {
      state.loading = true;
    })
    .addCase(getFooter.fulfilled, (state, action) => {
      state.loading = false;
      state.footer = action.payload;
      state.success = true;
    })
    .addCase(getFooter.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Update Footer
    .addCase(updateFooter.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateFooter.fulfilled, (state, action) => {
      state.loading = false;
      state.footer = action.payload;
      state.success = true;
      state.message = "Footer başarıyla güncellendi";
    })
    .addCase(updateFooter.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Add Menu Item
    .addCase(addMenuItem.pending, (state) => {
      state.loading = true;
    })
    .addCase(addMenuItem.fulfilled, (state, action) => {
      state.loading = false;
      state.footer = action.payload;
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
      state.footer = action.payload;
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
      state.footer = action.payload;
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

export default footerReducer; 