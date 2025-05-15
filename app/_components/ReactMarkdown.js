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

const Markdown = ({ content, inline }) => {
  console.log("Rendering markdown content:", content?.substring(0, 100) + "...");
  
  return (
    <ReactMarkdown
      components={{ 
        p: inline ? React.Fragment : "p",
        h1: ({ node, children, ...props }) => {
          const id = generateId(children);
          console.log("Rendering h1:", children, "with ID:", id);
          return <h1 id={id} {...props}>{children}</h1>;
        },
        h2: ({ node, children, ...props }) => {
          const id = generateId(children);
          console.log("Rendering h2:", children, "with ID:", id);
          return <h2 id={id} {...props}>{children}</h2>;
        },
        h3: ({ node, children, ...props }) => {
          const id = generateId(children);
          console.log("Rendering h3:", children, "with ID:", id);
          return <h3 id={id} {...props}>{children}</h3>;
        },
        h4: ({ node, children, ...props }) => {
          const id = generateId(children);
          return <h4 id={id} {...props}>{children}</h4>;
        }
      }}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
    >
      {content}
    </ReactMarkdown>
  );
};

export default Markdown;
