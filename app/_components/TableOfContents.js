"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

const TableOfContents = ({ content }) => {
  const [headings, setHeadings] = useState([]);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    // Extract headings from markdown content
    const extractHeadings = () => {
      console.log("Extracting headings from content:", content);
      
      // Modified regex to catch more heading formats, both with and without spaces after #
      const headingRegex = /^(#{2,3})\s*(.+)$/gm;
      const matches = [...content.matchAll(headingRegex)];
      
      console.log("Heading matches found:", matches.length);
      
      return matches.map((match, index) => {
        const level = match[1].length; // Count # symbols for level
        const text = match[2];
        const id = text.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, '-');
        
        console.log(`Heading ${index+1}: Level ${level}, Text: ${text}, ID: ${id}`);
        
        return { id, text, level };
      });
    };

    setHeadings(extractHeadings());
  }, [content]);

  useEffect(() => {
    if (headings.length === 0) return;

    // Set up intersection observer to highlight active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: '0px 0px -80% 0px' }
    );

    // Create a function to add IDs to headers if they don't exist
    const ensureHeadersHaveIds = () => {
      headings.forEach(({ id, text }) => {
        const headersWithText = Array.from(document.querySelectorAll('h2, h3')).filter(el => 
          el.textContent.trim() === text.trim()
        );
        
        headersWithText.forEach(header => {
          if (!header.id) {
            header.id = id;
          }
        });
      });
    };

    // First ensure all headers have IDs
    ensureHeadersHaveIds();

    // Then observe them
    headings.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => {
      headings.forEach(({ id }) => {
        const element = document.getElementById(id);
        if (element) observer.unobserve(element);
      });
    };
  }, [headings]);

  const scrollToHeader = (id, e) => {
    e.preventDefault();
    const element = document.getElementById(id);
    
    if (element) {
      // Set a small timeout to ensure DOM is ready
      setTimeout(() => {
        const offset = 100; // Offset in pixels from the top
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        window.scrollTo({
          top: elementPosition - offset,
          behavior: 'smooth'
        });
        setActiveId(id);
      }, 50);
    }
  };

  if (headings.length === 0) {
    console.log("No headings found, TableOfContents will not render");
    return null;
  }

  console.log("Rendering TableOfContents with", headings.length, "headings");

  return (
    <div className="sticky top-8 bg-transparent backdrop-blur-sm rounded-lg p-5">
      <h3 className="text-lg font-medium mb-4 text-white">İçindekiler</h3>
      <ul className="space-y-0 text-sm">
        {headings.map((heading, index) => (
          <li 
            key={heading.id} 
            className={`${heading.level === 3 ? 'ml-4' : ''} ${
              index !== headings.length - 1 ? 'border-b border-white/20' : ''
            }`}
          >
            <Link
              href={`#${heading.id}`}
              className={`block py-3 hover:text-primary transition-colors ${
                activeId === heading.id 
                  ? 'text-primary font-medium' 
                  : 'text-white'
              }`}
              onClick={(e) => scrollToHeader(heading.id, e)}
            >
              {heading.text}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TableOfContents; 