"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  getBlogById, 
  updateBlog, 
  addContentBlock, 
  removeContentBlock, 
  reorderContentBlocks,
  updateContentBlock 
} from "@/redux/actions/blogActions";
import { useParams, useRouter } from "next/navigation";
import { optimisticUpdate } from "@/redux/reducers/blogReducer";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Label } from "@/app/_components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert";
import { AlertCircle, Check, Trash, Save, Upload, GripVertical, ArrowLeft, Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from "@/app/_components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/_components/ui/select";
import { Checkbox } from "@/app/_components/ui/checkbox";
import { uploadImageToCloudinary } from "../../../../utils/cloudinary";
import { SortableList } from "@/app/_components/ui/sortable-list";
import Link from "next/link";

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentBlog, loading, error, success, message } = useSelector((state) => state.blog);
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [newBlockDialogOpen, setNewBlockDialogOpen] = useState(false);
  const [editBlockDialogOpen, setEditBlockDialogOpen] = useState(false);
  const [currentBlockId, setCurrentBlockId] = useState(null);
  
  // Blog form state
  const [blogForm, setBlogForm] = useState({
    title: "",
    description: "",
    image: "",
    category: "",
    tags: "",
    isPublished: false
  });
  
  // Content block form state
  const [blockForm, setBlockForm] = useState({
    type: "text",
    content: "",
    metadata: {}
  });
  
  useEffect(() => {
    if (params.id) {
      // Fetch blog by ID
      console.log("Fetching blog with ID:", params.id);
      dispatch(getBlogById(params.id));
    }
  }, [dispatch, params.id]);
  
  useEffect(() => {
    if (currentBlog) {
      setBlogForm({
        title: currentBlog.title || "",
        description: currentBlog.description || "",
        image: currentBlog.image || "",
        category: currentBlog.category || "",
        tags: currentBlog.tags ? currentBlog.tags.join(", ") : "",
        isPublished: currentBlog.isPublished || false
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
  
  const handleBlockFormChange = (e) => {
    const { name, value } = e.target;
    
    // For code blocks, automatically add formatting if needed
    if (name === 'content' && blockForm.type === 'code' && !value.startsWith('```')) {
      const language = blockForm.metadata?.language || '';
      const formattedValue = `\`\`\`${language}\n${value}\n\`\`\``;
      setBlockForm({
        ...blockForm,
        content: formattedValue
      });
      return;
    }
    
    setBlockForm({
      ...blockForm,
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
      isPublished: blogForm.isPublished
    };
    
    dispatch(updateBlog(blogData));
  };
  
  const handleAddBlock = (e) => {
    e.preventDefault();
    
    if (!blockForm.content) {
      setAlertType("error");
      setAlertMessage("İçerik alanı boş olamaz");
      setShowAlert(true);
      return;
    }
    
    const newBlock = {
      blogId: currentBlog._id,
      type: blockForm.type,
      content: blockForm.content,
      metadata: blockForm.metadata
    };
    
    dispatch(addContentBlock(newBlock));
    setNewBlockDialogOpen(false);
    resetBlockForm();
  };
  
  const handleUpdateBlock = (e) => {
    e.preventDefault();
    
    if (!blockForm.content) {
      setAlertType("error");
      setAlertMessage("İçerik alanı boş olamaz");
      setShowAlert(true);
      return;
    }
    
    const updatedBlock = {
      blogId: currentBlog._id,
      blockId: currentBlockId,
      type: blockForm.type,
      content: blockForm.content,
      metadata: blockForm.metadata
    };
    
    dispatch(updateContentBlock(updatedBlock));
    setEditBlockDialogOpen(false);
    resetBlockForm();
  };
  
  const handleRemoveBlock = (blockId) => {
    if (window.confirm("Bu içerik bloğunu silmek istediğinize emin misiniz?")) {
      dispatch(removeContentBlock({
        blogId: currentBlog._id,
        blockId
      }));
    }
  };
  
  const handleEditBlock = (block) => {
    setBlockForm({
      type: block.type,
      content: block.content,
      metadata: block.metadata || {}
    });
    setCurrentBlockId(block._id);
    setEditBlockDialogOpen(true);
  };
  
  const resetBlockForm = () => {
    const defaultType = "text";
    setBlockForm({
      type: defaultType,
      content: getPlaceholderForBlockType(defaultType),
      metadata: {}
    });
    setCurrentBlockId(null);
  };
  
  const handleReorderBlocks = (updatedBlocks) => {
    // Optimistic update in UI
    dispatch(
      optimisticUpdate({
        type: 'currentBlog',
        data: {
          ...currentBlog,
          contentBlocks: updatedBlocks
        }
      })
    );
    
    // Prepare data for API
    const blocks = updatedBlocks.map((block, index) => ({
      id: block._id,
      order: index
    }));
    
    // Send to API after UI update
    setTimeout(() => {
      dispatch(reorderContentBlocks({
        blogId: currentBlog._id,
        blocks
      }));
    }, 10);
  };
  
  // Get sorted content blocks
  const sortedContentBlocks = currentBlog?.contentBlocks
    ? [...currentBlog.contentBlocks].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];
  
  // Function to render block content preview based on type
  const renderBlockPreview = (block) => {
    switch (block.type) {
      case 'text':
        return <p className="line-clamp-2">{block.content}</p>;
      
      case 'heading':
        return <h3 className="font-bold line-clamp-1">{block.content.replace(/^#+\s/, '')}</h3>;
      
      case 'image':
        return (
          <div className="h-16 overflow-hidden">
            <img 
              src={block.content} 
              alt={block.metadata?.alt || 'Image content'} 
              className="h-full object-cover" 
            />
          </div>
        );
      
      case 'code':
        return (
          <div className="bg-gray-100 p-1 rounded">
            <div className="text-xs text-gray-500">{block.metadata?.language || 'code'}</div>
            <code className="text-xs line-clamp-2">{block.content.replace(/```[\s\S]*\n([\s\S]*)\n```/, '$1')}</code>
          </div>
        );
      
      case 'quote':
        return (
          <blockquote className="border-l-2 pl-2 italic line-clamp-2">
            {block.content.replace(/^>\s*/, '')}
          </blockquote>
        );
      
      case 'unordered-list':
        return (
          <div className="line-clamp-2">
            <span className="font-semibold">Sırasız Liste: </span>
            {block.content.split('\n').slice(0, 2).map((item, i) => 
              <span key={i} className="text-sm">{item.replace(/^\*\s/, '•')} </span>
            )}
            {block.content.split('\n').length > 2 && <span className="text-xs text-gray-500">...</span>}
          </div>
        );
      
      case 'ordered-list':
        return (
          <div className="line-clamp-2">
            <span className="font-semibold">Sıralı Liste: </span>
            {block.content.split('\n').slice(0, 2).map((item, i) => 
              <span key={i} className="text-sm">{item.replace(/^\d+\.\s/, `${i+1}. `)} </span>
            )}
            {block.content.split('\n').length > 2 && <span className="text-xs text-gray-500">...</span>}
          </div>
        );
      
      case 'link':
        const linkMatch = block.content.match(/\[(.*?)\]\((.*?)\)/);
        const linkText = linkMatch ? linkMatch[1] : 'Bağlantı';
        const linkUrl = linkMatch ? linkMatch[2] : '#';
        return (
          <div className="line-clamp-1">
            <span className="font-semibold">Bağlantı: </span>
            <a href={linkUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              {linkText}
            </a>
          </div>
        );
      
      case 'emphasis':
        return (
          <div className="line-clamp-2">
            <span className="font-semibold">Vurgu: </span>
            <span dangerouslySetInnerHTML={{ 
              __html: block.content
                .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
            }} />
          </div>
        );
      
      case 'table':
        return (
          <div className="line-clamp-2">
            <span className="font-semibold">Tablo: </span>
            <span className="text-xs text-gray-500">[Tablo içeriği]</span>
          </div>
        );
      
      default:
        return <p className="line-clamp-2">{block.content}</p>;
    }
  };
  
  // Block type options
  const blockTypes = [
    { value: "text", label: "Metin" },
    { value: "heading", label: "Başlık" },
    { value: "image", label: "Görsel" },
    { value: "code", label: "Kod" },
    { value: "quote", label: "Alıntı" },
    { value: "unordered-list", label: "Sırasız Liste" },
    { value: "ordered-list", label: "Sıralı Liste" },
    { value: "link", label: "Bağlantı" },
    { value: "emphasis", label: "Vurgu / İtalik" },
    { value: "table", label: "Tablo" }
  ];
  
  // Helper function to get placeholder based on block type
  const getPlaceholderForBlockType = (type) => {
    switch (type) {
      case 'text':
        return "Metninizi buraya yazın...";
      case 'heading':
        return "## Başlık metni";
      case 'code':
        return "```javascript\n// Kod bloğu örneği\nconst x = 5;\nconsole.log(x);\n```";
      case 'quote':
        return "> Alıntı metni buraya yazın. - Yazar Adı";
      case 'unordered-list':
        return "* İlk madde\n* İkinci madde\n* Üçüncü madde";
      case 'ordered-list':
        return "1. İlk madde\n2. İkinci madde\n3. Üçüncü madde";
      case 'link':
        return "[Bağlantı adı](https://örnek.com)";
      case 'emphasis':
        return "*İtalik metin* veya **Kalın metin** veya ***Kalın italik metin***";
      case 'table':
        return "| Başlık 1 | Başlık 2 |\n| --------- | --------- |\n| Hücre 1  | Hücre 2  |\n| Hücre 3  | Hücre 4  |";
      default:
        return "İçeriği buraya yazın...";
    }
  };
  
  // Helper function to get default metadata for block type
  const getDefaultMetadataForBlockType = (type) => {
    switch (type) {
      case 'code':
        return { language: 'javascript' };
      case 'image':
        return { alt: 'Görsel açıklaması' };
      case 'heading':
        return { level: 2 };
      default:
        return {};
    }
  };
  
  // Updated handleTypeChange function
  const handleTypeChange = (value) => {
    // Get template content for the selected type
    const templateContent = getPlaceholderForBlockType(value);
    const defaultMetadata = getDefaultMetadataForBlockType(value);
    
    // Update form with the new type, template content and default metadata
    setBlockForm({
      ...blockForm,
      type: value,
      content: templateContent,
      metadata: {
        ...blockForm.metadata,
        ...defaultMetadata
      }
    });
  };
  
  // Updated image upload for content blocks
  const handleContentImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setImageUploading(true);
      const uploadedUrl = await uploadImageToCloudinary(file);
      
      setBlockForm({
        ...blockForm,
        content: uploadedUrl,
        metadata: {
          ...blockForm.metadata,
          alt: file.name.split('.')[0] || 'Görsel'
        }
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
  
  // Dynamic form content based on block type
  const renderBlockFormContent = () => {
    switch (blockForm.type) {
      case 'image':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="imageUrl">Görsel URL'si</Label>
                <Input
                  id="imageUrl"
                  name="content"
                  value={blockForm.content}
                  onChange={handleBlockFormChange}
                  placeholder="Görsel URL'si"
                />
              </div>
              <div>
                <Label htmlFor="imageAlt">Alternatif Metin</Label>
                <Input
                  id="imageAlt"
                  value={blockForm.metadata?.alt || ''}
                  onChange={(e) => setBlockForm({
                    ...blockForm,
                    metadata: { ...blockForm.metadata, alt: e.target.value }
                  })}
                  placeholder="Görsel açıklaması"
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 relative"
                disabled={imageUploading}
              >
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={handleContentImageUpload}
                  accept="image/*"
                />
                {imageUploading ? "Yükleniyor..." : "Görsel Yükle"}
                <Upload className="ml-2 h-4 w-4" />
              </Button>
              
              {blockForm.content && (
                <div className="h-48 bg-gray-100 rounded overflow-hidden">
                  <img
                    src={blockForm.content}
                    alt={blockForm.metadata?.alt || 'Preview'}
                    className="w-full h-full object-contain"
                    onError={(e) => e.target.src = "https://via.placeholder.com/300?text=Invalid+Image+URL"}
                  />
                </div>
              )}
            </div>
          </div>
        );
        
      case 'heading':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="content">Başlık İçeriği</Label>
                <Select 
                  value={blockForm.metadata?.level?.toString() || '2'} 
                  onValueChange={(value) => setBlockForm({
                    ...blockForm,
                    metadata: { ...blockForm.metadata, level: parseInt(value) }
                  })}
                >
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Başlık Seviyesi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">H1 (Büyük)</SelectItem>
                    <SelectItem value="2">H2 (Orta)</SelectItem>
                    <SelectItem value="3">H3 (Küçük)</SelectItem>
                    <SelectItem value="4">H4 (Mini)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea
                id="content"
                name="content"
                value={blockForm.content.replace(/^#+\s/, '')}
                onChange={(e) => {
                  const level = blockForm.metadata?.level || 2;
                  const prefix = '#'.repeat(level) + ' ';
                  setBlockForm({
                    ...blockForm,
                    content: prefix + e.target.value
                  });
                }}
                placeholder="Başlık metni"
                rows={2}
              />
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <div className="text-xs text-gray-500 mb-1">Preview:</div>
                <div className={`${
                  blockForm.metadata?.level === 1 ? 'text-2xl font-bold' :
                  blockForm.metadata?.level === 2 ? 'text-xl font-bold' :
                  blockForm.metadata?.level === 3 ? 'text-lg font-bold' :
                  'text-base font-bold'
                }`}>
                  {blockForm.content.replace(/^#+\s/, '')}
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'code':
        return (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="language">Programlama Dili</Label>
                <div className="text-xs text-gray-500">
                  <a href="https://www.markdownguide.org/extended-syntax/#syntax-highlighting" target="_blank" rel="noopener noreferrer" className="underline">
                    Dil Listesi
                  </a>
                </div>
              </div>
              <Input
                id="language"
                value={blockForm.metadata?.language || ''}
                onChange={(e) => {
                  const newLanguage = e.target.value;
                  setBlockForm({
                    ...blockForm,
                    metadata: { ...blockForm.metadata, language: newLanguage },
                    content: blockForm.content.replace(/```.*\n/, `\`\`\`${newLanguage}\n`)
                  });
                }}
                placeholder="javascript, python, css, vb."
              />
            </div>
            
            <div>
              <Label htmlFor="content">Kod İçeriği</Label>
              <Textarea
                id="content"
                name="content"
                value={blockForm.content.replace(/```.*\n|\n```$/g, '')}
                onChange={(e) => {
                  const language = blockForm.metadata?.language || '';
                  setBlockForm({
                    ...blockForm,
                    content: `\`\`\`${language}\n${e.target.value}\n\`\`\``
                  });
                }}
                className="font-mono"
                placeholder="Kod bloğu içeriği"
                rows={10}
              />
            </div>
          </div>
        );
        
      case 'quote':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="content">Alıntı İçeriği</Label>
              <Textarea
                id="content"
                name="content"
                value={blockForm.content.replace(/^>\s?/, '')}
                onChange={(e) => {
                  setBlockForm({
                    ...blockForm,
                    content: `> ${e.target.value}`
                  });
                }}
                placeholder="Alıntı metni buraya yazın"
                rows={5}
              />
              <div className="mt-2 p-3 bg-gray-50 rounded-md">
                <div className="text-xs text-gray-500 mb-1">Preview:</div>
                <blockquote className="pl-3 border-l-2 border-gray-300 italic">
                  {blockForm.content.replace(/^>\s?/, '')}
                </blockquote>
              </div>
            </div>
            <div>
              <Label htmlFor="author">Yazar (İsteğe Bağlı)</Label>
              <Input
                id="author"
                value={blockForm.metadata?.author || ''}
                onChange={(e) => setBlockForm({
                  ...blockForm,
                  metadata: { ...blockForm.metadata, author: e.target.value }
                })}
                placeholder="Alıntı yazarı"
              />
            </div>
          </div>
        );
      
      // For other types, use a common markdown editor
      default:
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Markdown İçeriği</Label>
              <div className="text-xs text-gray-500">
                <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noopener noreferrer" className="underline">
                  Markdown Rehberi
                </a>
              </div>
            </div>
            <Textarea
              id="content"
              name="content"
              value={blockForm.content}
              onChange={handleBlockFormChange}
              className={`${blockForm.type === "code" ? "font-mono" : ""}`}
              placeholder={getPlaceholderForBlockType(blockForm.type)}
              rows={10}
            />
          </div>
        );
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
      
      {/* Content blocks section */}
      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>İçerik Blokları</CardTitle>
              <CardDescription>
                Blog yazınızın içerik bloklarını düzenleyin
              </CardDescription>
            </div>
            
            <Dialog open={newBlockDialogOpen} onOpenChange={setNewBlockDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" /> Blok Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>Yeni İçerik Bloğu</DialogTitle>
                  <DialogDescription>
                    Blog yazınıza yeni bir içerik bloğu ekleyin
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddBlock}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Blok Tipi</Label>
                      <Select 
                        value={blockForm.type} 
                        onValueChange={handleTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Blok tipini seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {blockTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content">İçerik</Label>
                      {renderBlockFormContent()}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setNewBlockDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button type="submit" disabled={!blockForm.content}>
                      Blok Ekle
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
            
            <Dialog open={editBlockDialogOpen} onOpenChange={setEditBlockDialogOpen}>
              <DialogContent className="max-w-3xl">
                <DialogHeader>
                  <DialogTitle>İçerik Bloğunu Düzenle</DialogTitle>
                  <DialogDescription>
                    Seçilen içerik bloğunu düzenleyin
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleUpdateBlock}>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="type">Blok Tipi</Label>
                      <Select 
                        value={blockForm.type} 
                        onValueChange={handleTypeChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Blok tipini seçin" />
                        </SelectTrigger>
                        <SelectContent>
                          {blockTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="content">İçerik</Label>
                      {renderBlockFormContent()}
                    </div>
                  </div>
                  
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setEditBlockDialogOpen(false)}>
                      İptal
                    </Button>
                    <Button type="submit" disabled={!blockForm.content}>
                      Güncelle
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </CardHeader>
          
          <CardContent>
            {sortedContentBlocks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-lg">
                <p className="text-gray-500 mb-4">Henüz hiç içerik bloğu bulunmuyor</p>
                <Button onClick={() => setNewBlockDialogOpen(true)}>İlk Bloğu Ekle</Button>
              </div>
            ) : (
              <div className="space-y-4">
                <SortableList
                  items={sortedContentBlocks}
                  onChange={handleReorderBlocks}
                  renderItem={(block) => (
                    <div className="flex items-center gap-2 p-3 bg-white border rounded-md shadow-sm">
                      <div className="cursor-move">
                        <GripVertical size={20} className="text-gray-400" />
                      </div>
                      
                      <div className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs uppercase">
                        {block.type}
                      </div>
                      
                      <div className="flex-1">
                        {renderBlockPreview(block)}
                      </div>
                      
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditBlock(block)}
                        >
                          Düzenle
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => handleRemoveBlock(block._id)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </div>
                  )}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 