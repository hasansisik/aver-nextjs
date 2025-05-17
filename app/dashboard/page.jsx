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
import { ArrowRight, Search, Wrench, Newspaper, Briefcase, BookText, Layout, Globe } from "lucide-react"

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
            <Link href="/dashboard/seo" className="block transition-transform hover:scale-[1.02]">
              <Card className="h-full cursor-pointer hover:border-black">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>SEO Settings</CardTitle>
                    <CardDescription>Manage SEO metadata for public pages</CardDescription>
                  </div>
                  <Search className="h-6 w-6 text-black" />
                </CardHeader>
                <CardContent>
                  <p>Configure titles, descriptions, and keywords for all public-facing pages.</p>
                </CardContent>
                <CardFooter>
                  <span className="flex items-center text-black">
                    Manage SEO <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
            
            <Link href="/dashboard/services" className="block transition-transform hover:scale-[1.02]">
              <Card className="h-full cursor-pointer hover:border-black">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Services</CardTitle>
                    <CardDescription>Manage services and their details</CardDescription>
                  </div>
                  <Wrench className="h-6 w-6 text-black" />
                </CardHeader>
                <CardContent>
                  <p>Create, edit, and delete services. Manage content blocks and features for each service.</p>
                </CardContent>
                <CardFooter>
                  <span className="flex items-center text-black">
                    Manage Services <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
            
            <Link href="/dashboard/blog" className="block transition-transform hover:scale-[1.02]">
              <Card className="h-full cursor-pointer hover:border-black">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Blog Posts</CardTitle>
                    <CardDescription>Manage blog posts and articles</CardDescription>
                  </div>
                  <Newspaper className="h-6 w-6 text-black" />
                </CardHeader>
                <CardContent>
                  <p>Create, edit, and publish blog posts. Manage categories and tags.</p>
                </CardContent>
                <CardFooter>
                  <span className="flex items-center text-black">
                    Manage Posts <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
            
            <Link href="/dashboard/project" className="block transition-transform hover:scale-[1.02]">
              <Card className="h-full cursor-pointer hover:border-black">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Projects</CardTitle>
                    <CardDescription>Manage portfolio projects</CardDescription>
                  </div>
                  <Briefcase className="h-6 w-6 text-black" />
                </CardHeader>
                <CardContent>
                  <p>Add, edit, and showcase your projects. Upload images and manage project details.</p>
                </CardContent>
                <CardFooter>
                  <span className="flex items-center text-black">
                    Manage Projects <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
            
            <Link href="/dashboard/glossary" className="block transition-transform hover:scale-[1.02]">
              <Card className="h-full cursor-pointer hover:border-black">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Glossary</CardTitle>
                    <CardDescription>Manage glossary terms</CardDescription>
                  </div>
                  <BookText className="h-6 w-6 text-black" />
                </CardHeader>
                <CardContent>
                  <p>Add and edit industry terms and definitions for your glossary section.</p>
                </CardContent>
                <CardFooter>
                  <span className="flex items-center text-black">
                    Manage Glossary <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
            
            <Link href="/dashboard/header" className="block transition-transform hover:scale-[1.02]">
              <Card className="h-full cursor-pointer hover:border-black">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Header</CardTitle>
                    <CardDescription>Manage website header</CardDescription>
                  </div>
                  <Layout className="h-6 w-6 text-black" />
                </CardHeader>
                <CardContent>
                  <p>Configure navigation menu, logo, and other header elements.</p>
                </CardContent>
                <CardFooter>
                  <span className="flex items-center text-black">
                    Edit Header <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
            
            <Link href="/dashboard/footer" className="block transition-transform hover:scale-[1.02]">
              <Card className="h-full cursor-pointer hover:border-black">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Footer</CardTitle>
                    <CardDescription>Manage website footer</CardDescription>
                  </div>
                  <Layout className="h-6 w-6 text-black" />
                </CardHeader>
                <CardContent>
                  <p>Edit footer content, links, social media icons, and contact information.</p>
                </CardContent>
                <CardFooter>
                  <span className="flex items-center text-black">
                    Edit Footer <ArrowRight className="h-4 w-4 ml-1" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
