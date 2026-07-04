import React, { useState, useEffect } from 'react';

export default function About() {
  const headingText = "About Us";
  const paragraphText = "Welcome to your digital asset and transaction tracker. Securely monitor logs, manage debit/credit balance sheets, and audit entries seamlessly. This platform provides real-time financial updates and data security at its core.";

  const [displayedHeading, setDisplayedHeading] = useState("");
  const [displayedParagraph, setDisplayedParagraph] = useState("");

  useEffect(() => {
    // Reset inputs on component mount
    setDisplayedHeading("");
    setDisplayedParagraph("");

    let headingIndex = 0;
    let paragraphIndex = 0;
    let headingTimer;
    let paragraphTimer;

    // Heading Typewriter
    headingTimer = setInterval(() => {
      if (headingIndex < headingText.length) {
        
        headingIndex++;
        setDisplayedHeading(headingText.slice(0, headingIndex));
      } else {
        clearInterval(headingTimer);
        
        // Paragraph Typewriter starts after heading finishes
        paragraphTimer = setInterval(() => {
          if (paragraphIndex < paragraphText.length) {
            
            paragraphIndex++;
            setDisplayedParagraph(paragraphText.slice(0, paragraphIndex));
          } else {
            clearInterval(paragraphTimer);
          }
        }, 20); // Fast typing for paragraph
      }
    }, 60); // Heading typing speed

    return () => {
      clearInterval(headingTimer);
      clearInterval(paragraphTimer);
    };
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen flex flex-col justify-center px-4 select-text">
      {/* Heading Section */}
      <h1 className="text-5xl font-bold text-zinc-900 mb-4 tracking-tight min-h-[40px] flex items-center">
        {displayedHeading}
        {displayedHeading.length < headingText.length && (
          <span className="animate-pulse bg-zinc-900 ml-1 inline-block w-0.5 h-7"></span>
        )}
      </h1>

      {/* Paragraph Section */}
      <p className="text-zinc-600 leading-relaxed text-base font-normal min-h-[120px]">
        {displayedParagraph}
        {displayedHeading.length === headingText.length && displayedParagraph.length < paragraphText.length && (
          <span className="animate-pulse bg-zinc-500 ml-0.5 inline-block w-0.5 h-4"></span>
        )}
      </p>
    </div>
  );
}