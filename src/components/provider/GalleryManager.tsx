"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Upload, X, ImageIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function GalleryManager({ initialImages }: { initialImages: string[] }) {
  const [images, setImages] = useState<string[]>(initialImages);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    if (images.length + files.length > 20) {
      toast.error("Maks. 20 zdjęć w galerii");
      return;
    }

    setUploading(true);
    const uploaded: string[] = [];
    for (const file of Array.from(files)) {
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/provider/gallery", { method: "POST", body: form });
        const data = await res.json();
        if (!res.ok) { toast.error(data.error ?? "Błąd uploadu"); continue; }
        uploaded.push(data.url);
      } catch {
        toast.error(`Nie udało się przesłać: ${file.name}`);
      }
    }
    if (uploaded.length) {
      setImages((prev) => [...prev, ...uploaded]);
      toast.success(`Dodano ${uploaded.length} ${uploaded.length === 1 ? "zdjęcie" : "zdjęcia"}`);
    }
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
  }

  async function handleDelete(url: string) {
    setDeleting(url);
    try {
      const res = await fetch("/api/provider/gallery", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) { toast.error("Nie udało się usunąć"); return; }
      setImages((prev) => prev.filter((u) => u !== url));
      toast.success("Zdjęcie usunięte");
    } catch {
      toast.error("Błąd połączenia");
    } finally {
      setDeleting(null);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  return (
    <div className="space-y-6">
      {/* Upload zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => !uploading && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-colors ${
          uploading ? "border-indigo-300 bg-indigo-50 cursor-wait" : "border-gray-200 hover:border-indigo-400 hover:bg-indigo-50/40"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-indigo-600">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-medium">Przesyłanie...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <Upload className="w-8 h-8" />
            <p className="text-sm font-medium text-slate-600">Przeciągnij zdjęcia lub kliknij</p>
            <p className="text-xs">PNG, JPG, WEBP · maks. 5 MB · do 20 zdjęć</p>
          </div>
        )}
      </div>

      {/* Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {images.map((url) => (
            <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
              <Image src={url} alt="" fill className="object-cover" sizes="200px" />
              <button
                onClick={() => handleDelete(url)}
                disabled={deleting === url}
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
              >
                {deleting === url ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-slate-400 flex flex-col items-center gap-2">
          <ImageIcon className="w-8 h-8 opacity-30" />
          <p className="text-sm">Galeria jest pusta — dodaj pierwsze zdjęcia</p>
        </div>
      )}

      <p className="text-xs text-slate-400">{images.length} / 20 zdjęć</p>
    </div>
  );
}
