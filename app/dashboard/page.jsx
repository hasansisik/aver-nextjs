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
                <CardTitle>Client Example</CardTitle>
                <CardDescription>SEO with client components</CardDescription>
              </CardHeader>
              <CardContent>
                <p>View an example of a client component page with SEO settings integration.</p>
              </CardContent>
              <CardFooter>
                <Link 
                  href="/client-example" 
                  className="flex items-center text-blue-500 hover:underline"
                >
                  View Example <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </CardFooter>
            </Card>
            
            <div className="aspect-video rounded-xl bg-muted/50" />
          </div>
          <div className="min-h-[60vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
