"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  getProjectById, 
  updateProject, 
} from "@/redux/actions/projectActions";
import { useParams, useRouter } from "next/navigation";

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
import { uploadImageToCloudinary } from "../../../../utils/cloudinary";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import BlogContentEditor from "../../_components/blog/BlogContentEditor";

export default function ProjectEditPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { currentProject, loading, error, success, message } = useSelector((state) => state.project);
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  
  // Project form state
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    date: "",
    image: "",
    category: "",
    color: "#000000",
    projectInfo: [],
    markdownContent: ""
  });
  
  useEffect(() => {
    if (params.id) {
      // Fetch project by ID
      console.log("Fetching project with ID:", params.id);
      dispatch(getProjectById(params.id));
    }
  }, [dispatch, params.id]);
  
  useEffect(() => {
    if (currentProject) {
      // Use markdownContent if available, otherwise try to convert from contentBlocks
      let markdownContent = currentProject.markdownContent || "";
      
      // If no markdownContent but contentBlocks exist, convert them (for backward compatibility)
      if (!markdownContent && currentProject.contentBlocks && currentProject.contentBlocks.length > 0) {
        // Sort blocks by order
        const sortedBlocks = [...currentProject.contentBlocks].sort((a, b) => (a.order || 0) - (b.order || 0));
        
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
      
      setProjectForm({
        title: currentProject.title || "",
        description: currentProject.description || "",
        date: currentProject.date || new Date().toISOString().split('T')[0],
        image: currentProject.image || "",
        category: currentProject.category || "",
        color: currentProject.color || "#000000",
        projectInfo: currentProject.projectInfo || [],
        markdownContent: markdownContent
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
    const { name, value } = e.target;
    setProjectForm({
      ...projectForm,
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
      markdownContent: projectForm.markdownContent
    };
    
    dispatch(updateProject(projectData));
  };
  
  // Handle content changes from the editor
  const handleContentChange = (newContent) => {
    setProjectForm({
      ...projectForm,
      markdownContent: newContent
    });
  };
  
  // Handle the save action from the editor
  const handleContentSave = async (newContent) => {
    const projectData = {
      projectId: currentProject._id,
      markdownContent: newContent
    };
    
    await dispatch(updateProject(projectData)).unwrap();
    
    // Update local state
    setProjectForm({
      ...projectForm,
      markdownContent: newContent
    });
  };
  
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
        <BlogContentEditor 
          content={projectForm.markdownContent}
          onChange={handleContentChange}
          onSave={handleContentSave}
          title="Proje İçeriği"
          description="Projenizin içeriğini markdown formatında düzenleyin"
        />
      </div>
    </div>
  );
} 