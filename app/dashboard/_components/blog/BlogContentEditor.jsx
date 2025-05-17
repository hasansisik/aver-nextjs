"use client";

import { useState, useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/app/_components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs";
import { Button } from "@/app/_components/ui/button";
import { Textarea } from "@/app/_components/ui/textarea";
import { Input } from "@/app/_components/ui/input";
import { Label } from "@/app/_components/ui/label";
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
  AlignLeft,
  Upload,
  UploadCloud,
  Loader2,
  FileText
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from "@/app/_components/ui/dialog";
import { uploadImageToCloudinary } from "../../../../utils/cloudinary";
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
  title = "Blog Content",
  description = "Edit your blog content in markdown format",
  uploadHandler = uploadImageToCloudinary
}) {
  const dispatch = useDispatch();
  
  const [markdownContent, setMarkdownContent] = useState(content);
  const [markdownEditorTab, setMarkdownEditorTab] = useState("edit");
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState("success");
  const [alertMessage, setAlertMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  
  // Image upload dialog state
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const imageUploadRef = useRef(null);
  const [imageUrl, setImageUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [alignment, setAlignment] = useState("left");
  const [titleText, setTitleText] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("single");
  const [multipleImages, setMultipleImages] = useState([]);
  const multipleImageRefsRef = useRef([]);
  const [imageDialogTab, setImageDialogTab] = useState("template");
  
  // Video dialog state
  const [isVideoDialogOpen, setIsVideoDialogOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");
  
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

  // Handle file selection for image dialog
  const handleImageFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) {
      setSelectedImage(null);
      setImagePreview("");
      return;
    }
    
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  // Handle image selection for templates
  const handleTemplateImageSelect = (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    const newImages = [...multipleImages];
    newImages[index] = file;
    setMultipleImages(newImages);

    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      // Find only the exact preview elements for this specific index
      const previewElements = document.querySelectorAll(`.preview-image-${index}`);
      if (previewElements && previewElements.length) {
        previewElements.forEach(el => {
          // Check if this element belongs to the current template
          const templateContainer = el.closest(`[data-template]`);
          if (templateContainer && templateContainer.dataset.template === selectedTemplate) {
            el.src = reader.result;
            el.style.display = 'block';
          }
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Trigger file picker for template images
  const triggerTemplateImagePicker = (index) => {
    if (multipleImageRefsRef.current[index]) {
      multipleImageRefsRef.current[index].click();
    }
  };

  // Handle inserting template with actual images
  const handleInsertTemplate = async () => {
    setImageUploadLoading(true);

    try {
      let uploadRequired = false;
      let requiredImageCount = 0;
      
      // Determine required images based on template
      switch (selectedTemplate) {
        case "single":
        case "centered":
          requiredImageCount = 1;
          break;
        case "double":
          requiredImageCount = 2;
          break;
        case "grid":
          requiredImageCount = 4;
          break;
      }
      
      // Check which images need uploading
      const imagesToUpload = [];
      for (let i = 0; i < requiredImageCount; i++) {
        if (multipleImages[i]) {
          uploadRequired = true;
          imagesToUpload.push({
            index: i,
            file: multipleImages[i]
          });
        }
      }
      
      // If none selected, show error
      if (imagesToUpload.length === 0) {
        setAlertType("error");
        setAlertMessage("Please select at least one image");
        setShowAlert(true);
        setImageUploadLoading(false);
        return;
      }
      
      // Process grid template - allow partial uploads
      if (selectedTemplate === "grid" && imagesToUpload.length < 4) {
        // Continue with available images
      }
      
      // Process double template - require both images
      if (selectedTemplate === "double" && imagesToUpload.length < 2) {
        if (multipleImages[0] && !multipleImages[1]) {
          setAlertType("error");
          setAlertMessage("You need to select both images for the 2-column template");
          setShowAlert(true);
          setImageUploadLoading(false);
          return;
        }
      }
      
      // Upload images
      const uploadResults = [];
      if (uploadRequired) {
        for (const item of imagesToUpload) {
          try {
            const url = await uploadHandler(item.file);
            uploadResults.push({
              index: item.index,
              url: url,
              alt: item.file.name.split('.')[0] || `Image ${item.index + 1}`
            });
          } catch (error) {
            console.error(`Error uploading image ${item.index}:`, error);
            // Continue with other uploads
          }
        }
      }
      
      if (uploadResults.length === 0) {
        setAlertType("error");
        setAlertMessage("Images could not be uploaded. Please try again.");
        setShowAlert(true);
        setImageUploadLoading(false);
        return;
      }
      
      // Sort by original index
      uploadResults.sort((a, b) => a.index - b.index);
      
      // Create the markdown based on template and uploaded images
      let markdownTemplate = "";
      
      switch (selectedTemplate) {
        case "single":
          markdownTemplate = `![${uploadResults[0].alt}](${uploadResults[0].url})`;
          break;
        case "double":
          // Format as two images side by side with a special class
          const doubleTemplate = `<div class="image-grid grid-2">

![${uploadResults[0].alt}](${uploadResults[0].url})

${uploadResults.length > 1 ? `![${uploadResults[1].alt}](${uploadResults[1].url})` : '![Image 2](image-url-2)'}

</div>`;
          markdownTemplate = doubleTemplate;
          break;
        case "grid":
          // Format as a 2x2 grid with a special class
          const gridTemplate = `<div class="image-grid grid-4">

![${uploadResults[0].alt}](${uploadResults[0].url})

${uploadResults.length > 1 ? `![${uploadResults[1].alt}](${uploadResults[1].url})` : '![Image 2](image-url-2)'}

${uploadResults.length > 2 ? `![${uploadResults[2].alt}](${uploadResults[2].url})` : '![Image 3](image-url-3)'}

${uploadResults.length > 3 ? `![${uploadResults[3].alt}](${uploadResults[3].url})` : '![Image 4](image-url-4)'}

</div>`;
          markdownTemplate = gridTemplate;
          break;
        case "centered":
          markdownTemplate = `![${uploadResults[0].alt}](${uploadResults[0].url}){center}`;
          break;
      }
      
      // Insert the markdown
      insertMarkdown(markdownTemplate, "");
      
      // Reset state
      setIsImageDialogOpen(false);
      setSelectedImage(null);
      setImagePreview("");
      setImageUrl("");
      setAltText("");
      setTitleText("");
      setAlignment("left");
      setSelectedTemplate("single");
      setMultipleImages([]);
      
      setAlertType("success");
      setAlertMessage(`${uploadResults.length} images added`);
      setShowAlert(true);
    } catch (error) {
      console.error("Template image upload error:", error);
      setAlertType("error");
      setAlertMessage("An error occurred while uploading images");
      setShowAlert(true);
    } finally {
      setImageUploadLoading(false);
    }
  };
  
  // Open file picker dialog when clicking Browse button
  const triggerImageFilePicker = () => {
    if (imageUploadRef.current) {
      imageUploadRef.current.click();
    }
  };
  
  // Add a new function to handle video insertion
  const handleInsertVideo = (e) => {
    e.preventDefault();
    
    if (!videoUrl) {
      setAlertType("error");
      setAlertMessage("YouTube video URL or ID is required");
      setShowAlert(true);
      return;
    }

    // Extract video ID from URL if needed
    let videoId = videoUrl;
    
    // Handle YouTube URL formats
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = videoUrl.match(youtubeRegex);
    if (match && match[1]) {
      videoId = match[1];
    }
    
    // Create a markdown link with an image thumbnail as shown in the example
    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    const youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`;
    // Format matches the example: [![Text](image)](url)
    const markdownLink = `[![YouTube Video](${thumbnailUrl})](${youtubeUrl})`;
    
    insertMarkdown(markdownLink, '');
    
    // Close dialog and reset form
    setIsVideoDialogOpen(false);
    setVideoUrl("");
  };
  
  // Handle image upload from dialog for upload and URL tabs
  const handleContentImageUpload = async () => {
    if (!selectedImage && !imageUrl) {
      setAlertType("error");
      setAlertMessage("Please select an image or enter a URL");
      setShowAlert(true);
      return;
    }
    
    let finalImageUrl = imageUrl;
    const imageAlt = altText || (selectedImage?.name?.split('.')[0] || 'Image');
    
    if (selectedImage) {
      setImageUploadLoading(true);
      
      try {
        finalImageUrl = await uploadHandler(selectedImage);
      } catch (error) {
        console.error('Image upload error:', error);
        setAlertType("error");
        setAlertMessage("Image could not be uploaded. Please try again.");
        setShowAlert(true);
        setImageUploadLoading(false);
        return;
      }
    }
    
    if (!finalImageUrl) {
      setAlertType("error");
      setAlertMessage("Valid image URL not found");
      setShowAlert(true);
      setImageUploadLoading(false);
      return;
    }
    
    // Insert the image with proper alignment and optional title
    let markdownImage = "";
    
    // Add title if provided
    if (titleText) {
      if (alignment === "center") {
        markdownImage = `![${imageAlt}](${finalImageUrl} "${titleText}"){center}`;
      } else {
        markdownImage = `![${imageAlt}](${finalImageUrl} "${titleText}")`;
      }
    } else {
      if (alignment === "center") {
        markdownImage = `![${imageAlt}](${finalImageUrl}){center}`;
      } else {
        markdownImage = `![${imageAlt}](${finalImageUrl})`;
      }
    }
    
    // Insert the markdown at cursor position
    insertMarkdown(markdownImage, "");
    
    // Reset dialog state
    setIsImageDialogOpen(false);
    setSelectedImage(null);
    setImagePreview("");
    setImageUrl("");
    setAltText("");
    setTitleText("");
    setAlignment("left");
    setSelectedTemplate("single");
    setMultipleImages([]);
    setImageUploadLoading(false);
    
    setAlertType("success");
    setAlertMessage(selectedImage ? "Image uploaded and added" : "Image added");
    setShowAlert(true);
  };

  const handleSave = async () => {
    if (!onSave) return;
    
    try {
      setIsSaving(true);
      await onSave(markdownContent);
      
      setAlertType("success");
      setAlertMessage("Content saved successfully");
      setShowAlert(true);
      
      // Hide the alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } catch (error) {
      setAlertType("error");
      setAlertMessage(error?.message || "An error occurred while saving content");
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
    singleImage: '![Image Description](https://example.com/image.jpg)',
    centeredImage: '![Image Description](https://example.com/image.jpg){center}',
    twoColumnGrid: '<div class="image-grid grid-2">\n\n![Image 1](https://example.com/image1.jpg)\n\n![Image 2](https://example.com/image2.jpg)\n\n</div>',
    fourColumnGrid: '<div class="image-grid grid-4">\n\n![Image 1](https://example.com/image1.jpg)\n\n![Image 2](https://example.com/image2.jpg)\n\n![Image 3](https://example.com/image3.jpg)\n\n![Image 4](https://example.com/image4.jpg)\n\n</div>',
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
          <AlertTitle>{alertType === "success" ? "Success" : "Error"}</AlertTitle>
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
                  onClick={() => insertMarkdown('# $1', 'Heading')}
                  title="H1 Heading"
                >
                  <Heading1 size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('## $1', 'Subheading')}
                  title="H2 Heading"
                >
                  <Heading2 size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('### $1', 'Small Heading')}
                  title="H3 Heading"
                >
                  <Heading3 size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('#### $1', 'H4 Heading')}
                  title="H4 Heading"
                >
                  <span className="text-xs font-bold">H4</span>
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('##### $1', 'H5 Heading')}
                  title="H5 Heading"
                >
                  <span className="text-xs font-bold">H5</span>
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('###### $1', 'H6 Heading')}
                  title="H6 Heading"
                >
                  <span className="text-xs font-bold">H6</span>
                </Button>
                <div className="h-6 border-l mx-1"></div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('**$1**', 'Bold Text')}
                  title="Bold"
                >
                  <Bold size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('*$1*', 'Italic Text')}
                  title="Italic"
                >
                  <Italic size={16} />
                </Button>
                <div className="h-6 border-l mx-1"></div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('* $1\n* Item 2\n* Item 3', 'Item 1')}
                  title="Unordered List"
                >
                  <List size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('1. $1\n2. Item 2\n3. Item 3', 'Item 1')}
                  title="Ordered List"
                >
                  <ListOrdered size={16} />
                </Button>
              </div>
              
              <div className="w-full flex flex-wrap gap-1 mb-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('> $1', 'Quote text')}
                  title="Quote"
                >
                  <Quote size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('> $1\n> <cite>— Author Name</cite>', 'Quote text')}
                  title="Quote (with Author)"
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
                  onClick={() => insertMarkdown('`$1`', 'code')}
                  title="Inline Code"
                >
                  <Code size={16} />
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('```javascript\n$1\n```', 'console.log("Hello World!");')}
                  title="Code Block (JavaScript)"
                >
                  <span className="font-mono text-xs">{"{ }"}</span>
                </Button>
                <div className="h-6 border-l mx-1"></div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('| Heading 1 | Heading 2 |\n| --------- | --------- |\n| Cell 1  | Cell 2  |\n| Cell 3  | Cell 4  |', '')}
                  title="Table"
                >
                  <Table size={16} />
                </Button>
                <div className="h-6 border-l mx-1"></div>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => insertMarkdown('[$1](https://example.com)', 'Link Text')}
                  title="Link"
                >
                  <Link2 size={16} />
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsImageDialogOpen(true)}
                  title="Add Image"
                >
                  <ImageIcon size={16} />
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  onClick={() => setIsVideoDialogOpen(true)}
                  title="Add YouTube Video"
                >
                  <span className="flex items-center gap-1">
                    <Youtube size={14} />
                  </span>
                </Button>
              </div>
            </div>
                    
            <Tabs 
              value={markdownEditorTab} 
              onValueChange={setMarkdownEditorTab} 
              className="w-full"
            >
              <TabsList className="w-full justify-start border-b rounded-none bg-gray-50">
                <TabsTrigger value="edit">Edit</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="edit" className="m-0">
                <Textarea
                  id="blogContent"
                  name="content"
                  value={markdownContent}
                  onChange={handleContentChange}
                  className="min-h-[400px] border-0 rounded-none font-mono resize-y"
                  placeholder="Write your blog content in markdown format..."
                />
              </TabsContent>
              
              <TabsContent value="preview" className="m-0">
                <MarkdownPreview content={markdownContent} />
              </TabsContent>
            </Tabs>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Enrich your content using Markdown formatting. You can add headings, lists, quotes, code blocks, tables, and images.
          </p>
          <div className="mt-2 pt-2 border-t text-xs text-gray-500">
            <p className="font-semibold">Special Formatting:</p>
            <ul className="list-disc ml-4 space-y-1 mt-1">
              <li>Add author to quotes: <code>{`> Quote text\n> <cite>— Author Name</cite>`}</code></li>
              <li>Add image title: <code>{`![Description](image.jpg "Title text")`}</code></li>
              <li>Center an image: <code>{`![Description](image.jpg){center}`}</code></li>
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
                {isSaving ? "Saving..." : "Save"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Image upload dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Image</DialogTitle>
            <DialogDescription>
              Upload an image or enter a URL to add an image. The image will be inserted at the cursor position.
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="template" className="w-full" onValueChange={setImageDialogTab} value={imageDialogTab}>
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
              <TabsTrigger value="url">Add URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="template" className="space-y-4 py-2">
              <div className="space-y-4">
                <Label>Select Image Layout</Label>
                <div className="grid grid-cols-2 gap-3">
                  <Button 
                    variant={selectedTemplate === "single" ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col gap-2 aspect-video"
                    onClick={() => setSelectedTemplate("single")}
                    data-template="single"
                  >
                    <div className="w-full h-12 bg-gray-200 rounded relative overflow-hidden">
                      <img src="" alt="" className="preview-image-0 absolute inset-0 w-full h-full object-cover hidden" />
                    </div>
                    <span className="text-xs">Single Image</span>
                  </Button>
                  
                  <Button 
                    variant={selectedTemplate === "double" ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col gap-2 aspect-video"
                    onClick={() => setSelectedTemplate("double")}
                    data-template="double"
                  >
                    <div className="w-full h-12 flex gap-1">
                      <div className="w-1/2 bg-gray-200 rounded relative overflow-hidden">
                        <img src="" alt="" className="preview-image-0 absolute inset-0 w-full h-full object-cover hidden" />
                      </div>
                      <div className="w-1/2 bg-gray-200 rounded relative overflow-hidden">
                        <img src="" alt="" className="preview-image-1 absolute inset-0 w-full h-full object-cover hidden" />
                      </div>
                    </div>
                    <span className="text-xs">2-Column Layout</span>
                  </Button>
                  
                  <Button 
                    variant={selectedTemplate === "grid" ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col gap-2 aspect-video"
                    onClick={() => setSelectedTemplate("grid")}
                    data-template="grid"
                  >
                    <div className="w-full h-12 grid grid-cols-2 gap-1">
                      <div className="bg-gray-200 rounded relative overflow-hidden">
                        <img src="" alt="" className="preview-image-0 absolute inset-0 w-full h-full object-cover hidden" />
                      </div>
                      <div className="bg-gray-200 rounded relative overflow-hidden">
                        <img src="" alt="" className="preview-image-1 absolute inset-0 w-full h-full object-cover hidden" />
                      </div>
                      <div className="bg-gray-200 rounded relative overflow-hidden">
                        <img src="" alt="" className="preview-image-2 absolute inset-0 w-full h-full object-cover hidden" />
                      </div>
                      <div className="bg-gray-200 rounded relative overflow-hidden">
                        <img src="" alt="" className="preview-image-3 absolute inset-0 w-full h-full object-cover hidden" />
                      </div>
                    </div>
                    <span className="text-xs">2x2 Grid (4-column)</span>
                  </Button>
                  
                  <Button 
                    variant={selectedTemplate === "centered" ? "default" : "outline"}
                    className="h-auto p-3 flex flex-col gap-2 aspect-video"
                    onClick={() => setSelectedTemplate("centered")}
                    data-template="centered"
                  >
                    <div className="w-full h-12 flex justify-center items-center">
                      <div className="w-2/3 h-full bg-gray-200 rounded relative overflow-hidden">
                        <img src="" alt="" className="preview-image-0 absolute inset-0 w-full h-full object-cover hidden" />
                      </div>
                    </div>
                    <span className="text-xs">Centered Image</span>
                  </Button>
                </div>

                <div className="border rounded-md p-4 space-y-4 mt-4">
                  <h3 className="font-medium text-base">Upload Images</h3>
                  
                  {/* Image placeholders for selected template */}
                  {selectedTemplate === "single" && (
                    <div className="space-y-3" data-template="single">
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden h-40"
                        onClick={() => triggerTemplateImagePicker(0)}
                      >
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleTemplateImageSelect(e, 0)}
                          accept="image/*"
                          ref={(el) => (multipleImageRefsRef.current[0] = el)}
                        />
                        
                        <div className="relative z-10 flex flex-col items-center">
                          <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 text-center">Select Image</p>
                        </div>
                        
                        <div className="absolute inset-0 bg-black/5">
                          <img src="" alt="" className="preview-image-0 w-full h-full object-contain opacity-50 hidden" />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedTemplate === "double" && (
                    <div className="space-y-3" data-template="double">
                      <div className="grid grid-cols-2 gap-2">
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden h-32"
                          onClick={() => triggerTemplateImagePicker(0)}
                        >
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleTemplateImageSelect(e, 0)}
                            accept="image/*"
                            ref={(el) => (multipleImageRefsRef.current[0] = el)}
                          />
                          
                          <div className="relative z-10 flex flex-col items-center">
                            <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500 text-center">1. Image</p>
                          </div>
                          
                          <div className="absolute inset-0 bg-black/5">
                            <img src="" alt="" className="preview-image-0 w-full h-full object-contain opacity-50 hidden" />
                          </div>
                        </div>
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden h-32"
                          onClick={() => triggerTemplateImagePicker(1)}
                        >
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleTemplateImageSelect(e, 1)}
                            accept="image/*"
                            ref={(el) => (multipleImageRefsRef.current[1] = el)}
                          />
                          
                          <div className="relative z-10 flex flex-col items-center">
                            <UploadCloud className="h-8 w-8 text-gray-400 mb-2" />
                            <p className="text-xs text-gray-500 text-center">2. Image</p>
                          </div>
                          
                          <div className="absolute inset-0 bg-black/5">
                            <img src="" alt="" className="preview-image-1 w-full h-full object-contain opacity-50 hidden" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedTemplate === "grid" && (
                    <div className="space-y-3" data-template="grid">
                      <div className="grid grid-cols-2 gap-2">
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden h-28"
                          onClick={() => triggerTemplateImagePicker(0)}
                        >
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleTemplateImageSelect(e, 0)}
                            accept="image/*"
                            ref={(el) => (multipleImageRefsRef.current[0] = el)}
                          />
                          
                          <div className="relative z-10 flex flex-col items-center">
                            <UploadCloud className="h-6 w-6 text-gray-400 mb-1" />
                            <p className="text-xs text-gray-500 text-center">1. Image</p>
                          </div>
                          
                          <div className="absolute inset-0 bg-black/5">
                            <img src="" alt="" className="preview-image-0 w-full h-full object-contain opacity-50 hidden" />
                          </div>
                        </div>
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden h-28"
                          onClick={() => triggerTemplateImagePicker(1)}
                        >
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleTemplateImageSelect(e, 1)}
                            accept="image/*"
                            ref={(el) => (multipleImageRefsRef.current[1] = el)}
                          />
                          
                          <div className="relative z-10 flex flex-col items-center">
                            <UploadCloud className="h-6 w-6 text-gray-400 mb-1" />
                            <p className="text-xs text-gray-500 text-center">2. Image</p>
                          </div>
                          
                          <div className="absolute inset-0 bg-black/5">
                            <img src="" alt="" className="preview-image-1 w-full h-full object-contain opacity-50 hidden" />
                          </div>
                        </div>
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden h-28"
                          onClick={() => triggerTemplateImagePicker(2)}
                        >
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleTemplateImageSelect(e, 2)}
                            accept="image/*"
                            ref={(el) => (multipleImageRefsRef.current[2] = el)}
                          />
                          
                          <div className="relative z-10 flex flex-col items-center">
                            <UploadCloud className="h-6 w-6 text-gray-400 mb-1" />
                            <p className="text-xs text-gray-500 text-center">3. Image</p>
                          </div>
                          
                          <div className="absolute inset-0 bg-black/5">
                            <img src="" alt="" className="preview-image-2 w-full h-full object-contain opacity-50 hidden" />
                          </div>
                        </div>
                        <div 
                          className="border-2 border-dashed border-gray-300 rounded-lg p-3 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden h-28"
                          onClick={() => triggerTemplateImagePicker(3)}
                        >
                          <input
                            type="file"
                            className="hidden"
                            onChange={(e) => handleTemplateImageSelect(e, 3)}
                            accept="image/*"
                            ref={(el) => (multipleImageRefsRef.current[3] = el)}
                          />
                          
                          <div className="relative z-10 flex flex-col items-center">
                            <UploadCloud className="h-6 w-6 text-gray-400 mb-1" />
                            <p className="text-xs text-gray-500 text-center">4. Image</p>
                          </div>
                          
                          <div className="absolute inset-0 bg-black/5">
                            <img src="" alt="" className="preview-image-3 w-full h-full object-contain opacity-50 hidden" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedTemplate === "centered" && (
                    <div className="space-y-3" data-template="centered">
                      <div 
                        className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors relative overflow-hidden h-40"
                        onClick={() => triggerTemplateImagePicker(0)}
                      >
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleTemplateImageSelect(e, 0)}
                          accept="image/*"
                          ref={(el) => (multipleImageRefsRef.current[0] = el)}
                        />
                        
                        <div className="relative z-10 flex flex-col items-center">
                          <UploadCloud className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500 text-center">Select Image</p>
                        </div>
                        
                        <div className="absolute inset-0 bg-black/5">
                          <img src="" alt="" className="preview-image-0 w-full h-full object-contain opacity-50 hidden" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4 py-2">
              <div className="flex flex-col items-center justify-center gap-4">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                  onClick={triggerImageFilePicker}
                >
                  <input
                    ref={imageUploadRef}
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      setSelectedImage(file);
                      setAltText(file.name.split('.')[0] || '');
                      
                      // Create preview
                      const reader = new FileReader();
                      reader.onload = () => {
                        setImagePreview(reader.result);
                      };
                      reader.readAsDataURL(file);
                    }}
                    accept="image/*"
                  />
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="mx-auto max-h-[200px] object-contain" 
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 mx-auto flex items-center"
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerImageFilePicker();
                        }}
                      >
                        Change Image
                      </Button>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 text-center">
                        Click to select or drag and drop the image
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        PNG, JPG, GIF (max. 5MB)
                      </p>
                    </>
                  )}
                </div>
                
                {imagePreview && (
                  <div className="w-full space-y-3">
                    <div className="space-y-1">
                      <Label htmlFor="altTextUpload">Alternative Text (Accessibility)</Label>
                      <Input 
                        id="altTextUpload" 
                        placeholder="Image description" 
                        value={altText}
                        onChange={(e) => setAltText(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label>Image Alignment</Label>
                      <div className="flex gap-2">
                        <Button 
                          type="button"
                          variant={alignment === "left" ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => setAlignment("left")}
                        >
                          <AlignLeft size={16} className="mr-2" /> Left
                        </Button>
                        <Button 
                          type="button"
                          variant={alignment === "center" ? "default" : "outline"}
                          className="flex-1"
                          onClick={() => setAlignment("center")}
                        >
                          <AlignCenter size={16} className="mr-2" /> Center
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="titleText">Image Title (Optional)</Label>
                      <Input 
                        id="titleText" 
                        placeholder="Title to show on hover" 
                        value={titleText || ""}
                        onChange={(e) => setTitleText(e.target.value)}
                      />
                      <p className="text-xs text-gray-500">
                        The image title will appear when you hover over the image.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="url" className="space-y-4 py-2">
              <div className="space-y-1">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input 
                  id="imageUrl" 
                  placeholder="https://example.com/image.jpg" 
                  value={imageUrl} 
                  onChange={(e) => setImageUrl(e.target.value)} 
                />
              </div>
                      
              <div className="space-y-1">
                <Label htmlFor="altTextUrl">Alternative Text</Label>
                <Input 
                  id="altTextUrl" 
                  placeholder="Image description" 
                  value={altText} 
                  onChange={(e) => setAltText(e.target.value)} 
                />
              </div>
                      
              <div className="space-y-1">
                <Label htmlFor="titleTextUrl">Image Title (Optional)</Label>
                <Input 
                  id="titleTextUrl" 
                  placeholder="Title to show on hover" 
                  value={titleText || ""}
                  onChange={(e) => setTitleText(e.target.value)}
                />
              </div>
              
              <div className="space-y-1">
                <Label>Image Alignment</Label>
                <div className="flex gap-2">
                  <Button 
                    type="button"
                    variant={alignment === "left" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setAlignment("left")}
                  >
                    <AlignLeft size={16} className="mr-2" /> Left
                  </Button>
                  <Button 
                    type="button"
                    variant={alignment === "center" ? "default" : "outline"}
                    className="flex-1"
                    onClick={() => setAlignment("center")}
                  >
                    <AlignCenter size={16} className="mr-2" /> Center
                  </Button>
                </div>
              </div>
              
              {imageUrl && (
                <div className="p-2 border rounded">
                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                  <div className={`flex ${
                    alignment === 'center' ? 'justify-center' : 'justify-start'
                  }`}>
                    <img 
                      src={imageUrl} 
                      alt={altText || "Preview"} 
                      className="max-h-[150px] object-contain" 
                      onError={(e) => e.target.src = 'https://placehold.co/600x400?text=Invalid+Image+URL'}
                      title={titleText || ""}
                    />
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsImageDialogOpen(false);
                setSelectedImage(null);
                setImagePreview("");
                setImageUrl("");
                setAltText("");
                setTitleText("");
                setAlignment("left");
                setSelectedTemplate("single");
                setMultipleImages([]);
              }}
            >
              Cancel
            </Button>
            
            {imageDialogTab === "template" ? (
              <Button 
                onClick={handleInsertTemplate}
                disabled={imageUploadLoading || 
                  (selectedTemplate === "single" && !multipleImages[0]) ||
                  (selectedTemplate === "double" && (!multipleImages[0] || !multipleImages[1])) ||
                  (selectedTemplate === "grid" && multipleImages.filter((img, i) => i < 4 && img).length < 1) ||
                  (selectedTemplate === "centered" && !multipleImages[0])
                }
              >
                {imageUploadLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : 'Add'}
              </Button>
            ) : (
              <Button 
                onClick={handleContentImageUpload}
                disabled={(!selectedImage && !imageUrl) || imageUploadLoading}
              >
                {imageUploadLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : 'Add'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Video embed dialog */}
      <Dialog open={isVideoDialogOpen} onOpenChange={setIsVideoDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add YouTube Video</DialogTitle>
            <DialogDescription>
              Paste or enter the YouTube video URL or ID.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleInsertVideo} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="videoUrl">YouTube Video URL or ID</Label>
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=VIDEO_ID"
              />
              <p className="text-xs text-gray-500">
                Paste or enter just the video ID (e.g. L8_98i_bMMA)
              </p>
            </div>
            
            <div className="p-2 border rounded">
              <p className="text-xs text-gray-500 mb-1">Preview:</p>
              <div className="aspect-video bg-gray-100 flex items-center justify-center">
                {videoUrl ? (
                  <div className="w-full">
                    <img 
                      src={`https://img.youtube.com/vi/${videoUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i)?.[1] || videoUrl}/maxresdefault.jpg`} 
                      alt="YouTube Video"
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        e.target.src = 'https://placehold.co/600x400?text=YouTube+Video+Preview';
                      }}
                    />
                    <div className="text-center mt-1 text-sm text-gray-700">YouTube Video</div>
                  </div>
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Enter YouTube video URL or ID</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Example: [![NextJS Font](https://img.youtube.com/vi/L8_98i_bMMA/maxresdefault.jpg)](https://www.youtube.com/watch?v=L8_98i_bMMA)
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setIsVideoDialogOpen(false);
                  setVideoUrl("");
                }}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={!videoUrl}>
                Add Video
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
} 