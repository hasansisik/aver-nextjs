"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getGlossaryTerms, createGlossaryTerm, deleteGlossaryTerm } from "@/redux/actions/glossaryActions";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card";
import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { Textarea } from "@/app/_components/ui/textarea";
import { Label } from "@/app/_components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert";
import { 
  AlertCircle, 
  Check, 
  Trash, 
  Edit, 
  Eye, 
  Plus, 
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import Link from "next/link";

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
      className="prose prose-sm max-w-none overflow-auto bg-white p-4 rounded-md border min-h-[200px]"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
    />
  );
};

export default function GlossaryPage() {
  const dispatch = useDispatch();
  const { glossaryTerms, loading, error, success, message } = useSelector((state) => state.glossary);
  
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [newTermDialogOpen, setNewTermDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("edit");
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false);
  const [termToDelete, setTermToDelete] = useState(null);
  
  // New glossary term form state
  const [termForm, setTermForm] = useState({
    title: "",
    description: "",
    content: "",
    category: ""
  });
  
  // Load all glossary terms on component mount
  useEffect(() => {
    dispatch(getGlossaryTerms());
  }, [dispatch]);
  
  // Debug log to check glossary terms
  useEffect(() => {
    console.log("Glossary terms in state:", glossaryTerms);
  }, [glossaryTerms]);

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
  
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setTermForm({
      ...termForm,
      [name]: value
    });
  };
  
  const handleCreateTerm = (e) => {
    e.preventDefault();
    
    const termData = {
      ...termForm
    };
    
    dispatch(createGlossaryTerm(termData));
    setNewTermDialogOpen(false);
    resetTermForm();
  };
  
  const resetTermForm = () => {
    setTermForm({
      title: "",
      description: "",
      content: "",
      category: ""
    });
    setActiveTab("edit");
  };
  
  const confirmDeleteTerm = (termId) => {
    setTermToDelete(termId);
    setDeleteAlertOpen(true);
  };
  
  const handleDeleteTerm = () => {
    if (termToDelete) {
      dispatch(deleteGlossaryTerm(termToDelete));
      setTermToDelete(null);
    }
  };

  // Insert markdown syntax at cursor position or replace selected text
  const insertMarkdown = (syntax, placeholder) => {
    const textarea = document.getElementById('new-content');
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
    
    // Set focus back to textarea and position cursor appropriately
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + (placeholder ? start === end ? syntax.indexOf('$1') + placeholder.length : selectedText.length : syntax.length);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Sort terms alphabetically
  const sortedTerms = glossaryTerms ? [...glossaryTerms].sort((a, b) => a.title.localeCompare(b.title)) : [];
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Sözlük Yönetimi</h1>
        <Dialog open={newTermDialogOpen} onOpenChange={setNewTermDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus size={16} /> Yeni Terim Ekle
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[650px]">
            <DialogHeader>
              <DialogTitle>Yeni Sözlük Terimi</DialogTitle>
              <DialogDescription>
                Sözlüğe yeni bir terim ekleyin.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateTerm}>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="title" className="text-right">
                    Başlık
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={termForm.title}
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
                    value={termForm.description}
                    onChange={handleFormChange}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="category" className="text-right">
                    Kategori
                  </Label>
                  <Input
                    id="category"
                    name="category"
                    value={termForm.category}
                    onChange={handleFormChange}
                    className="col-span-3"
                    placeholder="Örn: SEO, Pazarlama, Teknoloji"
                  />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                  <Label htmlFor="content" className="text-right pt-2">
                    İçerik
                  </Label>
                  <div className="col-span-3 border rounded-md overflow-hidden">
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
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="edit" className="m-0">
                        <Textarea
                          id="new-content"
                          name="content"
                          value={termForm.content}
                          onChange={handleFormChange}
                          className="min-h-[200px] border-0 rounded-none font-mono resize-y"
                          placeholder="Terimin detaylı açıklamasını markdown formatında yazabilirsiniz."
                        />
                      </TabsContent>
                      
                      <TabsContent value="preview" className="m-0">
                        <MarkdownPreview content={termForm.content} />
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setNewTermDialogOpen(false)}>
                  İptal
                </Button>
                <Button type="submit" disabled={!termForm.title || !termForm.description}>
                  Terimi Oluştur
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
      
      {!loading && (!sortedTerms || sortedTerms.length === 0) && (
        <div className="text-center py-10">
          <p className="text-lg text-gray-500 mb-4">Henüz hiç sözlük terimi bulunmuyor.</p>
          <Button onClick={() => setNewTermDialogOpen(true)}>İlk Sözlük Teriminizi Oluşturun</Button>
        </div>
      )}
      
      {!loading && sortedTerms && sortedTerms.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sortedTerms.map((term) => (
            <Card key={term._id} className="overflow-hidden flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="line-clamp-2">{term.title}</CardTitle>
                    {term.category && (
                      <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mt-2">
                        {term.category}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-3">{term.description}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {new Date(term.createdAt).toLocaleDateString('tr-TR', {
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
                    onClick={() => confirmDeleteTerm(term._id)}
                  >
                    <Trash size={16} />
                  </Button>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link href={`/glossary/${term.slug}`} target="_blank">
                        <Eye size={16} className="mr-1" /> Görüntüle
                      </Link>
                    </Button>
                    <Button 
                      variant="default" 
                      size="sm"
                      asChild
                    >
                      <Link href={`/dashboard/glossary/${term._id}`}>
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
            <AlertDialogTitle>Bu sözlük terimini silmek istediğinize emin misiniz?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Sözlük terimi kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTermToDelete(null)}>İptal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTerm} className="bg-red-600 focus:ring-red-600">
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 