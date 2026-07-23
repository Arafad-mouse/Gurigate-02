import { useState, useRef } from "react";
import type { HostFormData } from "../types";

interface Props {
  data: HostFormData;
  onChange: (updates: Partial<HostFormData>) => void;
}

export function StepPhotos({ data, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const urls = Array.from(files).map((file) => URL.createObjectURL(file));
    onChange({ photos: [...data.photos, ...urls] });
  };

  const removePhoto = (index: number) => {
    onChange({ photos: data.photos.filter((_, i) => i !== index) });
  };

  if (data.photos.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-6">
        <h1 className="text-2xl md:text-[28px] font-extrabold text-foreground mb-2">
          Add some photos of your house
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          You'll need 5 photos to get started. You can add more or make changes later.
        </p>
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
          className={`border-2 border-dashed rounded-xl p-16 flex flex-col items-center justify-center gap-4 cursor-pointer transition-colors ${
            dragOver ? "border-foreground bg-accent" : "border-border"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <span className="text-5xl">📷</span>
          <button type="button" className="border border-foreground rounded-lg px-4 py-2 text-sm font-semibold hover:bg-accent transition-colors">
            Add photos
          </button>
        </div>
        <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-extrabold text-foreground">Choose at least 5 photos</h1>
          <p className="text-muted-foreground text-sm">Drag to reorder</p>
        </div>
        <button type="button" onClick={() => fileInputRef.current?.click()} className="w-8 h-8 flex items-center justify-center rounded-full border border-border hover:bg-accent text-lg">+</button>
      </div>

      {data.photos[0] && (
        <div className="relative mb-3 rounded-xl overflow-hidden">
          <img src={data.photos[0]} alt="Cover" className="w-full h-56 object-cover" />
          <span className="absolute top-3 left-3 bg-background text-foreground text-xs font-semibold px-2 py-1 rounded-md">Cover Photo</span>
          <button type="button" onClick={() => removePhoto(0)} className="absolute top-3 right-3 bg-background/80 rounded-full w-7 h-7 flex items-center justify-center text-sm hover:bg-background">⋯</button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {data.photos.slice(1).map((photo, i) => (
          <div key={i} className="relative rounded-xl overflow-hidden">
            <img src={photo} alt={`Photo ${i + 2}`} className="w-full h-32 object-cover" />
            <button type="button" onClick={() => removePhoto(i + 1)} className="absolute top-2 right-2 bg-background/80 rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-background">⋯</button>
          </div>
        ))}
        {data.photos.length < 5 && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="h-32 border-2 border-dashed border-border rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:border-foreground/40 transition-colors"
          >
            <span className="text-lg">+</span>
            <span className="text-xs text-muted-foreground">Add more</span>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleFiles(e.target.files)} />
    </div>
  );
}
