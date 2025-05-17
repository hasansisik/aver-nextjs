"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProjects, createProject, deleteProject } from "@/redux/actions/projectActions";

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

export default function ProjectPage() {
  const dispatch = useDispatch();
  const { projects, loading, error, success, message } = useSelector((state) => state.project);
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [imageUploading, setImageUploading] = useState(false);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState(null);
  
  // New project form state
  const [projectForm, setProjectForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    image: "",
    category: "",
    color: "#67A94C",
    projectInfo: [],
    isPublished: false
  });
  
  // Load all projects on component mount
  useEffect(() => {
    dispatch(getProjects());
  }, [dispatch]);
  
  useEffect(() => {
    console.log("Projects in state:", projects);
  }, [projects]);

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
  
  const handleCreateProject = (e) => {
    e.preventDefault();
    
    // Filter out empty project info items
    const filteredProjectInfo = projectForm.projectInfo.filter(
      item => item.title.trim() !== '' && item.data.trim() !== ''
    );
    
    const projectData = {
      ...projectForm,
      projectInfo: filteredProjectInfo,
      contentBlocks: [] // Start with empty content blocks
    };
    
    dispatch(createProject(projectData));
    setNewProjectDialogOpen(false);
    resetProjectForm();
  };
  
  const resetProjectForm = () => {
    setProjectForm({
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      image: "",
      category: "",
      color: "#67A94C",
      projectInfo: [],
      isPublished: false
    });
  };
  
  const confirmDeleteProject = (projectId) => {
    setProjectToDelete(projectId);
    setDeleteAlertOpen(true);
  };
  
  const handleDeleteProject = () => {
    if (projectToDelete) {
      dispatch(deleteProject(projectToDelete));
      setProjectToDelete(null);
    }
  };
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Proje Yönetimi</h1>
        <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} /> Yeni Proje Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Yeni Proje</DialogTitle>
              <DialogDescription>
                Yeni bir proje oluşturun. İçerik bloklarını daha sonra ekleyebilirsiniz.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateProject}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Başlık
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={projectForm.title}
                    onChange={handleFormChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="description" className="text-right">
                    Açıklama
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={projectForm.description}
                    onChange={handleFormChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Tarih
                  </Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    value={projectForm.date}
                    onChange={handleFormChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Kategori
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    value={projectForm.category}
                    onChange={handleFormChange}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="color" className="text-right">
                    Renk
                  </Label>
                  <div className="col-span-3 flex gap-3 items-center">
                    <Input
                      id="color"
                      name="color"
                      type="color"
                      value={projectForm.color}
                      onChange={handleFormChange}
                      className="w-16 h-10 p-1"
                    />
                    <Input
                      value={projectForm.color}
                      onChange={handleFormChange}
                      name="color"
                      className="flex-1"
                    />
                  </div>
                </div>
                
                {/* Project Info Section */}
                <div className="border rounded-md p-4 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Proje Bilgileri</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => {
                        setProjectForm({
                          ...projectForm,
                          projectInfo: [
                            ...projectForm.projectInfo,
                            { title: "", data: "" }
                          ]
                        });
                      }}
                    >
                      Yeni Bilgi Ekle
                    </Button>
                  </div>
                  {projectForm.projectInfo.map((info, index) => (
                    <div key={index} className="grid grid-cols-4 items-start gap-4 mb-4 border p-3 rounded-md">
                      <div className="col-span-1">
                        <Label htmlFor={`info-title-${index}`}>Başlık</Label>
                        <Input
                          id={`info-title-${index}`}
                          value={info.title}
                          onChange={(e) => handleProjectInfoChange(index, 'title', e.target.value)}
                          placeholder="Başlık"
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label htmlFor={`info-data-${index}`}>İçerik</Label>
                        <Textarea
                          id={`info-data-${index}`}
                          value={info.data}
                          onChange={(e) => handleProjectInfoChange(index, 'data', e.target.value)}
                          placeholder="Markdown kullanımı desteklenir (örn: liste için - item1)"
                          className="mt-1 font-mono text-sm"
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
                          onClick={() => {
                            const updatedProjectInfo = [...projectForm.projectInfo];
                            updatedProjectInfo.splice(index, 1);
                            setProjectForm({
                              ...projectForm,
                              projectInfo: updatedProjectInfo
                            });
                          }}
                        >
                          Kaldır
                        </Button>
                      </div>
                    </div>
                  ))}
                  {projectForm.projectInfo.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
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
                              { title: "Client", data: "Southpole" },
                              { title: "Timeline", data: "3 Months" },
                              { title: "Services", data: "- Branding\n- Website design\n- Marketing and Planning" },
                              { title: "Website", data: "https://example.com" }
                            ]
                          });
                        }}
                      >
                        Temel Bilgileri Ekle
                      </Button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Kapak Görseli</Label>
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
                        {imageUploading ? "Yükleniyor..." : "Görsel Yükle"}
                        <Upload className="ml-2 h-4 w-4" />
                      </Button>
                      {projectForm.image && (
                        <div className="text-sm text-green-600 flex items-center gap-1">
                          <Check className="h-4 w-4" /> Yüklendi
                        </div>
                      )}
                    </div>
                    {projectForm.image && (
                      <div className="mt-2">
                        <img 
                          src={projectForm.image} 
                          alt="Preview" 
                          className="h-20 object-cover rounded" 
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <div></div>
                  <div className="flex items-center space-x-2 col-span-3">
                    <Checkbox 
                      id="isPublished" 
                      name="isPublished"
                      checked={projectForm.isPublished}
                      onCheckedChange={(checked) => 
                        setProjectForm({...projectForm, isPublished: checked})
                      }
                    />
                    <Label htmlFor="isPublished">Hemen yayınla</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNewProjectDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={!projectForm.title || imageUploading}>
                  Proje Oluştur
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
          <AlertTitle>{alertType === "success" ? "Başarılı" : "Hata"}</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
      
      {loading && <div className="text-center py-10">Yükleniyor...</div>}
      
      {!loading && (!projects || projects.length === 0) && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500 mb-4">Henüz hiç proje bulunmuyor.</p>
          <Button onClick={() => setNewProjectDialogOpen(true)}>İlk Projenizi Oluşturun</Button>
        </div>
      )}
      
      {!loading && projects && projects.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Card key={project._id} className="overflow-hidden flex flex-col">
              {project.image && (
                <div className="h-48 overflow-hidden">
                  <img 
                    src={project.image} 
                    alt={project.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      {project.category && (
                        <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                          {project.category}
                        </span>
                      )}
                      {project.color && (
                        <div 
                          className="w-5 h-5 rounded-full border border-gray-200" 
                          style={{ backgroundColor: project.color }}
                          title={project.color}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    {project.isPublished ? (
                      <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                        Yayında
                      </span>
                    ) : (
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded">
                        Taslak
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{project.description}</p>
                
                {project.projectInfo && project.projectInfo.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                    {project.projectInfo.slice(0, 2).map((info, index) => (
                      <div key={index} className="text-xs">
                        <span className="font-medium">{info.title}: </span>
                        <span className="text-gray-600">{info.data}</span>
                      </div>
                    ))}
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(project.date || project.createdAt).toLocaleDateString('tr-TR', {
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
                    onClick={() => confirmDeleteProject(project._id)}
                  >
                    <Trash size={16} />
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link href={`/project/${project.slug}`} target="_blank">
                        <Eye size={16} className="mr-1" /> Görüntüle
                      </Link>
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      asChild
                    >
                      <Link href={`/dashboard/project/${project._id}`}>
                        <Edit size={16} className="mr-1" /> Düzenle
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
            <AlertDialogTitle>Bu projeyi silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Proje kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProjectToDelete(null)}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProject} className="bg-red-600 focus:ring-red-600">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 