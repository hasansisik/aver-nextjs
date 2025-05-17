import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from 'remark-gfm';

// Helper function to generate consistent IDs
const generateId = (children) => {
  return children
    .toString()
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, '-');
};

// Enhanced HTML-aware React component for image and div rendering
const CustomComponents = {
  // Handle HTML divs, preserving className and children
  div: ({ node, className, children, ...props }) => {
    // Handle grid layouts with specific CSS classes
    if (className && className.includes('image-grid')) {
      if (className.includes('grid-2')) {
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6" {...props}>
            {children}
          </div>
        );
      } else if (className.includes('grid-4')) {
        return (
          <div className="grid grid-cols-2 gap-4 my-6" {...props}>
            {children}
          </div>
        );
      }
    }
    // Default div rendering
    return <div className={className} {...props}>{children}</div>;
  },
  
  // Custom image component to handle alignment attributes
  img: ({ node, src, alt, title, ...props }) => {
    const alignCenter = props.className && props.className.includes('center');
    
    if (alignCenter) {
      return (
        <div className="flex justify-center my-4">
          <img src={src} alt={alt || ''} title={title} className="max-w-full h-auto rounded" />
        </div>
      );
    }
    
    return <img src={src} alt={alt || ''} title={title} className="my-4 max-w-full h-auto rounded" />;
  },
  
  // Add IDs to headings for navigation
  h1: ({ node, children, ...props }) => {
    const id = generateId(children);
    return <h1 id={id} {...props}>{children}</h1>;
  },
  h2: ({ node, children, ...props }) => {
    const id = generateId(children);
    return <h2 id={id} {...props}>{children}</h2>;
  },
  h3: ({ node, children, ...props }) => {
    const id = generateId(children);
    return <h3 id={id} {...props}>{children}</h3>;
  },
  h4: ({ node, children, ...props }) => {
    const id = generateId(children);
    return <h4 id={id} {...props}>{children}</h4>;
  }
};

const Markdown = ({ content, inline }) => {
  if (inline) {
    CustomComponents.p = React.Fragment;
  }
  
  return (
    <ReactMarkdown
      components={CustomComponents}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
    >
      {content}
    </ReactMarkdown>
  );
};

export default Markdown;
