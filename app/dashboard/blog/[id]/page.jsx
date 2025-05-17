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
  Heading1, 
  Heading2, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link2, 
  Image as ImageIcon, 
  Code, 
  Quote, 
  Table, 
  UploadCloud,
  Loader2
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
import { Checkbox } from "@/app/_components/ui/checkbox";
import { uploadImageToCloudinary } from "../../../../utils/cloudinary";
import Link from "next/link";

// Simple markdown preview component
const MarkdownPreview = ({ content }) => {
  // Convert markdown to HTML (basic implementation)
  const renderMarkdown = (text) => {
    if (!text) return "";
    let html = text
      // Headers
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold my-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold my-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold my-2">$1</h3>')
      // Bold and Italic
      .replace(/\*\*\*(.*)\*\*\*/gm, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gm, '<em>$1</em>')
      // Lists
      .replace(/^\- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
      // Quote
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-2">$1</blockquote>')
      // Code
      .replace(/```(.+)?\n([\s\S]*?)\n```/gm, '<pre class="bg-gray-100 p-4 rounded my-4"><code>$2</code></pre>')
      .replace(/`([^`]+)`/gm, '<code class="bg-gray-100 px-1 rounded">$1</code>')
      // Images
      .replace(/!\[(.*?)\]\((.*?)\)/gm, '<img src="$2" alt="$1" class="my-4 max-w-full h-auto rounded">')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gm, '<a href="$2" class="text-blue-500 underline">$1</a>')
      // Table parsing (basic)
      .replace(/\|(.+)\|(.+)\|/gm, '<tr><td>$1</td><td>$2</td></tr>')
      // Paragraphs
      .replace(/^(?!<h|<li|<blockquote|<pre|<code|<img|<a|<ul|<ol|<p|<tr)(.*$)/gm, '<p class="my-2">$1</p>');
    
    // Replace consecutive list items with a list
    html = html
      .replace(/<li class="ml-4">.*?<\/li>(\s*<li class="ml-4">.*?<\/li>)+/gs, (match) => {
        return '<ul class="list-disc my-2 ml-6">' + match + '</ul>';
      })
      .replace(/<li class="ml-4 list-decimal">.*?<\/li>(\s*<li class="ml-4 list-decimal">.*?<\/li>)+/gs, (match) => {
        return '<ol class="list-decimal my-2 ml-6">' + match + '</ol>';
      });
    
    return html;
  };

  return (
    <div 
      className="prose prose-sm max-w-none overflow-auto bg-white p-4 rounded-md border min-h-[300px]"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

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
    isPublished: false,
    content: ""
  });
  
  // Markdown editor state
  const [markdownEditorTab, setMarkdownEditorTab] = useState("edit");
  
  // Image upload dialog state
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const imageUploadRef = useRef(null);
  
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
        isPublished: currentBlog.isPublished || false,
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
    const { name, value, type, checked } = e.target;
    setBlogForm({
      ...blogForm,
      [name]: type === 'checkbox' ? checked : value
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
      isPublished: blogForm.isPublished,
      markdownContent: blogForm.content // Save content to markdownContent field
    };
    
    dispatch(updateBlog(blogData));
  };
  
  // Insert markdown syntax at cursor position or replace selected text
  const insertMarkdown = (syntax, placeholder) => {
    const textarea = document.getElementById('blogContent');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = blogForm.content.substring(start, end);
    const beforeText = blogForm.content.substring(0, start);
    const afterText = blogForm.content.substring(end);
    
    let newText;
    if (selectedText) {
      // If text is selected, wrap it with the syntax
      newText = `${beforeText}${syntax.replace('$1', selectedText)}${afterText}`;
    } else {
      // If no text is selected, insert syntax with placeholder
      newText = `${beforeText}${syntax.replace('$1', placeholder)}${afterText}`;
    }
    
    setBlogForm(prev => ({
      ...prev,
      content: newText
    }));
    
    // Set focus back to textarea and position cursor appropriately
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + (placeholder ? start === end ? syntax.indexOf('$1') + placeholder.length : selectedText.length : syntax.length);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };
  
  // Handle file selection for image dialog
  const handleImageFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedImage(null);
      setImagePreview("");
      return;
    }
    
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle image upload from dialog
  const handleContentImageUpload = async () => {
    if (!selectedImage) return;
    
    setImageUploadLoading(true);
    
    try {
      const uploadedUrl = await uploadImageToCloudinary(selectedImage);
      
      // Insert the image URL into the markdown content
      insertMarkdown('![$1](' + uploadedUrl + ')', 'Image description');
      
      // Close the dialog
      setIsImageDialogOpen(false);
      setSelectedImage(null);
      setImagePreview("");
      
      setAlertType("success");
      setAlertMessage("Görsel yüklendi ve eklendi");
      setShowAlert(true);
    } catch (error) {
      console.error('Image upload error:', error);
      setAlertType("error");
      setAlertMessage("Görsel yüklenemedi. Lütfen tekrar deneyin.");
      setShowAlert(true);
    } finally {
      setImageUploadLoading(false);
    }
  };
  
  // Open file picker dialog when clicking Browse button
  const triggerImageFilePicker = () => {
    if (imageUploadRef.current) {
      imageUploadRef.current.click();
    }
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
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isPublished" 
                      name="isPublished"
                      checked={blogForm.isPublished}
                      onCheckedChange={(checked) => 
                        setBlogForm({...blogForm, isPublished: checked})
                      }
                    />
                    <Label htmlFor="isPublished">Yayında</Label>
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
        <Card>
          <CardHeader>
            <CardTitle>İçerik Editörü</CardTitle>
            <CardDescription>
              Blog yazınızın içeriğini markdown formatında düzenleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <div className="bg-gray-50 p-2 border-b flex flex-wrap gap-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('# $1', 'Başlık')}
                  title="Büyük Başlık"
                >
                  <Heading1 size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('## $1', 'Alt Başlık')}
                  title="Orta Başlık"
                >
                  <Heading2 size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('**$1**', 'Kalın Metin')}
                  title="Kalın"
                >
                  <Bold size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('*$1*', 'İtalik Metin')}
                  title="İtalik"
                >
                  <Italic size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('* $1', 'Liste maddesi')}
                  title="Sırasız Liste"
                >
                  <List size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('1. $1', 'Liste maddesi')}
                  title="Sıralı Liste"
                >
                  <ListOrdered size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('[$1](https://ornek.com)', 'Bağlantı Metni')}
                  title="Bağlantı"
                >
                  <Link2 size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsImageDialogOpen(true)}
                  title="Görsel Ekle"
                >
                  <ImageIcon size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('```\n$1\n```', 'kod örneği')}
                  title="Kod Bloğu"
                >
                  <Code size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('> $1', 'Alıntı metni')}
                  title="Alıntı"
                >
                  <Quote size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('| Başlık 1 | Başlık 2 |\n| --------- | --------- |\n| Hücre 1  | Hücre 2  |\n| Hücre 3  | Hücre 4  |', '')}
                  title="Tablo"
                >
                  <Table size={16} />
                </Button>
              </div>
              
              <Tabs 
                value={markdownEditorTab} 
                onValueChange={setMarkdownEditorTab} 
                className="w-full"
              >
                <TabsList className="w-full justify-start border-b rounded-none bg-gray-50">
                  <TabsTrigger value="edit">Düzenle</TabsTrigger>
                  <TabsTrigger value="preview">Önizleme</TabsTrigger>
                </TabsList>
                
                <TabsContent value="edit" className="m-0">
                  <Textarea
                    id="blogContent"
                    name="content"
                    value={blogForm.content}
                    onChange={handleFormChange}
                    className="min-h-[400px] border-0 rounded-none font-mono resize-y"
                    placeholder="Blog içeriğini markdown formatında yazın..."
                  />
                </TabsContent>
                
                <TabsContent value="preview" className="m-0">
                  <MarkdownPreview content={blogForm.content} />
                </TabsContent>
              </Tabs>
            </div>
            <p className="text-sm text-gray-500 mt-2">
              İçeriği formatlamak için markdown kullanın. Başlıklar (#), listeler (*, 1.), bağlantılar ([metin](url)) ve görseller (![açıklama](url)) ekleyebilirsiniz.
            </p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleUpdateBlog}>
              Değişiklikleri Kaydet
            </Button>
          </CardFooter>
        </Card>
      </div>
      
      {/* Image upload dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Görsel Yükle</DialogTitle>
            <DialogDescription>
              İçeriğe eklemek için bir görsel yükleyin. Görsel imleç konumunda eklenecektir.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={triggerImageFilePicker}
              >
                <input
                  ref={imageUploadRef}
                  type="file"
                  className="hidden"
                  onChange={handleImageFileSelect}
                  accept="image/*"
                />
                {imagePreview ? (
                  <div className="relative w-full">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="mx-auto max-h-[200px] object-contain" 
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 mx-auto flex items-center"
                      onClick={triggerImageFilePicker}
                    >
                      Görseli Değiştir
                    </Button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Görsel seçmek için tıklayın
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsImageDialogOpen(false);
                setSelectedImage(null);
                setImagePreview("");
              }}
            >
              İptal
            </Button>
            <Button 
              onClick={handleContentImageUpload}
              disabled={!selectedImage || imageUploadLoading}
            >
              {imageUploadLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yükleniyor...
                </>
              ) : 'Yükle ve Ekle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 