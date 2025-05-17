import { AppSidebar } from "@/app/_components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/app/_components/ui/breadcrumb"
import { Separator } from "@/app/_components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/app/_components/ui/sidebar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/app/_components/ui/card"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Page() {
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
                <BreadcrumbItem>
                  <BreadcrumbPage>Dashboard</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>SEO Settings</CardTitle>
                <CardDescription>Manage SEO metadata for public pages</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Configure titles, descriptions, and keywords for all public-facing pages.</p>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/dashboard/seo" 
                  className="flex items-center text-blue-500 hover:underline"
                >
                  Manage SEO <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Services</CardTitle>
                <CardDescription>Manage services and their details</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Create, edit, and delete services. Manage content blocks and features for each service.</p>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/dashboard/services" 
                  className="flex items-center text-blue-500 hover:underline"
                >
                  Manage Services <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Blog Posts</CardTitle>
                <CardDescription>Manage blog posts and articles</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Create, edit, and publish blog posts. Manage categories and tags.</p>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/dashboard/blog" 
                  className="flex items-center text-blue-500 hover:underline"
                >
                  Manage Posts <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Projects</CardTitle>
                <CardDescription>Manage portfolio projects</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Add, edit, and showcase your projects. Upload images and manage project details.</p>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/dashboard/project" 
                  className="flex items-center text-blue-500 hover:underline"
                >
                  Manage Projects <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Glossary</CardTitle>
                <CardDescription>Manage glossary terms</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Add and edit industry terms and definitions for your glossary section.</p>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/dashboard/glossary" 
                  className="flex items-center text-blue-500 hover:underline"
                >
                  Manage Glossary <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Header</CardTitle>
                <CardDescription>Manage website header</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Configure navigation menu, logo, and other header elements.</p>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/dashboard/header" 
                  className="flex items-center text-blue-500 hover:underline"
                >
                  Edit Header <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Footer</CardTitle>
                <CardDescription>Manage website footer</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Edit footer content, links, social media icons, and contact information.</p>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/dashboard/footer" 
                  className="flex items-center text-blue-500 hover:underline"
                >
                  Edit Footer <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
          </div>
          <div className="min-h-[60vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
