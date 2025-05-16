"use client";

import * as React from "react";
import { Fragment, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Icons } from "@/app/_components/icons";
import {
  AlertCircle,
  FolderKanban,
  Home,
  Image,
  Settings,
  PanelLeft,
  FileText,
  PanelRight,
  Footprints,
  FileStack,
  Briefcase,
  PanelTop,
} from "lucide-react";

export function Navigation({ className, children }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className="group flex flex-col gap-4 py-2 data-[collapsed=true]:py-2">
      <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-x-2 rounded-lg py-3 px-3 text-sm font-medium hover:bg-primary/10 dark:hover:bg-primary/90 text-white hover:text-white",
            pathname === "/dashboard" ? "bg-primary" : "transparent",
            "group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:rounded-lg group-[[data-collapsed=true]]:p-2"
          )}
        >
          <Home className="h-5 w-5" />
          <span className="group-[[data-collapsed=true]]:hidden">
            Gösterge paneli
          </span>
        </Link>

        <Link
          href="/dashboard/blog"
          className={cn(
            "flex items-center gap-x-2 rounded-lg py-3 px-3 text-sm font-medium hover:bg-primary/10 dark:hover:bg-primary/90 text-white hover:text-white",
            pathname.includes("/dashboard/blog") ? "bg-primary" : "transparent",
            "group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:rounded-lg group-[[data-collapsed=true]]:p-2"
          )}
        >
          <FileText className="h-5 w-5" />
          <span className="group-[[data-collapsed=true]]:hidden">Blog</span>
        </Link>

        <Link
          href="/dashboard/project"
          className={cn(
            "flex items-center gap-x-2 rounded-lg py-3 px-3 text-sm font-medium hover:bg-primary/10 dark:hover:bg-primary/90 text-white hover:text-white",
            pathname.includes("/dashboard/project") ? "bg-primary" : "transparent",
            "group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:rounded-lg group-[[data-collapsed=true]]:p-2"
          )}
        >
          <Briefcase className="h-5 w-5" />
          <span className="group-[[data-collapsed=true]]:hidden">Projeler</span>
        </Link>

        <Link
          href="/dashboard/header"
          className={cn(
            "flex items-center gap-x-2 rounded-lg py-3 px-3 text-sm font-medium hover:bg-primary/10 dark:hover:bg-primary/90 text-white hover:text-white",
            pathname.includes("/dashboard/header") ? "bg-primary" : "transparent",
            "group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:rounded-lg group-[[data-collapsed=true]]:p-2"
          )}
        >
          <PanelTop className="h-5 w-5" />
          <span className="group-[[data-collapsed=true]]:hidden">Üst Kısım</span>
        </Link>

        <Link
          href="/dashboard/footer"
          className={cn(
            "flex items-center gap-x-2 rounded-lg py-3 px-3 text-sm font-medium hover:bg-primary/10 dark:hover:bg-primary/90 text-white hover:text-white",
            pathname.includes("/dashboard/footer") ? "bg-primary" : "transparent",
            "group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:rounded-lg group-[[data-collapsed=true]]:p-2"
          )}
        >
          <Footprints className="h-5 w-5" />
          <span className="group-[[data-collapsed=true]]:hidden">Alt Kısım</span>
        </Link>

        <Link
          href="/dashboard/settings"
          className={cn(
            "flex items-center gap-x-2 rounded-lg py-3 px-3 text-sm font-medium hover:bg-primary/10 dark:hover:bg-primary/90 text-white hover:text-white",
            pathname.includes("/dashboard/settings") ? "bg-primary" : "transparent",
            "group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:rounded-lg group-[[data-collapsed=true]]:p-2"
          )}
        >
          <Settings className="h-5 w-5" />
          <span className="group-[[data-collapsed=true]]:hidden">Ayarlar</span>
        </Link>
      </nav>
    </div>
  );
} 