import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from 'remark-gfm';

const Markdown = ({ content, inline }) => (
  <ReactMarkdown
    components={{ 
      p: inline ? React.Fragment : "p",
      h2: ({ node, children, ...props }) => {
        const id = children
          .toString()
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '-');
        
        return <h2 id={id} {...props}>{children}</h2>;
      },
      h3: ({ node, children, ...props }) => {
        const id = children
          .toString()
          .toLowerCase()
          .replace(/[^\w\s]/g, '')
          .replace(/\s+/g, '-');
        
        return <h3 id={id} {...props}>{children}</h3>;
      }
    }}
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeRaw]}
  >
    {content}
  </ReactMarkdown>
);
export default Markdown;
