"use client";

import { useRef, useState } from "react";
import { Upload, X, Loader2 } from "lucide-react";

type Aspect = "banner-desktop" | "banner-tablet" | "banner-mobile" | "square" | "free";

const DIMENSOES: Record<Aspect, string> = {
  "banner-desktop": "1920 × 500 px",
  "banner-tablet": "1024 × 450 px",
  "banner-mobile": "520 × 650 px",
  "square": "Proporção quadrada",
  "free": "Qualquer proporção",
};

interface Props {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  aspect?: Aspect;
  className?: string;
}

export default function ImageUpload({ value, onChange, label, aspect = "free", className = "" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [drag, setDrag] = useState(false);

  async function upload(file: File) {
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (data.url) onChange(data.url);
    } finally {
      setUploading(false);
    }
  }

  function handleFile(files: FileList | null) {
    if (files?.[0]) upload(files[0]);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDrag(false);
    handleFile(e.dataTransfer.files);
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <p className="text-sm font-medium text-gray-700">
          {label}
          {aspect !== "free" && aspect !== "square" && (
            <span className="ml-2 text-xs font-normal text-gray-400">{DIMENSOES[aspect]}</span>
          )}
        </p>
      )}

      {value ? (
        <div className="relative group rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
          <img
            src={value}
            alt="preview"
            className={`w-full object-cover ${
              aspect === "banner-desktop" ? "h-20" :
              aspect === "banner-tablet" ? "h-24" :
              aspect === "banner-mobile" ? "h-32" :
              aspect === "square" ? "aspect-square" : "max-h-40"
            }`}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                className="bg-white text-black rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-gray-100 transition"
              >
                Trocar
              </button>
              <button
                type="button"
                onClick={() => onChange("")}
                className="bg-red-500 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-red-600 transition"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer transition select-none
            ${drag ? "border-black bg-gray-50" : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"}
            ${aspect === "banner-desktop" ? "h-20" :
              aspect === "banner-tablet" ? "h-24" :
              aspect === "banner-mobile" ? "h-28" :
              aspect === "square" ? "aspect-square" : "h-24"}
          `}
        >
          {uploading ? (
            <Loader2 size={20} className="animate-spin text-gray-400" />
          ) : (
            <>
              <Upload size={18} className="text-gray-300 mb-1" />
              <p className="text-xs text-gray-400">Arraste ou clique</p>
              {aspect !== "free" && (
                <p className="text-[10px] text-gray-300 mt-0.5">{DIMENSOES[aspect]}</p>
              )}
            </>
          )}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={e => handleFile(e.target.files)}
      />
    </div>
  );
}
