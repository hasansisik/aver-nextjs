import { createReducer, createAction } from "@reduxjs/toolkit";
import {
  getBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  addContentBlock,
  removeContentBlock,
  reorderContentBlocks,
  updateContentBlock
} from "../actions/blogActions";

interface ContentBlock {
  _id?: string;
  type: string;
  content: string;
  order?: number;
  metadata?: any;
}

interface Blog {
  _id?: string;                  // MongoDB ObjectId, made optional for new blogs
  title: string;
  description?: string;
  subtitle?: string;             // Added for frontmatter subtitle
  image?: string;
  date?: string;                // Made optional as it might come as createdAt instead
  category?: string;
  author?: string;               // Added for blog post author
  slug?: string;                // Made optional for new drafts
  contentBlocks?: ContentBlock[]; // Made optional for empty blogs
  markdownContent?: string;      // Added for full markdown content
  tags?: string[];
  isPublished?: boolean;        // Default false if not provided
  isActive?: boolean;           // Default true if not provided
  user?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BlogState {
  blogs: Blog[];
  currentBlog: Blog | null;
  loading: boolean;
  error: string | null;
  success?: boolean;
  message?: string;
  pagination: {
    totalBlogs: number;
    currentPage: number;
    totalPages: number;
  };
  lastOptimisticUpdate?: number; // Son optimistik güncelleme zamanı
}

const initialState: BlogState = {
  blogs: [],
  currentBlog: null,
  loading: false,
  error: null,
  pagination: {
    totalBlogs: 0,
    currentPage: 1,
    totalPages: 0
  }
};

// Define the optimistic update action with proper typing
export const optimisticUpdate = createAction<{
  type: 'currentBlog' | 'blogs';
  data: any;
}>('blog/optimisticUpdate');

export const blogReducer = createReducer(initialState, (builder) => {
  builder
    // Optimistic UI update
    .addCase(optimisticUpdate, (state, action) => {
      if (action.payload.type === 'currentBlog') {
        state.currentBlog = action.payload.data;
      } else if (action.payload.type === 'blogs') {
        state.blogs = action.payload.data;
      }
      state.lastOptimisticUpdate = Date.now();
    })
    
    // Get All Blogs
    .addCase(getBlogs.pending, (state) => {
      state.loading = true;
    })
    .addCase(getBlogs.fulfilled, (state, action) => {
      state.loading = false;
      state.blogs = action.payload.blogs;
      state.pagination = {
        totalBlogs: action.payload.totalBlogs || 0,
        currentPage: action.payload.currentPage || 1,
        totalPages: action.payload.totalPages || 1
      };
      state.success = true;
    })
    .addCase(getBlogs.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Get Blog By Slug
    .addCase(getBlogBySlug.pending, (state) => {
      state.loading = true;
      state.error = null; // Clear any previous errors
      console.log("getBlogBySlug.pending - Setting loading to true");
    })
    .addCase(getBlogBySlug.fulfilled, (state, action) => {
      console.log("getBlogBySlug.fulfilled - Received payload:", action.payload);
      state.loading = false;
      
      if (action.payload) {
        state.currentBlog = action.payload;
        state.success = true;
        state.error = null;
      } else {
        // Handle edge case where payload is empty but no error was thrown
        state.error = "No blog data received";
        state.success = false;
      }
    })
    .addCase(getBlogBySlug.rejected, (state, action) => {
      console.log("getBlogBySlug.rejected - Error:", action.payload);
      state.loading = false;
      state.error = action.payload as string;
      state.success = false;
    })

    // Get Blog By ID
    .addCase(getBlogById.pending, (state) => {
      state.loading = true;
    })
    .addCase(getBlogById.fulfilled, (state, action) => {
      state.loading = false;
      state.currentBlog = action.payload;
      state.success = true;
    })
    .addCase(getBlogById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Create Blog
    .addCase(createBlog.pending, (state) => {
      state.loading = true;
    })
    .addCase(createBlog.fulfilled, (state, action) => {
      state.loading = false;
      state.blogs = [action.payload, ...state.blogs];
      state.currentBlog = action.payload;
      state.success = true;
      state.message = "Blog başarıyla oluşturuldu";
    })
    .addCase(createBlog.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Update Blog
    .addCase(updateBlog.pending, (state) => {
      state.loading = true;
    })
    .addCase(updateBlog.fulfilled, (state, action) => {
      state.loading = false;
      // Update blog in blogs array if it exists
      state.blogs = state.blogs.map(blog => 
        blog._id === action.payload._id ? action.payload : blog
      );
      state.currentBlog = action.payload;
      state.success = true;
      state.message = "Blog başarıyla güncellendi";
    })
    .addCase(updateBlog.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Delete Blog
    .addCase(deleteBlog.pending, (state) => {
      state.loading = true;
    })
    .addCase(deleteBlog.fulfilled, (state, action) => {
      state.loading = false;
      // Remove blog from blogs array
      state.blogs = state.blogs.filter(blog => blog._id !== action.payload.blogId);
      // Clear currentBlog if it's the one being deleted
      if (state.currentBlog && state.currentBlog._id === action.payload.blogId) {
        state.currentBlog = null;
      }
      state.success = true;
      state.message = action.payload.message;
    })
    .addCase(deleteBlog.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    })

    // Add Content Block
    .addCase(addContentBlock.pending, (state) => {
      state.loading = true;
    })
    .addCase(addContentBlock.fulfilled, (state, action) => {
      state.loading = false;
      state.currentBlog = action.payload;
      // Update blog in blogs array if it exists
      if (state.blogs.some(blog => blog._id === action.payload._id)) {
        state.blogs = state.blogs.map(blog => 
          blog._id === action.payload._id ? action.payload : blog
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
      state.currentBlog = action.payload;
      // Update blog in blogs array if it exists
      if (state.blogs.some(blog => blog._id === action.payload._id)) {
        state.blogs = state.blogs.map(blog => 
          blog._id === action.payload._id ? action.payload : blog
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
      state.currentBlog = action.payload;
      // Update blog in blogs array if it exists
      if (state.blogs.some(blog => blog._id === action.payload._id)) {
        state.blogs = state.blogs.map(blog => 
          blog._id === action.payload._id ? action.payload : blog
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
      state.currentBlog = action.payload;
      // Update blog in blogs array if it exists
      if (state.blogs.some(blog => blog._id === action.payload._id)) {
        state.blogs = state.blogs.map(blog => 
          blog._id === action.payload._id ? action.payload : blog
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

export default blogReducer; 