"use client"

import { useState, useEffect, useRef } from "react"
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/app/_components/ui/card"
import { Button } from "@/app/_components/ui/button"
import { Input } from "@/app/_components/ui/input"
import { Label } from "@/app/_components/ui/label"
import { Textarea } from "@/app/_components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/_components/ui/tabs"
import { Separator } from "@/app/_components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/app/_components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/app/_components/ui/dialog"
import { 
  AlertCircle, 
  Check, 
  Edit, 
  Trash2, 
  Plus, 
  ImageIcon, 
  Heading1, 
  Heading2, 
  List, 
  ListOrdered, 
  Bold, 
  Italic, 
  Link2, 
  Image as ImageIcon2, 
  Code, 
  UploadCloud,
  Loader2
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { getServices, createService, updateService, deleteService } from "@/redux/actions/serviceActions"
import Link from "next/link"
import { uploadImageToCloudinary } from "../../../utils/cloudinary"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/_components/ui/alert-dialog"

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

export default function ServicesManager() {
  const router = useRouter()
  const dispatch = useDispatch()
  const { services, loading, error } = useSelector((state) => state.service)
  
  const [activeTab, setActiveTab] = useState("list")
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "",
    image: "",
    markdownContent: "",
    features: [],
    isPublished: false
  })
  const [featureInput, setFeatureInput] = useState("")
  const [editMode, setEditMode] = useState(false)
  const [currentServiceId, setCurrentServiceId] = useState(null)
  
  // Markdown editor state
  const [markdownEditorTab, setMarkdownEditorTab] = useState("edit")
  
  // File upload states
  const [uploading, setUploading] = useState(false)
  const [uploadType, setUploadType] = useState(null)
  
  // Alert state
  const [showAlert, setShowAlert] = useState(false)
  const [alertType, setAlertType] = useState("success")
  const [alertMessage, setAlertMessage] = useState("")

  // Add dialog state
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)
  const [imageUploadLoading, setImageUploadLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const imageUploadRef = useRef(null)

  // Add the state variables for AlertDialog
  const [deleteAlertOpen, setDeleteAlertOpen] = useState(false)
  const [serviceToDelete, setServiceToDelete] = useState(null)

  // Load services from API
  useEffect(() => {
    dispatch(getServices())
  }, [dispatch])

  // Auto-hide alert after 3 seconds
  useEffect(() => {
    if (showAlert) {
      const timeout = setTimeout(() => {
        setShowAlert(false)
      }, 3000)
      
      return () => clearTimeout(timeout)
    }
  }, [showAlert])

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      icon: "",
      image: "",
      markdownContent: "",
      features: [],
      isPublished: false
    })
    setFeatureInput("")
    setEditMode(false)
    setCurrentServiceId(null)
    setMarkdownEditorTab("edit")
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleAddFeature = (e) => {
    e.preventDefault()
    if (!featureInput.trim()) return
    
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, { title: featureInput }]
    }))
    
    setFeatureInput("")
  }

  const handleRemoveFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }))
  }

  const handleEditService = (service) => {
    setFormData({
      title: service.title || "",
      description: service.description || "",
      icon: service.icon || "",
      image: service.image || "",
      markdownContent: service.markdownContent || "",
      features: service.features || [],
      isPublished: service.isPublished || false
    })
    setEditMode(true)
    setCurrentServiceId(service._id)
    setActiveTab("add")
  }

  const confirmDeleteService = (serviceId) => {
    setServiceToDelete(serviceId)
    setDeleteAlertOpen(true)
  }

  const handleDeleteService = async () => {
    if (serviceToDelete) {
      try {
        await dispatch(deleteService(serviceToDelete))
        setAlertType("success")
        setAlertMessage("Service deleted successfully")
        setShowAlert(true)
      } catch (error) {
        setAlertType("error")
        setAlertMessage("Failed to delete service. Please try again.")
        setShowAlert(true)
      }
      setServiceToDelete(null)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const serviceData = {
        ...formData,
        features: formData.features.map(feature => ({ title: feature.title }))
      }
      
      if (editMode) {
        await dispatch(updateService({
          serviceId: currentServiceId,
          ...serviceData
        }))
        setAlertType("success")
        setAlertMessage("Service updated successfully")
      } else {
        await dispatch(createService(serviceData))
        setAlertType("success")
        setAlertMessage("Service created successfully")
      }
      
      setShowAlert(true)
      resetForm()
      setActiveTab("list")
    } catch (error) {
      setAlertType("error")
      setAlertMessage(editMode 
        ? "Failed to update service. Please try again." 
        : "Failed to create service. Please try again.")
      setShowAlert(true)
    }
  }

  // Upload file to Cloudinary
  const uploadFileToCloudinary = async (file, fileType) => {
    setUploading(true)
    setUploadType(fileType)
    
    try {
      const uploadedUrl = await uploadImageToCloudinary(file);
      
      setFormData(prev => ({
        ...prev,
        [fileType]: uploadedUrl
      }))
      
      setAlertType("success")
      setAlertMessage(`${fileType === 'icon' ? 'Icon' : 'Image'} uploaded successfully`)
      setShowAlert(true)
    } catch (error) {
      console.error('Upload error:', error)
      setAlertType("error")
      setAlertMessage(`Failed to upload ${fileType === 'icon' ? 'icon' : 'image'}. Please try again.`)
      setShowAlert(true)
    } finally {
      setUploading(false)
      setUploadType(null)
    }
  }

  // File input change handler
  const handleFileInputChange = (e, fileType) => {
    const file = e.target.files[0]
    if (!file) return
    
    uploadFileToCloudinary(file, fileType)
  }

  // Insert markdown syntax at cursor position or replace selected text
  const insertMarkdown = (syntax, placeholder) => {
    const textarea = document.getElementById('markdownContent')
    if (!textarea) return
    
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = formData.markdownContent.substring(start, end)
    const beforeText = formData.markdownContent.substring(0, start)
    const afterText = formData.markdownContent.substring(end)
    
    let newText
    if (selectedText) {
      // If text is selected, wrap it with the syntax
      newText = `${beforeText}${syntax.replace('$1', selectedText)}${afterText}`
    } else {
      // If no text is selected, insert syntax with placeholder
      newText = `${beforeText}${syntax.replace('$1', placeholder)}${afterText}`
    }
    
    setFormData(prev => ({
      ...prev,
      markdownContent: newText
    }))
    
    // Set focus back to textarea and position cursor appropriately
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = start + (placeholder ? start === end ? syntax.indexOf('$1') + placeholder.length : selectedText.length : syntax.length)
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  // Handle file selection for image dialog
  const handleImageFileSelect = (e) => {
    const file = e.target.files[0]
    if (!file) {
      setSelectedImage(null)
      setImagePreview("")
      return
    }
    
    setSelectedImage(file)
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
    }
    reader.readAsDataURL(file)
  }
  
  // Handle image upload from dialog
  const handleImageUpload = async () => {
    if (!selectedImage) return
    
    setImageUploadLoading(true)
    
    try {
      const uploadedUrl = await uploadImageToCloudinary(selectedImage)
      
      // Insert the image URL into the markdown content
      insertMarkdown('![$1](' + uploadedUrl + ')', 'Image description')
      
      // Close the dialog
      setIsImageDialogOpen(false)
      setSelectedImage(null)
      setImagePreview("")
      
      setAlertType("success")
      setAlertMessage("Image uploaded and inserted successfully")
      setShowAlert(true)
    } catch (error) {
      console.error('Image upload error:', error)
      setAlertType("error")
      setAlertMessage("Failed to upload image. Please try again.")
      setShowAlert(true)
    } finally {
      setImageUploadLoading(false)
    }
  }
  
  // Open file picker dialog when clicking Browse button
  const triggerImageFilePicker = () => {
    if (imageUploadRef.current) {
      imageUploadRef.current.click()
    }
  }

  if (loading && services.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center">
        <p>Loading services...</p>
      </div>
    )
  }

  return (
    <div className="container py-4">
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
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Services Management</h1>
        <p className="text-muted-foreground">Create and manage your services. Add content, features, and more.</p>
      </div>

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="mb-6 grid grid-cols-2 w-[400px]">
          <TabsTrigger value="list">Services List</TabsTrigger>
          <TabsTrigger value="add">Add Service</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="space-y-4">
          {services.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-md border">
              <p className="mb-4">No services found</p>
              <Button onClick={() => setActiveTab("add")}>
                <Plus className="mr-2 h-4 w-4" /> Create First Service
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {services.map(service => (
                <Card key={service._id} className="overflow-hidden">
                  <div 
                    className="h-32 bg-gray-100 dark:bg-gray-800 flex items-center justify-center"
                    style={{
                      backgroundImage: service.image ? `url(${service.image})` : 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {!service.image && (
                      <ImageIcon className="h-12 w-12 text-gray-400" />
                    )}
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{service.title}</CardTitle>
                        <CardDescription className="line-clamp-2 mt-1">
                          {service.description || "No description"}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => confirmDeleteService(service._id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <div className="text-xs">
                      {service.isPublished ? (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          Published
                        </span>
                      ) : (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                          Draft
                        </span>
                      )}
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link href={`/services/${service.slug}`}>
                      Preview
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="add" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{editMode ? "Edit Service" : "Add Service"}</CardTitle>
              <CardDescription>
                {editMode ? "Update the service information" : "Create a new service"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <Label htmlFor="title">Service Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Enter service title"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="description">Short Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Enter a brief description of the service"
                      rows={3}
                    />
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-1">
                      <Label htmlFor="icon">Icon</Label>
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="relative"
                            disabled={uploading && uploadType === 'icon'}
                          >
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => handleFileInputChange(e, 'icon')}
                              accept="image/*"
                            />
                            {uploading && uploadType === 'icon' ? "Uploading..." : "Upload Icon"}
                            <UploadCloud className="ml-2 h-4 w-4" />
                          </Button>
                          {formData.icon && (
                            <div className="text-sm text-green-600 flex items-center gap-1">
                              <Check className="h-4 w-4" /> Uploaded
                            </div>
                          )}
                        </div>
                        {formData.icon && (
                          <div className="mt-2 flex items-center justify-between">
                            <img 
                              src={formData.icon} 
                              alt="Icon Preview" 
                              className="h-12 w-12 object-contain rounded border bg-white p-1" 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => setFormData(prev => ({ ...prev, icon: "" }))}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="image">Cover Image</Label>
                      <div>
                        <div className="flex items-center gap-4 mb-2">
                          <Button
                            type="button"
                            variant="outline"
                            className="relative"
                            disabled={uploading && uploadType === 'image'}
                          >
                            <input
                              type="file"
                              className="absolute inset-0 opacity-0 cursor-pointer"
                              onChange={(e) => handleFileInputChange(e, 'image')}
                              accept="image/*"
                            />
                            {uploading && uploadType === 'image' ? "Uploading..." : "Upload Image"}
                            <UploadCloud className="ml-2 h-4 w-4" />
                          </Button>
                          {formData.image && (
                            <div className="text-sm text-green-600 flex items-center gap-1">
                              <Check className="h-4 w-4" /> Uploaded
                            </div>
                          )}
                        </div>
                        {formData.image && (
                          <div className="mt-2 flex items-center justify-between">
                            <img 
                              src={formData.image} 
                              alt="Image Preview" 
                              className="h-16 w-28 object-cover rounded border" 
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => setFormData(prev => ({ ...prev, image: "" }))}
                            >
                              Remove
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="features">Features</Label>
                    <div className="flex space-x-2">
                      <Input
                        id="featureInput"
                        value={featureInput}
                        onChange={(e) => setFeatureInput(e.target.value)}
                        placeholder="Enter a feature"
                      />
                      <Button 
                        type="button" 
                        onClick={handleAddFeature}
                        className="whitespace-nowrap"
                      >
                        Add Feature
                      </Button>
                    </div>
                    
                    {formData.features.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {formData.features.map((feature, index) => (
                          <div 
                            key={index}
                            className="flex justify-between items-center p-2 bg-gray-50 rounded"
                          >
                            <span>{feature.title}</span>
                            <Button 
                              type="button" 
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveFeature(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="markdownContent">Full Content (Markdown)</Label>
                    <div className="border rounded-md overflow-hidden">
                      <div className="bg-gray-50 p-2 border-b flex flex-wrap gap-1">
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => insertMarkdown('# $1', 'Heading')}
                          title="Heading 1"
                        >
                          <Heading1 size={16} />
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => insertMarkdown('## $1', 'Subheading')}
                          title="Heading 2"
                        >
                          <Heading2 size={16} />
                        </Button>
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
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => insertMarkdown('- $1', 'List item')}
                          title="Bullet List"
                        >
                          <List size={16} />
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => insertMarkdown('1. $1', 'List item')}
                          title="Numbered List"
                        >
                          <ListOrdered size={16} />
                        </Button>
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
                          title="Upload and Insert Image"
                        >
                          <ImageIcon2 size={16} />
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={() => insertMarkdown('`$1`', 'code')}
                          title="Code"
                        >
                          <Code size={16} />
                        </Button>
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
                            id="markdownContent"
                            name="markdownContent"
                            value={formData.markdownContent}
                            onChange={handleInputChange}
                            className="min-h-[300px] border-0 rounded-none font-mono resize-y"
                            placeholder="Enter full service content in Markdown format"
                          />
                        </TabsContent>
                        
                        <TabsContent value="preview" className="m-0">
                          <MarkdownPreview content={formData.markdownContent} />
                        </TabsContent>
                      </Tabs>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      Use Markdown syntax for formatting. Include headings (#), lists (- or 1.), and emphasis (* or **).
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-4">
                    <input
                      type="checkbox"
                      id="isPublished"
                      name="isPublished"
                      checked={formData.isPublished}
                      onChange={handleInputChange}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="isPublished">Publish this service</Label>
                  </div>
                  
                  <div className="pt-6 flex justify-between">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                    >
                      {editMode ? "Cancel Edit" : "Reset"}
                    </Button>
                    <Button type="submit">
                      {editMode ? "Update Service" : "Create Service"}
                    </Button>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Image upload dialog */}
      <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upload Image</DialogTitle>
            <DialogDescription>
              Upload an image to include in your content. The image will be inserted at the cursor position.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="flex flex-col items-center justify-center gap-4">
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 w-full flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                onClick={triggerImageFilePicker}
              >
                <input
                  ref={imageUploadRef}
                  type="file"
                  className="hidden"
                  onChange={handleImageFileSelect}
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
                      onClick={triggerImageFilePicker}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="h-12 w-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      Click to browse or drag and drop
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setIsImageDialogOpen(false)
                setSelectedImage(null)
                setImagePreview("")
              }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleImageUpload}
              disabled={!selectedImage || imageUploadLoading}
            >
              {imageUploadLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : 'Upload & Insert'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteAlertOpen} onOpenChange={setDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this service?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The service will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setServiceToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteService} className="bg-red-600 focus:ring-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
} 