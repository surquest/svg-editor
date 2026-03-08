"use client";

import { useState, useCallback, useRef } from "react";

const DEFAULT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <rect x="20" y="20" width="70" height="70" fill="#4F46E5" rx="8"/>
  <circle cx="150" cy="55" r="35" fill="#EC4899"/>
  <polygon points="100,130 60,190 140,190" fill="#10B981"/>
  <text x="100" y="110" text-anchor="middle" font-size="14" fill="#374151">SVG Editor</text>
</svg>`;

const SHAPE_TEMPLATES: Record<string, string> = {
  rect: `<rect x="50" y="50" width="100" height="80" fill="#4F46E5" rx="4"/>`,
  circle: `<circle cx="100" cy="100" r="50" fill="#EC4899"/>`,
  ellipse: `<ellipse cx="100" cy="100" rx="80" ry="50" fill="#F59E0B"/>`,
  line: `<line x1="20" y1="20" x2="180" y2="180" stroke="#374151" stroke-width="3"/>`,
  text: `<text x="100" y="110" text-anchor="middle" font-size="16" fill="#374151">Hello SVG</text>`,
  path: `<path d="M 20 80 Q 100 20 180 80 T 180 160" fill="none" stroke="#10B981" stroke-width="3"/>`,
};

function insertShape(svgCode: string, shapeSnippet: string): string {
  const closingTag = "</svg>";
  const idx = svgCode.lastIndexOf(closingTag);
  if (idx === -1) return svgCode + "\n" + shapeSnippet;
  return svgCode.slice(0, idx) + "  " + shapeSnippet + "\n" + svgCode.slice(idx);
}

function getValidationError(code: string): string | null {
  if (code.trim() === "") return null;
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(code, "image/svg+xml");
    const parseError = doc.querySelector("parsererror");
    return parseError ? "Invalid SVG: check your markup for errors." : null;
  } catch {
    return "Invalid SVG: check your markup for errors.";
  }
}

export default function SvgEditor() {
  const [svgCode, setSvgCode] = useState(DEFAULT_SVG);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const error = getValidationError(svgCode);

  const handleCodeChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSvgCode(e.target.value);
  }, []);

  const handleAddShape = useCallback((shape: string) => {
    setSvgCode((prev) => insertShape(prev, SHAPE_TEMPLATES[shape]));
  }, []);

  const handleClear = useCallback(() => {
    setSvgCode(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">\n</svg>`
    );
  }, []);

  const handleReset = useCallback(() => {
    setSvgCode(DEFAULT_SVG);
  }, []);

  const handleDownload = useCallback(() => {
    const blob = new Blob([svgCode], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "drawing.svg";
    a.click();
    URL.revokeObjectURL(url);
  }, [svgCode]);

  const handleCopy = useCallback(async () => {
    await navigator.clipboard.writeText(svgCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [svgCode]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const content = ev.target?.result as string;
      setSvgCode(content);
    };
    reader.readAsText(file);
    // Reset file input so same file can be re-imported
    e.target.value = "";
  }, []);

  const previewSrc = !error && svgCode.trim()
    ? `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgCode)}`
    : null;

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center gap-2">
          <svg className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <h1 className="text-lg font-bold text-indigo-600">SVG Editor</h1>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <a
            href="https://github.com/surquest/svg-editor"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-600 transition-colors"
          >
            GitHub
          </a>
        </div>
      </header>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mr-1">Add Shape:</span>
        {Object.keys(SHAPE_TEMPLATES).map((shape) => (
          <button
            key={shape}
            onClick={() => handleAddShape(shape)}
            className="px-3 py-1 text-xs font-medium rounded-md bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors capitalize border border-indigo-200 dark:border-indigo-700"
          >
            {shape}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
          >
            Import SVG
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".svg,image/svg+xml"
            className="hidden"
            onChange={handleImport}
          />
          <button
            onClick={handleCopy}
            className="px-3 py-1 text-xs font-medium rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors border border-gray-300 dark:border-gray-600"
          >
            {copied ? "Copied!" : "Copy SVG"}
          </button>
          <button
            onClick={handleDownload}
            className="px-3 py-1 text-xs font-medium rounded-md bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/60 transition-colors border border-green-300 dark:border-green-700"
          >
            Download
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-1 text-xs font-medium rounded-md bg-yellow-50 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-100 dark:hover:bg-yellow-900/60 transition-colors border border-yellow-300 dark:border-yellow-700"
          >
            Clear
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-1 text-xs font-medium rounded-md bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/60 transition-colors border border-red-300 dark:border-red-700"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Code Editor */}
        <div className="flex flex-col w-1/2 border-r border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">SVG Code</span>
            {error && (
              <span className="text-xs text-red-600 dark:text-red-400 font-medium">⚠ {error}</span>
            )}
          </div>
          <textarea
            className="flex-1 p-4 font-mono text-sm resize-none outline-none bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 leading-6"
            value={svgCode}
            onChange={handleCodeChange}
            spellCheck={false}
            placeholder="Enter SVG code here..."
          />
        </div>

        {/* Preview */}
        <div className="flex flex-col w-1/2">
          <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wide">Preview</span>
          </div>
          <div className="flex-1 flex items-center justify-center bg-white dark:bg-gray-900 overflow-auto p-4">
            {error ? (
              <div className="text-center text-red-500 dark:text-red-400 text-sm">
                <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
                <p>SVG Preview unavailable</p>
                <p className="text-xs text-gray-400 mt-1">{error}</p>
              </div>
            ) : previewSrc ? (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm overflow-hidden">
                {/*
                  Native img is used intentionally here: next/image does not support
                  data: URIs, which are required for rendering SVG previews from user input.
                */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewSrc}
                  alt="SVG Preview"
                  className="max-w-full max-h-full"
                />
              </div>
            ) : (
              <p className="text-gray-400 text-sm">Enter SVG code to see preview</p>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center gap-4 px-4 py-1.5 bg-indigo-600 text-white text-xs">
        <span>Lines: {svgCode.split("\n").length}</span>
        <span>Characters: {svgCode.length}</span>
        <span className={`ml-auto font-medium ${error ? "text-red-200" : "text-green-200"}`}>
          {error ? "⚠ Error" : "✓ Valid SVG"}
        </span>
      </div>
    </div>
  );
}
