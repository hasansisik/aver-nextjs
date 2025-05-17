"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  getProjectById, 
  updateProject, 
  addContentBlock, 
  removeContentBlock, 
  reorderContentBlocks,
  updateContentBlock 
} from "@/redux/actions/projectActions";
import { useParams, useRouter } from "next/navigation";
import { optimisticUpdate } from "@/redux/reducers/projectReducer";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import ProjectContentEditor from "@/app/dashboard/_components/ProjectContentEditor";

export default function ProjectEditPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentProject, loading, error, success, message } = useSelector((state) => state.project);
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [newBlockDialogOpen, setNewBlockDialogOpen] = useState(false);
  const [editBlockDialogOpen, setEditBlockDialogOpen] = useState(false);
  const [currentBlockId, setCurrentBlockId] = useState(null);
  
  // Project form state
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    date: "",
    image: "",
    category: "",
    color: "#000000",
    projectInfo: [],
    isPublished: false
  });
  
  // Content block form state
  const [blockForm, setBlockForm] = useState({
    type: "text",
    content: "",
    metadata: {}
  });
  
  // Add new state variables for image grid uploads
  const [gridImagesUploading, setGridImagesUploading] = useState(false);
  const [gridUploadedImages, setGridUploadedImages] = useState([]);
  
  // Block type options
  const blockTypes = [
    { value: "text", label: "Metin" },
    { value: "heading", label: "Başlık" },
    { value: "image", label: "Tekli Görsel" },
    { value: "image-grid-2", label: "2'li Görsel Grid" },
    { value: "image-grid-4", label: "4'lü Görsel Grid" },
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
      case 'image':
        return "![Görsel açıklaması](/images/project/sample.jpg)";
      case 'image-grid-2':
        return '<div class="image columns-1 sm:columns-2 gap-8">\n\n![Görsel 1 açıklaması](/images/project/sample1.jpg)\n![Görsel 2 açıklaması](/images/project/sample2.jpg)\n</div>';
      case 'image-grid-4':
        return '<div class="image columns-1 sm:columns-2 gap-8">\n\n![Görsel 1 açıklaması](/images/project/sample1.jpg)\n![Görsel 2 açıklaması](/images/project/sample2.jpg)\n![Görsel 3 açıklaması](/images/project/sample3.jpg)\n![Görsel 4 açıklaması](/images/project/sample4.jpg)\n</div>';
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
    
    // Reset grid uploaded images when changing type
    if (value !== 'image-grid-2' && value !== 'image-grid-4') {
      setGridUploadedImages([]);
    }
    
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
  
  // New function to handle grid image uploads
  const handleGridImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    try {
      setGridImagesUploading(true);
      const uploadedUrl = await uploadImageToCloudinary(file);
      const altText = file.name.split('.')[0] || `Görsel ${gridUploadedImages.length + 1}`;
      
      // Add the new image to the uploaded images list
      const newImage = { url: uploadedUrl, alt: altText };
      const updatedImages = [...gridUploadedImages, newImage];
      setGridUploadedImages(updatedImages);
      
      // Update the content with the new image
      let currentContent = blockForm.content;
      
      // If this is the first image, replace the template content
      if (gridUploadedImages.length === 0) {
        // Start with the div wrapper
        if (blockForm.type === 'image-grid-2') {
          currentContent = '<div class="image columns-1 sm:columns-2 gap-8">\n\n';
        } else { // image-grid-4
          currentContent = '<div class="image columns-1 sm:columns-2 gap-8">\n\n';
        }
      } else {
        // Remove the closing div if it exists
        currentContent = currentContent.replace('\n</div>', '');
      }
      
      // Add the new image markdown
      currentContent += `![${altText}](${uploadedUrl})\n`;
      
      // Add closing div
      currentContent += '\n</div>';
      
      // Update the form content
      setBlockForm({
        ...blockForm,
        content: currentContent
      });
      
      setAlertType("success");
      setAlertMessage("Görsel başarıyla eklendi");
      setShowAlert(true);
    } catch (error) {
      setAlertType("error");
      setAlertMessage(`Görsel yüklenirken hata oluştu: ${error.message}`);
      setShowAlert(true);
    } finally {
      setGridImagesUploading(false);
    }
  };
  
  useEffect(() => {
    if (params.id) {
      // Fetch project by ID
      console.log("Fetching project with ID:", params.id);
      dispatch(getProjectById(params.id));
    }
  }, [dispatch, params.id]);
  
  useEffect(() => {
    if (currentProject) {
      setProjectForm({
        title: currentProject.title || "",
        description: currentProject.description || "",
        date: currentProject.date || new Date().toISOString().split('T')[0],
        image: currentProject.image || "",
        category: currentProject.category || "",
        color: currentProject.color || "#000000",
        projectInfo: currentProject.projectInfo || [],
        isPublished: currentProject.isPublished || false
      });
    }
  }, [currentProject]);
  
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
      
      setProjectForm({
        ...projectForm,
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
    setProjectForm({
      ...projectForm,
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
  
  const handleProjectInfoChange = (index, field, value) => {
    const updatedProjectInfo = [...projectForm.projectInfo];
    updatedProjectInfo[index] = {
      ...updatedProjectInfo[index],
      [field]: value
    };
    
    setProjectForm({
      ...projectForm,
      projectInfo: updatedProjectInfo
    });
  };
  
  const handleAddProjectInfo = () => {
    setProjectForm({
      ...projectForm,
      projectInfo: [
        ...projectForm.projectInfo,
        { title: "", data: "" }
      ]
    });
  };
  
  const handleRemoveProjectInfo = (index) => {
    const updatedProjectInfo = [...projectForm.projectInfo];
    updatedProjectInfo.splice(index, 1);
    
    setProjectForm({
      ...projectForm,
      projectInfo: updatedProjectInfo
    });
  };
  
  const handleUpdateProject = (e) => {
    e.preventDefault();
    
    // Filter out empty project info items
    const filteredProjectInfo = projectForm.projectInfo.filter(
      item => item.title.trim() !== '' && item.data.trim() !== ''
    );
    
    const projectData = {
      projectId: currentProject._id,
      title: projectForm.title,
      description: projectForm.description,
      image: projectForm.image,
      category: projectForm.category,
      color: projectForm.color,
      projectInfo: filteredProjectInfo,
      isPublished: projectForm.isPublished
    };
    
    dispatch(updateProject(projectData));
  };
  
  const handlePublishToggle = () => {
    const updatedPublishState = !projectForm.isPublished;
    
    setProjectForm({
      ...projectForm,
      isPublished: updatedPublishState
    });
    
    dispatch(updateProject({
      projectId: params.id,
      isPublished: updatedPublishState
    }));
  };
  
  const handleAddBlock = (e) => {
    e.preventDefault();
    
    if (!blockForm.content) {
      setAlertType("error");
      setAlertMessage("İçerik alanı boş olamaz");
      setShowAlert(true);
      return;
    }
    
    // Create block data
    let newBlock = {
      projectId: currentProject._id,
      content: blockForm.content,
      metadata: blockForm.metadata || {}
    };
    
    // Handle special grid types - convert to standard "image" type for server
    if (blockForm.type === 'image-grid-2' || blockForm.type === 'image-grid-4') {
      // Store original type in metadata for reference
      newBlock.type = "image";
      newBlock.metadata = {
        ...newBlock.metadata,
        layoutType: blockForm.type
      };
    } else {
      newBlock.type = blockForm.type;
    }
    
    // Dispatch action
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
    
    // Create block data
    let updatedBlock = {
      projectId: currentProject._id,
      blockId: currentBlockId,
      content: blockForm.content,
      metadata: blockForm.metadata || {}
    };
    
    // Handle special grid types - convert to standard "image" type for server
    if (blockForm.type === 'image-grid-2' || blockForm.type === 'image-grid-4') {
      // Store original type in metadata for reference
      updatedBlock.type = "image";
      updatedBlock.metadata = {
        ...updatedBlock.metadata,
        layoutType: blockForm.type
      };
    } else {
      updatedBlock.type = blockForm.type;
    }
    
    // Dispatch action
    dispatch(updateContentBlock(updatedBlock));
    setEditBlockDialogOpen(false);
    resetBlockForm();
  };
  
  const handleRemoveBlock = (blockId) => {
    if (window.confirm("Bu içerik bloğunu silmek istediğinize emin misiniz?")) {
      dispatch(removeContentBlock({
        projectId: currentProject._id,
        blockId
      }));
    }
  };
  
  const handleEditBlock = (block) => {
    // Detect if this is a grid layout stored as an image type
    let blockType = block.type;
    if (block.type === "image" && block.metadata?.layoutType) {
      blockType = block.metadata.layoutType;
    }
    
    setBlockForm({
      type: blockType,
      content: block.content,
      metadata: block.metadata || {}
    });
    
    // Extract uploaded images from content for grid blocks
    if (blockType === 'image-grid-2' || blockType === 'image-grid-4') {
      // Extract images from markdown
      const imgRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
      const extractedImages = [];
      let match;
      
      while ((match = imgRegex.exec(block.content)) !== null) {
        extractedImages.push({
          alt: match[1] || `Görsel ${extractedImages.length + 1}`,
          url: match[2]
        });
      }
      
      setGridUploadedImages(extractedImages);
    } else {
      // Reset grid uploaded images for non-grid blocks
      setGridUploadedImages([]);
    }
    
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
    setGridUploadedImages([]);
  };
  
  const handleReorderBlocks = (updatedBlocks) => {
    // Optimistic update in UI
    dispatch(
      optimisticUpdate({
        type: 'currentProject',
        data: {
          ...currentProject,
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
        projectId: currentProject._id,
        blocks
      }));
    }, 10);
  };
  
  // Get sorted content blocks
  const sortedContentBlocks = currentProject?.contentBlocks
    ? [...currentProject.contentBlocks].sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];
  
  // Function to render block content preview based on type
  const renderBlockPreview = (block) => {
    // Get the correct type to display
    let displayType = block.type;
    if (block.type === "image" && block.metadata?.layoutType) {
      displayType = block.metadata.layoutType;
    }
    
    switch (displayType) {
      case 'text':
        return <p className="line-clamp-2">{block.content}</p>;
      
      case 'heading':
        return <h3 className="font-bold line-clamp-1">{block.content.replace(/^#+\s/, '')}</h3>;
      
      case 'image':
        // Check if there's a valid image URL
        const imageUrl = block.content.match(/\(([^)]+)\)/)?.[1];
        if (!imageUrl || imageUrl === '') {
          return <p className="text-gray-400 italic">Görsel yüklenmemiş</p>;
        }
        
        return (
          <div className="h-16 overflow-hidden">
            <img 
              src={imageUrl} 
              alt={block.metadata?.alt || block.content.match(/\[([^\]]+)\]/)?.[1] || 'Image'} 
              className="h-full object-cover" 
            />
          </div>
        );
      
      case 'image-grid-2':
        // Count actual images that have URLs
        const imageMatches2 = [...block.content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)];
        const validImages2 = imageMatches2.filter(match => match[1] && match[1].trim() !== '');
        if (validImages2.length === 0) {
          return <p className="text-gray-400 italic">Görsel yüklenmemiş</p>;
        }
        
        return (
          <div className="flex space-x-1">
            <div className="text-xs bg-gray-100 p-1 rounded">2'li Görsel Grid</div>
            <span className="text-xs text-gray-500">{validImages2.length} görsel</span>
          </div>
        );
        
      case 'image-grid-4':
        // Count actual images that have URLs
        const imageMatches4 = [...block.content.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)];
        const validImages4 = imageMatches4.filter(match => match[1] && match[1].trim() !== '');
        if (validImages4.length === 0) {
          return <p className="text-gray-400 italic">Görsel yüklenmemiş</p>;
        }
        
        return (
          <div className="flex space-x-1">
            <div className="text-xs bg-gray-100 p-1 rounded">4'lü Görsel Grid</div>
            <span className="text-xs text-gray-500">{validImages4.length} görsel</span>
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
  
  // Dynamic form content based on block type
  const renderBlockFormContent = () => {
    switch (blockForm.type) {
      case 'image':
      case 'image-grid-2':
      case 'image-grid-4':
        return (
          <div className="space-y-4">
            {blockForm.type === 'image' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="imageUrl">Görsel URL'si</Label>
                  <Input
                    id="imageUrl"
                    name="content"
                    value={blockForm.content.match(/\(([^)]+)\)/)?.[1] || ''}
                    onChange={(e) => {
                      const altText = blockForm.content.match(/\[([^\]]+)\]/)?.[1] || 'Görsel açıklaması';
                      setBlockForm({
                        ...blockForm,
                        content: `![${altText}](${e.target.value})`
                      });
                    }}
                    placeholder="Görsel URL'si"
                  />
                </div>
                <div>
                  <Label htmlFor="imageAlt">Alternatif Metin</Label>
                  <Input
                    id="imageAlt"
                    value={blockForm.content.match(/\[([^\]]+)\]/)?.[1] || ''}
                    onChange={(e) => {
                      const imageUrl = blockForm.content.match(/\(([^)]+)\)/)?.[1] || '';
                      setBlockForm({
                        ...blockForm,
                        content: `![${e.target.value}](${imageUrl})`
                      });
                    }}
                    placeholder="Görsel açıklaması"
                  />
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Markdown Görsel Bloğu ({blockForm.type === 'image-grid-2' ? '2\'li' : '4\'lü'} Grid)</Label>
                  {gridUploadedImages.length > 0 && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={resetGridImages}
                    >
                      Görselleri Temizle
                    </Button>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md mb-4">
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">Yüklenen Görseller: {gridUploadedImages.length}</p>
                      <p className="text-xs text-gray-500">
                        {blockForm.type === 'image-grid-2' ? 'Önerilen: 2 görsel' : 'Önerilen: 4 görsel'}
                      </p>
                    </div>
                    
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-10 relative"
                      disabled={gridImagesUploading}
                    >
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleGridImageUpload}
                        accept="image/*"
                      />
                      {gridImagesUploading ? "Yükleniyor..." : "Görsel Ekle"}
                      <Upload className="ml-2 h-4 w-4" />
                    </Button>
                    
                    {gridUploadedImages.length > 0 && (
                      <div className={`grid ${blockForm.type === 'image-grid-2' ? 'grid-cols-2' : 'grid-cols-2 md:grid-cols-4'} gap-2`}>
                        {gridUploadedImages.map((img, idx) => (
                          <div key={idx} className="relative aspect-square bg-gray-100 rounded overflow-hidden">
                            <img
                              src={img.url}
                              alt={img.alt}
                              className="w-full h-full object-cover"
                              onError={(e) => e.target.src = "https://via.placeholder.com/300?text=Invalid+Image"}
                            />
                            <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 truncate">
                              {img.alt}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <Textarea
                  id="content"
                  name="content"
                  value={blockForm.content}
                  onChange={handleBlockFormChange}
                  rows={10}
                  placeholder={getPlaceholderForBlockType(blockForm.type)}
                  className="font-mono text-xs"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Görselleri eklemek için yukarıdaki "Görsel Ekle" butonunu kullanabilir veya markdown kodunu düzenleyebilirsiniz.
                </p>
              </div>
            )}
            
            {blockForm.type === 'image' && (
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
                
                {blockForm.content && blockForm.content.match(/\(([^)]+)\)/) && (
                  <div className="h-48 bg-gray-100 rounded overflow-hidden">
                    <img
                      src={blockForm.content.match(/\(([^)]+)\)/)[1]}
                      alt={blockForm.content.match(/\[([^\]]+)\]/) ? blockForm.content.match(/\[([^\]]+)\]/)[1] : 'Preview'}
                      className="w-full h-full object-contain"
                      onError={(e) => e.target.src = "https://via.placeholder.com/300?text=Invalid+Image+URL"}
                    />
                  </div>
                )}
              </div>
            )}
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
  
  // New function to reset grid
  const resetGridImages = () => {
    setGridUploadedImages([]);
    const templateContent = getPlaceholderForBlockType(blockForm.type);
    setBlockForm({
      ...blockForm,
      content: templateContent
    });
  };
  
  // Add an effect to reset the block form when opening the dialog
  useEffect(() => {
    if (newBlockDialogOpen) {
      resetBlockForm();
    }
  }, [newBlockDialogOpen]);
  
  if (loading && !currentProject) {
    return <div className="text-center py-10">Yükleniyor...</div>;
  }
  
  if (!currentProject) {
    return <div className="text-center py-10">Proje bulunamadı</div>;
  }
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/project">
              <ArrowLeft size={16} />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Proje Düzenle</h1>
        </div>
        <Button 
          onClick={handleUpdateProject} 
          className="flex items-center gap-2"
          disabled={!projectForm.title || imageUploading}
        >
          <Save size={16} /> Tüm Değişiklikleri Kaydet
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
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Proje Bilgileri</CardTitle>
              <CardDescription>
                Projenin temel bilgilerini düzenleyin
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
                      value={projectForm.title}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={projectForm.description}
                      onChange={handleFormChange}
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="date">Tarih</Label>
                    <Input
                      id="date"
                      name="date"
                      type="date"
                      value={projectForm.date ? projectForm.date.split('T')[0] : ''}
                      onChange={handleFormChange}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Kategori</Label>
                      <Input
                        id="category"
                        name="category"
                        value={projectForm.category}
                        onChange={handleFormChange}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="color">Renk</Label>
                      <div className="flex gap-3 items-center">
                        <Input
                          id="color"
                          name="color"
                          type="color"
                          value={projectForm.color}
                          onChange={handleFormChange}
                          className="w-12 h-10 p-1"
                        />
                        <Input
                          value={projectForm.color}
                          onChange={handleFormChange}
                          name="color"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label>Proje Detay Bilgileri</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddProjectInfo}
                      >
                        Yeni Bilgi Ekle
                      </Button>
                    </div>
                    <div className="space-y-3">
                      {projectForm.projectInfo.length === 0 ? (
                        <div className="text-center py-4 text-gray-500 border border-dashed rounded-md">
                          <p>Henüz proje bilgisi eklenmemiş</p>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="mt-2"
                            onClick={() => {
                              setProjectForm({
                                ...projectForm,
                                projectInfo: [
                                  { title: "Client", data: "" },
                                  { title: "Timeline", data: "" },
                                  { title: "Services", data: "- Service 1\n- Service 2" },
                                  { title: "Website", data: "https://example.com" }
                                ]
                              });
                            }}
                          >
                            Temel Bilgileri Ekle
                          </Button>
                        </div>
                      ) : (
                        projectForm.projectInfo.map((info, index) => (
                          <div key={index} className="grid grid-cols-4 items-start gap-4 p-3 border rounded-md">
                            <div className="col-span-1">
                              <Label htmlFor={`info-title-${index}`}>Başlık</Label>
                              <Input
                                id={`info-title-${index}`}
                                value={info.title}
                                onChange={(e) => handleProjectInfoChange(index, 'title', e.target.value)}
                                className="mt-1"
                              />
                            </div>
                            <div className="col-span-2">
                              <Label htmlFor={`info-data-${index}`}>İçerik</Label>
                              <Textarea
                                id={`info-data-${index}`}
                                value={info.data}
                                onChange={(e) => handleProjectInfoChange(index, 'data', e.target.value)}
                                className="mt-1 font-mono text-sm"
                                placeholder="Markdown kullanımı desteklenir (örn: liste için - item1)"
                                rows={3}
                              />
                              {info.data && info.data.includes('-') && (
                                <div className="mt-1 p-2 bg-gray-50 rounded text-xs">
                                  <p className="font-semibold mb-1">Preview:</p>
                                  <ul className="list-disc list-inside">
                                    {info.data.split('\n').map((line, i) => (
                                      line.trim().startsWith('-') ? 
                                        <li key={i}>{line.trim().replace(/^-\s*/, '')}</li> : 
                                        <p key={i}>{line}</p>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="col-span-1 flex items-end">
                              <Button 
                                type="button" 
                                variant="destructive" 
                                size="sm"
                                className="mt-4"
                                onClick={() => handleRemoveProjectInfo(index)}
                              >
                                Kaldır
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="isPublished" 
                      name="isPublished"
                      checked={projectForm.isPublished}
                      onCheckedChange={(checked) => 
                        setProjectForm({...projectForm, isPublished: checked})
                      }
                    />
                    <Label htmlFor="isPublished">Yayında</Label>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
        
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
                
                {projectForm.image && (
                  <div className="aspect-video bg-gray-100 overflow-hidden rounded-md">
                    <img 
                      src={projectForm.image} 
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
      
      <div className="mt-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>İçerik Blokları</CardTitle>
              <CardDescription>
                Projenizin içerik bloklarını düzenleyin
              </CardDescription>
            </div>
            
            <Dialog open={newBlockDialogOpen} onOpenChange={setNewBlockDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus size={16} className="mr-2" /> Blok Ekle
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Yeni İçerik Bloğu</DialogTitle>
                  <DialogDescription>
                    Projenize yeni bir içerik bloğu ekleyin
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
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
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