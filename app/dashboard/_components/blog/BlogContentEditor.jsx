"use client";

import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/_components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { Button } from "@/app/_components/ui/button";
import { Textarea } from "@/app/_components/ui/textarea";
import { 
  AlertCircle, 
  Check, 
  Save, 
  Heading1, 
  Heading2, 
  Heading3, 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Link2, 
  Image as ImageIcon, 
  Code, 
  Quote, 
  Table,
  Youtube,
  AlignCenter,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert";
import dynamic from "next/dynamic";

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
      .replace(/^#### (.*$)/gm, '<h4 class="text-lg font-bold my-2">$1</h4>')
      .replace(/^##### (.*$)/gm, '<h5 class="text-base font-bold my-2">$1</h5>')
      .replace(/^###### (.*$)/gm, '<h6 class="text-sm font-bold my-2">$1</h6>')
      
      // Bold and Italic
      .replace(/\*\*\*(.*)\*\*\*/gm, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
      .replace(/__(.*?)__/gm, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gm, '<em>$1</em>')
      .replace(/_(.*?)_/gm, '<em>$1</em>')
      
      // Lists
      .replace(/^\- (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^\* (.*$)/gm, '<li class="ml-4">$1</li>')
      .replace(/^\d+\. (.*$)/gm, '<li class="ml-4 list-decimal">$1</li>')
      
      // Blockquotes with citation
      .replace(/^> (.*)\n> <cite>— (.*)<\/cite>/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-4">$1<div class="text-right text-gray-600 mt-2">— $2</div></blockquote>')
      // Regular blockquotes
      .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-gray-300 pl-4 italic my-2">$1</blockquote>')
      
      // Code blocks with language
      .replace(/```(.+)?\n([\s\S]*?)\n```/gm, '<pre class="bg-gray-100 p-4 rounded my-4 overflow-x-auto"><code class="language-$1">$2</code></pre>')
      // Inline code
      .replace(/`([^`]+)`/gm, '<code class="bg-gray-100 px-1 rounded font-mono text-sm">$1</code>')
      
      // Image grid special formats (must process before regular images)
      .replace(/<div class="image-grid grid-2">\n([\s\S]*?)<\/div>/gm, 
        (match, content) => {
          // Extract all image markdown from content and transform to HTML
          const imageHtml = content
            .replace(/!\[(.*?)\]\((.*?)\)/gm, '<img src="$2" alt="$1" class="w-full h-auto rounded" />');
          return `<div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">${imageHtml}</div>`;
        })
      .replace(/<div class="image-grid grid-4">\n([\s\S]*?)<\/div>/gm, 
        (match, content) => {
          // Extract all image markdown from content and transform to HTML
          const imageHtml = content
            .replace(/!\[(.*?)\]\((.*?)\)/gm, '<img src="$2" alt="$1" class="w-full h-auto rounded" />');
          return `<div class="grid grid-cols-2 gap-4 my-6">${imageHtml}</div>`;
        })
      
      // Images with alignment
      .replace(/!\[(.*?)\]\((.*?)\)\{center\}/gm, '<div class="flex justify-center my-4"><img src="$2" alt="$1" class="max-w-full h-auto rounded" /></div>')
      .replace(/!\[(.*?)\]\((.*?) "(.*?)"\)/gm, '<img src="$2" alt="$1" title="$3" class="my-4 max-w-full h-auto rounded">')
      .replace(/!\[(.*?)\]\((.*?)\)/gm, '<img src="$2" alt="$1" class="my-4 max-w-full h-auto rounded">')
      
      // YouTube video embeds via thumbnail link
      .replace(/\[\!\[(.*?)\]\((.*?)\)\]\((https:\/\/www\.youtube\.com\/watch\?v=(.+?))\)/gm, 
        '<div class="my-4"><a href="$3" target="_blank" rel="noopener noreferrer" class="block aspect-video overflow-hidden rounded"><img src="$2" alt="$1" class="w-full object-cover hover:opacity-90 transition" /><div class="text-center mt-1 text-sm text-gray-700">$1 (YouTube)</div></a></div>'
      )
      
      // Links
      .replace(/\[([^\]]+)\]\(([^)]+)\)/gm, '<a href="$2" class="text-blue-500 underline">$1</a>')
      
      // Tables
      .replace(/(\|[^\n]+\|\r?\n)((?:\|:?[-]+:?)+\|)(\n(?:\|[^\n]+\|\r?\n?)*)/gm, (match, header, separator, rows) => {
        const headerHtml = header.replace(/\|([^|]+)/g, '<th class="border p-2 bg-gray-100">$1</th>').replace(/\|\s*$/, '');
        const rowsHtml = rows.replace(/\|([^|]+)/g, '<td class="border p-2">$1</td>').replace(/\|\s*$/, '').replace(/\|\s*\n/g, '</tr><tr>');
        
        return `<table class="border-collapse border w-full my-4"><thead><tr>${headerHtml}</tr></thead><tbody><tr>${rowsHtml}</tr></tbody></table>`;
      })
      
      // Horizontal rule
      .replace(/^---$/gm, '<hr class="my-4 border-t border-gray-300">')
      
      // Paragraphs
      .replace(/^(?!<h|<li|<blockquote|<pre|<code|<img|<a|<ul|<ol|<p|<tr|<div|<iframe|<table|<hr)(.*$)/gm, '<p class="my-2">$1</p>');
    
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

export default function BlogContentEditor({ 
  content = "", 
  onChange, 
  onSave,
  title = "Blog İçeriği",
  description = "Blog yazınızın içeriğini markdown formatında düzenleyin" 
}) {
  const dispatch = useDispatch();
  
  const [markdownContent, setMarkdownContent] = useState(content);
  const [markdownEditorTab, setMarkdownEditorTab] = useState("edit");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    // Update content when props change
    setMarkdownContent(content);
  }, [content]);
  
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setMarkdownContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };
  
  // Insert markdown syntax at cursor position or replace selected text
  const insertMarkdown = (syntax, placeholder) => {
    const textarea = document.getElementById('blogContent');
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = markdownContent.substring(start, end);
    const beforeText = markdownContent.substring(0, start);
    const afterText = markdownContent.substring(end);
    
    let newText;
    if (selectedText) {
      // If text is selected, wrap it with the syntax
      newText = `${beforeText}${syntax.replace('$1', selectedText)}${afterText}`;
    } else {
      // If no text is selected, insert syntax with placeholder
      newText = `${beforeText}${syntax.replace('$1', placeholder)}${afterText}`;
    }
    
    setMarkdownContent(newText);
    if (onChange) {
      onChange(newText);
    }
    
    // Set focus back to textarea and position cursor appropriately
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + (placeholder ? start === end ? syntax.indexOf('$1') + placeholder.length : selectedText.length : syntax.length);
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setIsSaving(true);
      await onSave(markdownContent);
      
      setAlertType("success");
      setAlertMessage("İçerik başarıyla kaydedildi");
      setShowAlert(true);
      
      // Hide the alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } catch (error) {
      setAlertType("error");
      setAlertMessage(error?.message || "İçerik kaydedilirken bir hata oluştu");
      setShowAlert(true);
      
      // Hide the alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Image template examples
  const exampleTemplates = {
    singleImage: '![Görsel açıklaması](https://örnek.com/gorsel.jpg)',
    centeredImage: '![Görsel açıklaması](https://örnek.com/gorsel.jpg){center}',
    twoColumnGrid: '<div class="image-grid grid-2">\n\n![Görsel 1](https://örnek.com/gorsel1.jpg)\n\n![Görsel 2](https://örnek.com/gorsel2.jpg)\n\n</div>',
    fourColumnGrid: '<div class="image-grid grid-4">\n\n![Görsel 1](https://örnek.com/gorsel1.jpg)\n\n![Görsel 2](https://örnek.com/gorsel2.jpg)\n\n![Görsel 3](https://örnek.com/gorsel3.jpg)\n\n![Görsel 4](https://örnek.com/gorsel4.jpg)\n\n</div>',
    youtubeVideo: '[![YouTube Video](https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg)](https://www.youtube.com/watch?v=VIDEO_ID)'
  };

  return (
    <>
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
      
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md overflow-hidden">
            <div className="bg-gray-50 p-2 border-b flex flex-wrap gap-1">
              <div className="w-full flex flex-wrap gap-1 mb-2 pb-2 border-b">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('# $1', 'Başlık')}
                  title="H1 Başlık"
                >
                  <Heading1 size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('## $1', 'Alt Başlık')}
                  title="H2 Başlık"
                >
                  <Heading2 size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('### $1', 'Küçük Başlık')}
                  title="H3 Başlık"
                >
                  <Heading3 size={16} />
                </Button>
                <div className="h-6 border-l mx-1"></div>
                
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
                <div className="h-6 border-l mx-1"></div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('* $1\n* Madde 2\n* Madde 3', 'Madde 1')}
                  title="Sırasız Liste"
                >
                  <List size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('1. $1\n2. Madde 2\n3. Madde 3', 'Madde 1')}
                  title="Sıralı Liste"
                >
                  <ListOrdered size={16} />
                </Button>
              </div>
              
              <div className="w-full flex flex-wrap gap-1 mb-2">
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
                  onClick={() => insertMarkdown('> $1\n> <cite>— Yazar Adı</cite>', 'Alıntı metni')}
                  title="Alıntı (Yazarlı)"
                >
                  <span className="flex items-center gap-1">
                    <Quote size={16} />
                    <span className="text-xs">+</span>
                  </span>
                </Button>
                <div className="h-6 border-l mx-1"></div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('`$1`', 'kod')}
                  title="Satır İçi Kod"
                >
                  <Code size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('```javascript\n$1\n```', 'console.log("Merhaba Dünya!");')}
                  title="Kod Bloğu (JavaScript)"
                >
                  <span className="font-mono text-xs">{"{ }"}</span>
                </Button>
                <div className="h-6 border-l mx-1"></div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('| Başlık 1 | Başlık 2 |\n| --------- | --------- |\n| Hücre 1  | Hücre 2  |\n| Hücre 3  | Hücre 4  |', '')}
                  title="Tablo"
                >
                  <Table size={16} />
                </Button>
                <div className="h-6 border-l mx-1"></div>
                
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
                  onClick={() => insertMarkdown(exampleTemplates.singleImage, '')}
                  title="Görsel Ekle"
                >
                  <ImageIcon size={16} />
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown(exampleTemplates.centeredImage, '')}
                  title="Ortalanmış Görsel Ekle"
                >
                  <AlignCenter size={16} />
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown(exampleTemplates.twoColumnGrid, '')}
                  title="2'li Görsel Grid"
                >
                  <span className="text-xs font-mono">2×1</span>
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown(exampleTemplates.fourColumnGrid, '')}
                  title="4'lü Görsel Grid"
                >
                  <span className="text-xs font-mono">2×2</span>
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown(exampleTemplates.youtubeVideo, '')}
                  title="YouTube Video Ekle"
                >
                  <Youtube size={16} />
                </Button>
              </div>
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
                  value={markdownContent}
                  onChange={handleContentChange}
                  className="min-h-[400px] border-0 rounded-none font-mono resize-y"
                  placeholder="Blog içeriğini markdown formatında yazın..."
                />
              </TabsContent>
              
              <TabsContent value="preview" className="m-0">
                <MarkdownPreview content={markdownContent} />
              </TabsContent>
            </Tabs>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Markdown formatlamasını kullanarak içeriğinizi zenginleştirin. Başlıklar, listeler, alıntılar, kod blokları, tablolar ve görseller ekleyebilirsiniz.
          </p>
          <div className="mt-2 pt-2 border-t text-xs text-gray-500">
            <p className="font-semibold">Özel Biçimlendirme:</p>
            <ul className="list-disc ml-4 space-y-1 mt-1">
              <li>Alıntılar için yazar eklemek: <code>{`> Alıntı metni\n> <cite>— Yazar Adı</cite>`}</code></li>
              <li>Resim başlığı eklemek: <code>{`![Açıklama](resim.jpg "Başlık metni")`}</code></li>
              <li>Görseli ortalamak: <code>{`![Açıklama](resim.jpg){center}`}</code></li>
            </ul>
          </div>

          {onSave && (
            <div className="flex justify-end mt-4">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save size={16} />
                {isSaving ? "Kaydediliyor..." : "Kaydet"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
} 