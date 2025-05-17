"use client";

import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  getBlogById, 
  updateBlog, 
} from "@/redux/actions/blogActions";
import { useParams, useRouter } from "next/navigation";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Label } from "@/app/_components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert";
import { 
  AlertCircle, 
  Check, 
  Save, 
  Upload, 
  ArrowLeft, 
  ImageIcon, 
  FileText,
  Loader2,
  Youtube
} from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/app/_components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select";
import { uploadImageToCloudinary } from "../../../../utils/cloudinary";
import Link from "next/link";
import BlogContentEditor from "../../_components/blog/BlogContentEditor";

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentBlog, loading, error, success, message } = useSelector((state) => state.blog);
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  
  // Blog form state
  const [blogForm, setBlogForm] = useState({
    title: "",
    description: "",
    image: "",
    category: "",
    tags: "",
    content: ""
  });
  
  // Image upload dialog state
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const imageUploadRef = useRef(null);
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [alignment, setAlignment] = useState("left");
  const [titleText, setTitleText] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("single");
  const [multipleImages, setMultipleImages] = useState([]);
  const multipleImageRefsRef = useRef([]);
  const [imageDialogTab, setImageDialogTab] = useState("template");
  
  // Video dialog state
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  
  useEffect(() => {
    if (params.id) {
      // Fetch blog by ID
      dispatch(getBlogById(params.id));
    }
  }, [dispatch, params.id]);
  
  useEffect(() => {
    if (currentBlog) {
      // Use markdownContent if available, otherwise try to convert from contentBlocks
      let markdownContent = currentBlog.markdownContent || "";
      
      // If no markdownContent but contentBlocks exist, convert them (for backward compatibility)
      if (!markdownContent && currentBlog.contentBlocks && currentBlog.contentBlocks.length > 0) {
        // Sort blocks by order
        const sortedBlocks = [...currentBlog.contentBlocks].sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Convert each block to markdown
        markdownContent = sortedBlocks.map(block => {
          switch (block.type) {
            case 'text':
              return block.content;
            case 'heading':
              return block.content;
            case 'image':
              return `![${block.metadata?.alt || 'Image'}](${block.content})`;
            case 'code':
              return block.content;
            case 'quote':
              return block.content;
            case 'unordered-list':
              return block.content;
            case 'ordered-list':
              return block.content;
            case 'link':
              return block.content;
            case 'emphasis':
              return block.content;
            case 'table':
              return block.content;
            default:
              return block.content;
          }
        }).join("\n\n");
      }
      
      setBlogForm({
        title: currentBlog.title || "",
        description: currentBlog.description || "",
        image: currentBlog.image || "",
        category: currentBlog.category || "",
        tags: currentBlog.tags ? currentBlog.tags.join(", ") : "",
        content: markdownContent
      });
    }
  }, [currentBlog]);
  
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
      setAlertMessage("Görsel başarıyla yüklendi");
      setShowAlert(true);
    } catch (error) {
      setAlertType("error");
      setAlertMessage(`Görsel yüklenirken hata oluştu: ${error.message}`);
      setShowAlert(true);
    } finally {
      setImageUploading(false);
    }
  };
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setBlogForm({
      ...blogForm,
      [name]: value
    });
  };
  
  const handleUpdateBlog = (e) => {
    e.preventDefault();
    
    // Prepare the tags array from the comma-separated string
    const tagsArray = blogForm.tags
      ? blogForm.tags.split(',').map(tag => tag.trim())
      : [];
    
    const blogData = {
      blogId: currentBlog._id,
      title: blogForm.title,
      description: blogForm.description,
      image: blogForm.image,
      category: blogForm.category,
      tags: tagsArray,
      markdownContent: blogForm.content // Save content to markdownContent field
    };
    
    dispatch(updateBlog(blogData));
  };
  
  // Handle content changes from the editor
  const handleContentChange = (newContent) => {
    setBlogForm({
      ...blogForm,
      content: newContent
    });
  };
  
  // Handle the save action from the editor
  const handleContentSave = async (newContent) => {
    // Prepare the tags array from the comma-separated string
    const tagsArray = blogForm.tags
      ? blogForm.tags.split(',').map(tag => tag.trim())
      : [];
    
    const blogData = {
      blogId: currentBlog._id,
      title: blogForm.title,
      description: blogForm.description,
      image: blogForm.image,
      category: blogForm.category,
      tags: tagsArray,
      markdownContent: newContent // Save content to markdownContent field
    };
    
    await dispatch(updateBlog(blogData)).unwrap();
    
    // Update local state
    setBlogForm({
      ...blogForm,
      content: newContent
    });
  };
  
  if (loading && !currentBlog) {
    return <div className="text-center py-10">Yükleniyor...</div>;
  }
  
  if (!currentBlog) {
    return <div className="text-center py-10">Blog bulunamadı</div>;
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/blog">
              <ArrowLeft size={16} />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Blog Düzenle</h1>
        </div>
        <Button onClick={handleUpdateBlog} className="flex items-center gap-2">
          <Save size={16} /> Kaydet
        </Button>
      </div>
      
      {showAlert && (
        <Alert className={`mb-4 ${alertType === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {alertType === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{alertType === "success" ? "Başarılı" : "Hata"}</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blog info section */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Blog Bilgileri</CardTitle>
              <CardDescription>
                Blog yazınızın temel bilgilerini düzenleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Başlık</Label>
                    <Input
                      id="title"
                      name="title"
                      value={blogForm.title}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={blogForm.description}
                      onChange={handleFormChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Input
                        id="category"
                        name="category"
                        value={blogForm.category}
                        onChange={handleFormChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tags">Etiketler</Label>
                      <Input
                        id="tags"
                        name="tags"
                        value={blogForm.tags}
                        onChange={handleFormChange}
                        placeholder="Virgülle ayırarak yazın"
                      />
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button 
                onClick={handleUpdateBlog}
                disabled={!blogForm.title || imageUploading}
              >
                Değişiklikleri Kaydet
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Image section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Kapak Görseli</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 relative"
                  disabled={imageUploading}
                >
                  <input
                    type="file"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={handleImageUpload}
                    accept="image/*"
                  />
                  {imageUploading ? "Yükleniyor..." : "Görsel Yükle"}
                  <Upload className="ml-2 h-4 w-4" />
                </Button>
                
                {blogForm.image && (
                  <div className="aspect-video bg-gray-100 overflow-hidden rounded-md">
                    <img 
                      src={blogForm.image} 
                      alt="Cover" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Content markdown editor section */}
      <div className="mt-6">
        <BlogContentEditor 
          content={blogForm.content}
          onChange={handleContentChange}
          onSave={handleContentSave}
          title="İçerik Editörü"
          description="Blog yazınızın içeriğini markdown formatında düzenleyin"
        />
      </div>
    </div>
  );
} 