import React from 'react';

export const Tooth = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M7 2c-2 0-3.5 1.5-3.5 3.5 0 2 1.5 3.5 3.5 3.5h.1c.2 0 .4.2.4.4V14c0 2.2 1.8 4 4 4h1c2.2 0 4-1.8 4-4V9.4c0-.2.2-.4.4-.4h.1c2 0 3.5-1.5 3.5-3.5 0-2-1.5-3.5-3.5-3.5-1.5 0-2.8 1-3.3 2.3-.5 1.4-2.1 1.4-2.6 0-.5-1.3-1.8-2.3-3.3-2.3z" />
    <path d="M10 18v3" />
    <path d="M14 18v3" />
  </svg>
);
