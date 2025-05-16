"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { Textarea } from "@/app/_components/ui/textarea";
import { Button } from "@/app/_components/ui/button";
import { ImageIcon, Grid2X2, Grid3X3, HeadingIcon, ListIcon } from "lucide-react";
import Markdown from "@/app/_components/ReactMarkdown";

export default function MarkdownEditor({ value, onChange, height = "400px" }) {
  const [tab, setTab] = useState("editor");

  const insertTemplate = (template) => {
    // Insert at cursor position if possible, otherwise append
    const textarea = document.querySelector('textarea');
    if (!textarea) {
      onChange(value + "\n\n" + template);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newValue = value.substring(0, start) + template + value.substring(end);
    onChange(newValue);
    
    // Focus back on textarea after insertion
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + template.length;
      textarea.selectionEnd = start + template.length;
    }, 0);
  };

  const templates = [
    {
      icon: <HeadingIcon size={18} />,
      label: "Başlık",
      action: () => insertTemplate("\n## Başlık Metni\n")
    },
    {
      icon: <ImageIcon size={18} />,
      label: "Tek Görsel",
      action: () => insertTemplate("\n![Görsel açıklaması](/images/project/sample.jpg)\n")
    },
    {
      icon: <Grid2X2 size={18} />,
      label: "2'li Görsel Grid",
      action: () => insertTemplate('\n<div class="image columns-1 sm:columns-2 gap-8">\n\n![Görsel 1](/images/project/sample1.jpg)\n![Görsel 2](/images/project/sample2.jpg)\n\n</div>\n')
    },
    {
      icon: <Grid3X3 size={18} />,
      label: "4'lü Görsel Grid",
      action: () => insertTemplate('\n<div class="image columns-1 sm:columns-2 gap-8">\n\n![Görsel 1](/images/project/sample1.jpg)\n![Görsel 2](/images/project/sample2.jpg)\n![Görsel 3](/images/project/sample3.jpg)\n![Görsel 4](/images/project/sample4.jpg)\n\n</div>\n')
    },
    {
      icon: <ListIcon size={18} />,
      label: "Liste",
      action: () => insertTemplate("\n- Liste öğesi 1\n- Liste öğesi 2\n- Liste öğesi 3\n")
    }
  ];

  return (
    <div className="w-full border rounded-md overflow-hidden">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="bg-gray-50 px-3 py-2 border-b flex items-center justify-between">
          <TabsList className="grid grid-cols-2 w-40">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Önizleme</TabsTrigger>
          </TabsList>
          
          {tab === "editor" && (
            <div className="flex items-center space-x-1">
              {templates.map((template, index) => (
                <Button 
                  key={index} 
                  variant="ghost" 
                  size="sm" 
                  onClick={template.action}
                  title={template.label}
                  className="h-8 px-2"
                >
                  {template.icon}
                </Button>
              ))}
            </div>
          )}
        </div>

        <TabsContent value="editor" className="m-0">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="border-0 focus-visible:ring-0 rounded-none font-mono text-sm"
            placeholder="Markdown içeriğinizi buraya yazın..."
            style={{ minHeight: height }}
          />
        </TabsContent>

        <TabsContent value="preview" className="m-0">
          <div 
            className="p-4 prose prose-sm max-w-none dark:prose-invert"
            style={{ minHeight: height, maxHeight: "80vh", overflow: "auto" }}
          >
            {value ? (
              <Markdown content={value} />
            ) : (
              <div className="text-gray-400 italic">
                Önizlenecek içerik yok. Lütfen editor sekmesine içerik girin.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
} 