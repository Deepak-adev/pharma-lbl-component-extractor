import React from 'react';

// New, consistent icon set
const IconProps = "w-6 h-6";
const SVGProps = {
    fill: "none",
    stroke: "currentColor",
    viewBox: "0 0 24 24",
    xmlns: "http://www.w3.org/2000/svg",
    strokeWidth: "2",
    strokeLinecap: "round" as "round",
    strokeLinejoin: "round" as "round",
};

export const BrandIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || "w-6 h-6 text-white"} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
    </svg>
);


export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...SVGProps} className={className || IconProps}><path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
);

export const ReviewIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...SVGProps} className={className || IconProps}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
);

export const GenerateIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...SVGProps} className={className || IconProps}><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l1.414-1.414a2 2 0 012.828 0L20 4M5 12l1.414 1.414a2 2 0 002.828 0L12 11m-1 7l1.414-1.414a2 2 0 012.828 0L17 20m-5-5l1.414 1.414a2 2 0 002.828 0L20 14" /></svg>
);

export const UploadIconSimple: React.FC = () => (
    <svg className="mx-auto h-12 w-12 text-gray-400" {...SVGProps} strokeWidth="1.5">
        <path d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
        <path d="M16 12l-4-4-4 4m4-4v12" />
    </svg>
);

export const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...SVGProps} className={className || IconProps}><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path></svg>
);

export const CheckCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

export const XCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className || "h-6 w-6"} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
  </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className || IconProps} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l1.414-1.414a2 2 0 012.828 0L20 4M5 12l1.414 1.414a2 2 0 002.828 0L12 11m-1 7l1.414-1.414a2 2 0 012.828 0L17 20m-5-5l1.414 1.414a2 2 0 002.828 0L20 14" />
    </svg>
);

export const FilterIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...SVGProps} className={className || IconProps}>
        <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
);

export const ArrowRightIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...SVGProps} className={className || "w-5 h-5"}>
        <path d="M13 5l7 7-7 7M5 12h14" />
    </svg>
);

export const EditIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg {...SVGProps} className={className || "w-5 h-5"}>
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export const DownloadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...SVGProps} className={className || "w-5 h-5"}>
        <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

export const BriefcaseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...SVGProps} className={className || IconProps}>
        <path d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
);

export const CloseIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg {...SVGProps} className={className || IconProps}>
        <path d="M6 18L18 6M6 6l12 12" />
    </svg>
);