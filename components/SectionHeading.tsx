import React from 'react';

interface SectionHeadingProps {
  label: string;
  title: string;
  id?: string;
}

const SectionHeading: React.FC<SectionHeadingProps> = ({ label, title, id }) => {
  const headingId = id || `${title.toLowerCase()}-heading`;
  
  return (
    <div className="flex flex-col">
      <h3 className="font-semibold text-xs sm:text-sm tracking-[6px] sm:tracking-[10px] md:text-xl">
        {label}
      </h3>
      <h2 
        id={headingId}
        className="font-times font-bold text-outline text-4xl sm:text-6xl md:text-7xl lg:text-8xl"
      >
        {Array.from(title).map((letter, index) => (
          <span 
            key={index}
            className={`letter-shadow-r ${index > 0 ? '-ml-1 sm:-ml-2 lg:-ml-3' : ''}`}
          >
            {letter}
          </span>
        ))}
      </h2>
    </div>
  );
};

export default SectionHeading;