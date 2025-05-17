"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGlossaryTermById, updateGlossaryTerm } from "@/redux/actions/glossaryActions";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Label } from "@/app/_components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert";
import { 
  ArrowLeft, 
  Save, 
  AlertCircle, 
  Check
} from "lucide-react";
import Link from "next/link";
import BlogContentEditor from "../../_components/blog/BlogContentEditor";

export default function EditGlossaryTermPage({ params }) {
  const { termId } = params;
  const dispatch = useDispatch();
  const { currentTerm, loading, error, success, message } = useSelector((state) => state.glossary);
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [formModified, setFormModified] = useState(false);
  
  // Form state
  const [termForm, setTermForm] = useState({
    title: "",
    description: "",
    content: "",
    category: ""
  });
  
  // Load term data on component mount
  useEffect(() => {
    dispatch(getGlossaryTermById(termId));
  }, [dispatch, termId]);
  
  // Update form when term data is loaded
  useEffect(() => {
    if (currentTerm) {
      setTermForm({
        title: currentTerm.title || "",
        description: currentTerm.description || "",
        content: currentTerm.content || "",
        category: currentTerm.category || ""
      });
    }
  }, [currentTerm]);
  
  // Handle alerts for success/error messages
  useEffect(() => {
    if (success && message) {
      setAlertType("success");
      setAlertMessage(message);
      setShowAlert(true);
      setFormModified(false);
      
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
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTermForm({
      ...termForm,
      [name]: value
    });
    setFormModified(true);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    const updateData = {
      termId,
      ...termForm
    };
    
    dispatch(updateGlossaryTerm(updateData));
  };

  // Handle content changes from the editor
  const handleContentChange = (newContent) => {
    setTermForm({
      ...termForm,
      content: newContent
    });
    setFormModified(true);
  };
  
  // Handle the save action from the editor
  const handleContentSave = async (newContent) => {
    const updateData = {
      termId,
      content: newContent
    };
    
    await dispatch(updateGlossaryTerm(updateData)).unwrap();
    
    // Update local state
    setTermForm(prev => ({
      ...prev,
      content: newContent
    }));
  };
  
  if (loading && !currentTerm) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <div className="text-xl">Loading...</div>
        </div>
      </div>
    );
  }
  
  if (error && !currentTerm) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="mb-6">{error}</p>
          <Link href="/dashboard/glossary">
            <Button>Back to Glossary</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center mb-6">
        <Link href="/dashboard/glossary" className="mr-4">
          <Button variant="outline" size="icon">
            <ArrowLeft size={16} />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Glossary Term Edit</h1>
      </div>
      
      {showAlert && (
        <Alert className={`mb-6 ${alertType === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {alertType === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>{alertType === "success" ? "Başarılı" : "Hata"}</AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={termForm.title}
                  onChange={handleFormChange}
                  className="mt-1"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={termForm.description}
                  onChange={handleFormChange}
                  className="mt-1"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  Kısa ve öz bir açıklama. Glossary sayfasında listelenirken ve terim sayfasının başlığı altında gösterilir.
                </div>
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  name="category"
                  value={termForm.category}
                  onChange={handleFormChange}
                  className="mt-1"
                  placeholder="Örn: SEO, Pazarlama, Teknoloji"
                />
                <div className="text-xs text-gray-500 mt-1">
                  İstediğiniz kategori ismini girebilirsiniz. Örn: SEO, Pazarlama, Web Geliştirme
                </div>
              </div>
              
              <div>
                <Label htmlFor="content">Content</Label>
                <BlogContentEditor 
                  content={termForm.content}
                  onChange={handleContentChange}
                  onSave={handleContentSave}
                  title="Term Content"
                  description="Edit the term content in markdown format"
                />
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button 
                type="submit" 
                disabled={!formModified || loading}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                Kaydet
              </Button>
            </div>
          </form>
        </div>
        
        <div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Information</h2>
            
            {currentTerm && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">URL (Slug)</div>
                  <div className="mt-1">{currentTerm.slug}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Created Date</div>
                  <div className="mt-1">
                    {new Date(currentTerm.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Last Update</div>
                  <div className="mt-1">
                    {new Date(currentTerm.updatedAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                <div className="pt-4 border-t mt-4">
                  <Link href={`/glossary/${currentTerm.slug}`} target="_blank">
                    <Button variant="outline" className="w-full">
                      View Live Page
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow mt-6">
            <h2 className="text-xl font-bold mb-4">Tips</h2>
            <div className="space-y-2 text-sm">
              <p>• Title is listed alphabetically on the glossary page.</p>
              <p>• Description should be short and concise, visible in the main page list.</p>
              <p>• You can use Markdown format in the content section.</p>
              <p>• You can enter the category you want in the category field.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 