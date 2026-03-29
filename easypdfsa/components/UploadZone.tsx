"use client";

import { useCallback } from "react";
import { useDropzone, Accept } from "react-dropzone";

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  multiple?: boolean;
  label?: string;
  sublabel?: string;
}

export default function UploadZone({
  onFilesSelected,
  multiple = false,
  label = "Drop your PDF here",
  sublabel = "or click to browse files",
}: UploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFilesSelected(acceptedFiles);
      }
    },
    [onFilesSelected]
  );

  const accept: Accept = { "application/pdf": [".pdf"] };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
  });

  return (
    <div
      {...getRootProps()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300 ${
        isDragActive
          ? "drag-active border-sky-400 bg-sky-500/10"
          : "border-sky-500/20 hover:border-sky-400/50 hover:bg-sky-500/5"
      }`}
      id="upload-zone"
    >
      <input {...getInputProps()} id="upload-input" />

      <div className="flex flex-col items-center gap-4">
        {/* Upload icon */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
            isDragActive
              ? "bg-sky-400/20 scale-110"
              : "bg-sky-500/10"
          }`}
        >
          <svg
            className={`w-8 h-8 transition-colors duration-300 ${
              isDragActive ? "text-sky-300" : "text-sky-500"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v6m-1.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>

        <div>
          <p className="text-lg font-semibold text-sky-100">{label}</p>
          <p className="text-sm text-sky-300/60 mt-1">{sublabel}</p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20">
          <svg className="w-4 h-4 text-sky-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
          </svg>
          <span className="text-xs text-sky-300/80">Files stay on your device</span>
        </div>
      </div>
    </div>
  );
}
