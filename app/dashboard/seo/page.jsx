"use client"

import { useState, useEffect } from "react"
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
import { AlertCircle, Check } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/_components/ui/breadcrumb"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/app/_components/ui/sidebar"
import { AppSidebar } from "@/app/_components/app-sidebar"

// Mock data structure for SEO settings
const DEFAULT_PAGES = [
  { id: "home", name: "Home", path: "/" },
  { id: "about", name: "About", path: "/about" },
  { id: "blog", name: "Blog", path: "/blog" },
  { id: "contact", name: "Contact", path: "/contact" },
  { id: "privacy", name: "Privacy", path: "/privacy" },
  { id: "project", name: "Project", path: "/project" }
]

export default function SEOSettings() {
  const [activeTab, setActiveTab] = useState("home")
  const [pages, setPages] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  // Alert state
  const [showAlert, setShowAlert] = useState(false)
  const [alertType, setAlertType] = useState("success")
  const [alertMessage, setAlertMessage] = useState("")

  // Load pages from API
  useEffect(() => {
    const fetchSeoSettings = async () => {
      try {
        const response = await fetch('/api/seo')
        if (!response.ok) {
          throw new Error('Failed to fetch SEO settings')
        }
        const data = await response.json()
        setPages(data)
      } catch (error) {
        console.error("Failed to load SEO settings:", error)
        setAlertType("error")
        setAlertMessage("Failed to load SEO settings. Please refresh the page.")
        setShowAlert(true)
      } finally {
        setLoading(false)
      }
    }
    
    fetchSeoSettings()
  }, [])

  // Auto-hide alert after 3 seconds
  useEffect(() => {
    if (showAlert) {
      const timeout = setTimeout(() => {
        setShowAlert(false)
      },
      3000)
      
      return () => clearTimeout(timeout)
    }
  }, [showAlert])

  const updatePageSeo = (pageId, field, value) => {
    setPages(prevPages => 
      prevPages.map(page => 
        page.id === pageId 
          ? { ...page, [field]: value } 
          : page
      )
    )
  }

  const saveSettings = async () => {
    setSaving(true)
    
    try {
      const response = await fetch('/api/seo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pages),
      })
      
      if (!response.ok) {
        throw new Error('Failed to save SEO settings')
      }
      
      setAlertType("success")
      setAlertMessage("SEO settings have been saved successfully")
      setShowAlert(true)
    } catch (error) {
      console.error("Error saving settings:", error)
      setAlertType("error")
      setAlertMessage("Failed to save settings. Please try again.")
      setShowAlert(true)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>SEO Settings</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>
          <div className="flex flex-1 flex-col items-center justify-center">
            <p>Loading SEO settings...</p>
          </div>
        </SidebarInset>
      </SidebarProvider>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>SEO Settings</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        
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
          
          <Card>
            <CardHeader>
              <CardTitle>SEO Settings</CardTitle>
              <CardDescription>
                Manage SEO metadata for public pages. These settings will override the default metadata.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="mb-6 grid grid-cols-3 sm:grid-cols-6">
                  {pages.map(page => (
                    <TabsTrigger key={page.id} value={page.id}>
                      {page.name}
                    </TabsTrigger>
                  ))}
                </TabsList>
                
                {pages.map(page => (
                  <TabsContent key={page.id} value={page.id} className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor={`${page.id}-title`}>Page Title</Label>
                      <Input
                        id={`${page.id}-title`}
                        value={page.title || ""}
                        onChange={(e) => updatePageSeo(page.id, "title", e.target.value)}
                        placeholder={`${page.name} - Default Title`}
                      />
                      <p className="text-sm text-gray-500">
                        Displayed in browser tabs and search results
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor={`${page.id}-description`}>Meta Description</Label>
                      <Textarea
                        id={`${page.id}-description`}
                        value={page.description || ""}
                        onChange={(e) => updatePageSeo(page.id, "description", e.target.value)}
                        placeholder="Enter a concise description (150-160 characters recommended)"
                        rows={3}
                      />
                      <p className="text-sm text-gray-500">
                        Appears in search engine results
                      </p>
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor={`${page.id}-keywords`}>Keywords</Label>
                      <Input
                        id={`${page.id}-keywords`}
                        value={page.keywords || ""}
                        onChange={(e) => updatePageSeo(page.id, "keywords", e.target.value)}
                        placeholder="e.g. portfolio, design, creative (comma separated)"
                      />
                      <p className="text-sm text-gray-500">
                        Add relevant keywords separated by commas
                      </p>
                    </div>
                    
                    <div className="pt-2">
                      <p className="text-sm">
                        Page Path: <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">{page.path}</code>
                      </p>
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={saveSettings} disabled={saving}>
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
} 