"use client";

import { useEffect, useState } from "react";
import Markdown from "@/app/_components/ReactMarkdown";

export default function ServiceClient({ markdownContent }) {
  const [content, setContent] = useState(markdownContent || "");

  useEffect(() => {
    setContent(markdownContent || "");
  }, [markdownContent]);

  if (!content) {
    return (
      <div className="text-center py-6 text-gray-500">
        No content available for this service yet.
      </div>
    );
  }

  return (
    <div className="content content-light">
      <Markdown content={content} />
    </div>
  );
} 