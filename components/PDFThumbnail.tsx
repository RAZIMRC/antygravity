"use client";

import { useEffect, useRef, useState } from "react";

interface PDFThumbnailProps {
  fileData: ArrayBuffer;
  pageIndex: number;  // 0-based
  width?: number;
  className?: string;
}

export default function PDFThumbnail({
  fileData,
  pageIndex,
  width = 200,
  className = "",
}: PDFThumbnailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        setLoading(true);
        setError(false);

        const pdfjsLib = await import("pdfjs-dist");

        // Set worker source from local public copy
        pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

        const pdf = await pdfjsLib.getDocument({ data: fileData.slice(0) }).promise;
        if (cancelled) return;

        const page = await pdf.getPage(pageIndex + 1); // pdf.js uses 1-based
        if (cancelled) return;

        const viewport = page.getViewport({ scale: 1 });
        const scale = width / viewport.width;
        const scaledViewport = page.getViewport({ scale });

        const canvas = canvasRef.current;
        if (!canvas) return;

        canvas.width = scaledViewport.width;
        canvas.height = scaledViewport.height;

        const context = canvas.getContext("2d");
        if (!context) return;

        await page.render({
          canvas,
          viewport: scaledViewport,
        }).promise;

        if (!cancelled) setLoading(false);
      } catch {
        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    render();

    return () => {
      cancelled = true;
    };
  }, [fileData, pageIndex, width]);

  return (
    <div className={`relative ${className}`}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface rounded-lg">
          <div className="w-6 h-6 border-2 border-sky-500/30 border-t-sky-400 rounded-full spinner" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface rounded-lg">
          <p className="text-xs text-red-400">Failed to render</p>
        </div>
      )}
      <canvas
        ref={canvasRef}
        className="rounded-lg"
        style={{ display: loading ? "none" : "block" }}
      />
    </div>
  );
}
