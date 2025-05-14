import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from 'remark-gfm';

const Markdown = ({ content, inline }) => (
  <ReactMarkdown
    components={{ p: inline ? React.Fragment : "p" }}
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeRaw]}
  >
    {content}
  </ReactMarkdown>
);
export default Markdown;
