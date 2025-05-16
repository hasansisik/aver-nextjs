"use client";

import { useState } from "react";
import { useDispatch } from "react-redux";
import { updateProject } from "@/redux/actions/projectActions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/_components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { Button } from "@/app/_components/ui/button";
import { Textarea } from "@/app/_components/ui/textarea";
import { AlertCircle, Check, Save, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/_components/ui/accordion";
import dynamic from "next/dynamic";

// Dynamically import the markdown editor to avoid SSR issues
const MarkdownEditor = dynamic(
  () => import("@/app/_components/MarkdownEditor"), 
  { ssr: false }
);

export default function ProjectContentEditor({ projectId, contentBlocks, markdownContent }) {
  const dispatch = useDispatch();
  
  const [content, setContent] = useState(markdownContent || "");
  const [isSaving, setIsSaving] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  
  const handleSaveContent = async () => {
    try {
      setIsSaving(true);
      
      await dispatch(updateProject({
        projectId,
        markdownContent: content
      })).unwrap();
      
      setAlertType("success");
      setAlertMessage("İçerik başarıyla kaydedildi");
      setShowAlert(true);
      
      // Hide the alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } catch (error) {
      setAlertType("error");
      setAlertMessage(error || "İçerik kaydedilirken bir hata oluştu");
      setShowAlert(true);
      
      // Hide the alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const exampleTemplates = {
    singleImage: '![Görsel açıklaması](/images/project/01-00.jpg)',
    twoColumnGrid: '<div class="image columns-1 sm:columns-2 gap-8">\n\n![Görsel 1](/images/project/01-01.jpg)\n![Görsel 2](/images/project/01-02.jpg)\n\n</div>',
    fourColumnGrid: '<div class="image columns-1 sm:columns-2 gap-8">\n\n![Görsel 1](/images/project/01-01.jpg)\n![Görsel 2](/images/project/01-02.jpg)\n![Görsel 3](/images/project/01-03.jpg)\n![Görsel 4](/images/project/01-04.jpg)\n\n</div>'
  };
  
  return (
    <>
      {showAlert && (
        <Alert 
          className={`mb-4 ${
            alertType === "success" 
              ? "bg-green-50 text-green-700 border-green-200" 
              : "bg-red-50 text-red-700 border-red-200"
          }`}
        >
          {alertType === "success" ? (
            <Check className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <AlertTitle>
            {alertType === "success" ? "Başarılı" : "Hata"}
          </AlertTitle>
          <AlertDescription>{alertMessage}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Proje İçeriği</CardTitle>
            <CardDescription>
              Projenizin içeriğini Markdown formatında düzenleyin
            </CardDescription>
          </div>
          <Button 
            onClick={handleSaveContent}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save size={16} />
            {isSaving ? "Kaydediliyor..." : "Kaydet"}
          </Button>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <Accordion type="single" collapsible className="bg-gray-50 rounded-md border">
              <AccordionItem value="item-1">
                <AccordionTrigger className="px-4 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Info size={16} />
                    <span>Görsel Yerleşim Şablonları</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Tekli Görsel</h4>
                      <div className="bg-gray-100 p-2 rounded text-xs font-mono">
                        {exampleTemplates.singleImage}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">2'li Görsel Grid</h4>
                      <div className="bg-gray-100 p-2 rounded text-xs font-mono whitespace-pre">
                        {exampleTemplates.twoColumnGrid}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2">4'lü Görsel Grid</h4>
                      <div className="bg-gray-100 p-2 rounded text-xs font-mono whitespace-pre">
                        {exampleTemplates.fourColumnGrid}
                      </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setContent(prev => prev + '\n\n' + exampleTemplates.singleImage)}
                      >
                        Tekli Görsel Ekle
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setContent(prev => prev + '\n\n' + exampleTemplates.twoColumnGrid)}
                      >
                        2'li Grid Ekle
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setContent(prev => prev + '\n\n' + exampleTemplates.fourColumnGrid)}
                      >
                        4'lü Grid Ekle
                      </Button>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="editor">Markdown Editör</TabsTrigger>
              <TabsTrigger value="raw">Ham Markdown</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="mt-0">
              <MarkdownEditor 
                value={content}
                onChange={setContent}
                height="600px"
              />
            </TabsContent>
            
            <TabsContent value="raw" className="mt-0">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[600px] font-mono text-sm"
                placeholder="Markdown içeriğinizi buraya yazın..."
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </>
  );
} 