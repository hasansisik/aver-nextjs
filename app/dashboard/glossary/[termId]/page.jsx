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
  Check, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Bold, 
  Italic, 
  Link2, 
  Image, 
  Code
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Simple markdown preview component
const MarkdownPreview = ({ content }) => {
  // Convert markdown to HTML (very basic implementation)
  const renderMarkdown = (text) => {
    if (!text) return "";
    let html = text
      // Headers
      .replace(/^# (.*$)/gm, '<h1 class="text-3xl font-bold my-4">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="text-2xl font-bold my-3">$1</h2>')
      .replace(/^### (.*$)/gm, '<h3 class="text-xl font-bold my-2">$1</h3>')
      // Bold and Italic
      .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gm, '<em>$1</em>')
      // Lists
      .replace(/^\- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gm, '<a href="$2" class="text-blue-500 underline">$1</a>')
      // Paragraphs
      .replace(/^(?!<h|<li|<ul|<ol|<p)(.*$)/gm, '<p class="my-2">$1</p>');
    
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

export default function EditGlossaryTermPage({ params }) {
  const { termId } = params;
  const dispatch = useDispatch();
  const { currentTerm, loading, error, success, message } = useSelector((state) => state.glossary);
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [formModified, setFormModified] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  
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
  
  // Insert markdown syntax at cursor position or replace selected text
  const insertMarkdown = (syntax, placeholder) => {
    const textarea = document.getElementById('content');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = termForm.content.substring(start, end);
    const beforeText = termForm.content.substring(0, start);
    const afterText = termForm.content.substring(end);
    
    let newText;
    if (selectedText) {
      // If text is selected, wrap it with the syntax
      newText = `${beforeText}${syntax.replace('$1', selectedText)}${afterText}`;
    } else {
      // If no text is selected, insert syntax with placeholder
      newText = `${beforeText}${syntax.replace('$1', placeholder)}${afterText}`;
    }
    
    setTermForm({
      ...termForm,
      content: newText
    });
    setFormModified(true);
    
    // Set focus back to textarea and position cursor appropriately
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + (placeholder ? start === end ? syntax.indexOf('$1') + placeholder.length : selectedText.length : syntax.length);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };
  
  if (loading && !currentTerm) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <div className="text-xl">Yükleniyor...</div>
        </div>
      </div>
    );
  }
  
  if (error && !currentTerm) {
    return (
      <div className="container py-10">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Hata</h2>
          <p className="mb-6">{error}</p>
          <Link href="/dashboard/glossary">
            <Button>Sözlük Yönetimine Dön</Button>
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
        <h1 className="text-3xl font-bold">Sözlük Terimi Düzenle</h1>
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
                <Label htmlFor="title">Başlık</Label>
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
                <Label htmlFor="description">Açıklama</Label>
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
                <Label htmlFor="category">Kategori</Label>
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
                <Label htmlFor="content">İçerik</Label>
                
                <div className="border rounded-md mt-1 overflow-hidden">
                  <div className="bg-gray-50 p-2 border-b flex flex-wrap gap-1">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => insertMarkdown('# $1', 'Başlık')}
                      title="Başlık 1"
                    >
                      <Heading1 size={16} />
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => insertMarkdown('## $1', 'Alt Başlık')}
                      title="Başlık 2"
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
                      onClick={() => insertMarkdown('- $1', 'Liste öğesi')}
                      title="Madde İşaretli Liste"
                    >
                      <List size={16} />
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => insertMarkdown('1. $1', 'Liste öğesi')}
                      title="Numaralı Liste"
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
                      onClick={() => insertMarkdown('![$1](https://ornek.com/resim.jpg)', 'Resim açıklaması')}
                      title="Görsel"
                    >
                      <Image size={16} />
                    </Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => insertMarkdown('`$1`', 'kod')}
                      title="Kod"
                    >
                      <Code size={16} />
                    </Button>
                  </div>
                  
                  <Tabs 
                    value={activeTab} 
                    onValueChange={setActiveTab} 
                    className="w-full"
                  >
                    <TabsList className="w-full justify-start border-b rounded-none bg-gray-50">
                      <TabsTrigger value="edit">Düzenle</TabsTrigger>
                      <TabsTrigger value="preview">Önizleme</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="edit" className="m-0">
                      <Textarea
                        id="content"
                        name="content"
                        value={termForm.content}
                        onChange={handleFormChange}
                        className="min-h-[300px] border-0 rounded-none font-mono resize-y"
                      />
                    </TabsContent>
                    
                    <TabsContent value="preview" className="m-0">
                      <MarkdownPreview content={termForm.content} />
                    </TabsContent>
                  </Tabs>
                </div>
                
                <div className="text-xs text-gray-500 mt-1">
                  Markdown formatını kullanabilirsiniz. Yukarıdaki düğmeler ile yaygın biçimlendirme öğeleri ekleyebilirsiniz.
                </div>
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
            <h2 className="text-xl font-bold mb-4">Bilgiler</h2>
            
            {currentTerm && (
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">URL (Slug)</div>
                  <div className="mt-1">{currentTerm.slug}</div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Oluşturulma Tarihi</div>
                  <div className="mt-1">
                    {new Date(currentTerm.createdAt).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium text-gray-500">Son Güncelleme</div>
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
                      Canlı Sayfayı Görüntüle
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow mt-6">
            <h2 className="text-xl font-bold mb-4">İpuçları</h2>
            <div className="space-y-2 text-sm">
              <p>• Başlık sözlük sayfasında alfabetik olarak listelenir.</p>
              <p>• Açıklama kısa ve öz olmalıdır, ana sayfa listesinde görünür.</p>
              <p>• İçerik bölümünde Markdown formatı kullanabilirsiniz.</p>
              <p>• Kategori alanına istediğiniz etiket girilebilir.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 