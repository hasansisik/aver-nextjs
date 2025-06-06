"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getBlogs, createBlog, deleteBlog } from "@/redux/actions/blogActions";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Label } from "@/app/_components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert";
import { AlertCircle, Check, Trash, Edit, Eye, Upload, Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/app/_components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { uploadImageToCloudinary } from "../../../utils/cloudinary";
import Link from "next/link";

export default function BlogPage() {
  const dispatch = useDispatch();
  const { blogs, loading, error, success, message } = useSelector((state) => state.blog);
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [newBlogDialogOpen, setNewBlogDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState(null);
  
  // New blog form state
  const [blogForm, setBlogForm] = useState({
    title: "",
    description: "",
    image: "",
    category: "",
    tags: ""
  });
  
  // Load all blogs on component mount
  useEffect(() => {
    dispatch(getBlogs());
  }, [dispatch]);
  

  useEffect(() => {
    if (success && message) {
      setAlertType("success");
      setAlertMessage(message);
      setShowAlert(true);
      
      const timeout = setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
    
    if (error) {
      setAlertType("error");
      setAlertMessage(error);
      setShowAlert(true);
      
      const timeout = setTimeout(() => {
        setShowAlert(false);
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, [success, error, message]);
  
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setImageUploading(true);
      const uploadedUrl = await uploadImageToCloudinary(file);
      
      setBlogForm({
        ...blogForm,
        image: uploadedUrl
      });
      
      setAlertType("success");
      setAlertMessage("Image uploaded successfully");
      setShowAlert(true);
    } catch (error) {
      setAlertType("error");
      setAlertMessage(`Error uploading image: ${error.message}`);
      setShowAlert(true);
    } finally {
      setImageUploading(false);
    }
  };
  
  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBlogForm({
      ...blogForm,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const handleCreateBlog = (e) => {
    e.preventDefault();
    
    // Convert tags string to array
    const tagsArray = blogForm.tags
      ? blogForm.tags.split(',').map(tag => tag.trim())
      : [];
    
    const blogData = {
      ...blogForm,
      tags: tagsArray
    };
    
    dispatch(createBlog(blogData));
    setNewBlogDialogOpen(false);
    resetBlogForm();
  };
  
  const resetBlogForm = () => {
    setBlogForm({
      title: "",
      description: "",
      image: "",
      category: "",
      tags: ""
    });
  };
  
  const confirmDeleteBlog = (blogId) => {
    setBlogToDelete(blogId);
    setDeleteAlertOpen(true);
  };
  
  const handleDeleteBlog = () => {
    if (blogToDelete) {
      dispatch(deleteBlog(blogToDelete));
      setBlogToDelete(null);
    }
  };
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <Dialog open={newBlogDialogOpen} onOpenChange={setNewBlogDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} /> Add New Blog
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>New Blog Post</DialogTitle>
              <DialogDescription>
                Create a new blog post. You can add content blocks later.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateBlog}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Title
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={blogForm.title}
                    onChange={handleFormChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={blogForm.description}
                    onChange={handleFormChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Category
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    value={blogForm.category}
                    onChange={handleFormChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tags" className="text-right">
                    Tags
                  </Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={blogForm.tags}
                    onChange={handleFormChange}
                    className="col-span-3"
                    placeholder="Separate with commas"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Cover Image</Label>
                  <div className="col-span-3">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="relative"
                        disabled={imageUploading}
                      >
                        <input
                          type="file"
                          className="absolute inset-0 opacity-0 cursor-pointer"
                          onChange={handleImageUpload}
                          accept="image/*"
                        />
                        {imageUploading ? "Uploading..." : "Upload Image"}
                        <Upload className="ml-2 h-4 w-4" />
                      </Button>
                      {blogForm.image && (
                        <div className="text-sm text-green-600 flex items-center gap-1">
                          <Check className="h-4 w-4" /> Uploaded
                        </div>
                      )}
                    </div>
                    {blogForm.image && (
                      <div className="mt-2">
                        <img 
                          src={blogForm.image} 
                          alt="Preview" 
                          className="h-20 object-cover rounded" 
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNewBlogDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={!blogForm.title || imageUploading}>
                  Create Blog
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      {showAlert && (
        <Alert className={`mb-4 ${alertType === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {alertType === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{alertType === "success" ? "Success" : "Error"}</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
      
      {loading && <div className="text-center py-10">Loading...</div>}
      
      {!loading && (!blogs || blogs.length === 0) && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500 mb-4">No blog posts found yet.</p>
          <Button onClick={() => setNewBlogDialogOpen(true)}>Create Your First Blog Post</Button>
        </div>
      )}
      
      {!loading && blogs && blogs.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogs.map((blog) => (
            <Card key={blog._id} className="overflow-hidden flex flex-col">
              {blog.image && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={blog.image} 
                    alt={blog.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-2">{blog.title}</CardTitle>
                    {blog.category && (
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mt-2">
                        {blog.category}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{blog.description}</p>
                {blog.tags && blog.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-3">
                    {blog.tags.map((tag, index) => (
                      <span key={index} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(blog.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </CardContent>
              <CardFooter className="border-t pt-4 mt-auto">
                <div className="flex justify-between w-full">
                  <Button 
                    variant="destructive" 
                    size="sm"
                    onClick={() => confirmDeleteBlog(blog._id)}
                  >
                    <Trash size={16} />
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link href={`/blog/${blog.slug}`} target="_blank">
                        <Eye size={16} className="mr-1" /> View
                      </Link>
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      asChild
                    >
                      <Link href={`/dashboard/blog/${blog._id}`}>
                        <Edit size={16} className="mr-1" /> Edit
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this blog post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The blog post will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setBlogToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteBlog} className="bg-red-600 focus:ring-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 