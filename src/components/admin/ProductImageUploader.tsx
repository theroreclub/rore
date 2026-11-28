"use client";

import { useState } from "react";
import Image from "next/image";
import { isProductImage } from "@/lib/validations/product-image";
import { ArrowLeft, ArrowRight, Link as LinkIcon, Trash2, UploadCloud } from "lucide-react";

interface ProductImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  onUploading: (pending: boolean) => void;
}

export function ProductImageUploader({ images, onChange, onUploading }: ProductImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError(null);

    // 1. Validate file type (Images only)
    if (!["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)) {
      setUploadError("Only JPEG, PNG, WebP, or AVIF images are supported.");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      setUploadError("Choose an image of 4 MB or less.");
      return;
    }

    setIsUploading(true);
    onUploading(true);

    try {
      // 3. Request signed token from server
      const signRes = await fetch("/api/admin/cloudinary-sign", { method: "POST" });
      const signData = await signRes.json();

      if (signData.isPlaceholder) {
        const response = await fetch("/api/admin/product-images", {
          method: "POST", headers: { "x-product-upload": "1" }, body: file,
        });
        const result = await response.json();
        if (!response.ok || !result.url) throw new Error(result.error || "The photo could not be uploaded.");
        onChange([...images, result.url]);
        return;
      }

      if (!signRes.ok || !signData.signature) {
        throw new Error(signData.error || "Failed to sign upload request");
      }

      // 4. Upload directly to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", signData.apiKey);
      formData.append("timestamp", String(signData.timestamp));
      formData.append("signature", signData.signature);
      formData.append("folder", signData.folder);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${signData.cloudName}/image/upload`;
      const cloudRes = await fetch(uploadUrl, {
        method: "POST",
        body: formData,
      });

      const cloudData = await cloudRes.json();

      if (!cloudRes.ok || !cloudData.secure_url) {
        throw new Error(cloudData.error?.message || "Cloudinary upload failed");
      }

      onChange([...images, cloudData.secure_url]);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err instanceof Error ? err.message : "Failed to upload image.");
    } finally {
      setIsUploading(false);
      onUploading(false);
      // Reset input value so same file can be re-selected if needed
      e.target.value = "";
    }
  };

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customUrl.trim();
    if (!trimmed) return;
    if (!isProductImage(trimmed)) {
      setUploadError("Upload this photo, or enter a Cloudinary, Unsplash or store image URL.");
      return;
    }
    setUploadError(null);
    onChange([...images, trimmed]);
    setCustomUrl("");
    setShowUrlInput(false);
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= images.length) return;
    const reordered = [...images];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    onChange(reordered);
  };

  return (
    <fieldset disabled={isUploading} className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-mono font-bold tracking-wider uppercase text-slate-700">
          Product Images ({images.length})
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-red-800 hover:text-red-800 flex items-center gap-1 font-semibold"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          <span>{showUrlInput ? "Hide URL Input" : "Add via URL / Local Path"}</span>
        </button>
      </div>

      {uploadError && (
        <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-800">
          {uploadError}
        </div>
      )}

      {/* Manual URL Input Option */}
      {showUrlInput && (
        <div className="p-4 rounded-lg bg-[#fff] border border-slate-200 space-y-2">
          <p className="text-[11px] text-slate-600">
            Paste an image URL or local path (e.g. <code>/images/products/cyber-acid-wash-hoodie.svg</code>):
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customUrl}
              onChange={(e) => setCustomUrl(e.target.value)}

              className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-900 placeholder-zinc-600 focus:outline-none focus:border-rose-500"
            />
            <button
              type="button"
              onClick={handleAddCustomUrl}
              className="px-4 py-2 rounded-md bg-slate-100 hover:bg-slate-200 text-xs font-bold text-slate-900 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}

      {/* Images Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {images.map((img, idx) => (
          <div
            key={idx}
            className="group relative aspect-square rounded-lg bg-[#fff] border border-slate-200 overflow-hidden flex flex-col justify-between p-2"
          >
            <Image
              src={img}
              alt={`Product image ${idx + 1}`}
              fill
              className="object-cover"
            />

            {/* Position Badges */}
            <div className="relative z-10 flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-[#fff] backdrop-blur-md border border-slate-200 text-[10px] font-mono font-bold text-slate-800">
                {idx === 0 ? "★ Main" : `#${idx + 1}`}
              </span>

              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="p-1 rounded-md bg-red-50 text-red-800 hover:text-slate-900 border border-red-200 transition-colors"
                title="Remove image"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Reorder Controls */}
            <div className="relative z-10 flex items-center justify-between pt-2">
              <button
                type="button"
                disabled={idx === 0}
                onClick={() => handleMove(idx, idx - 1)}
                className="p-1 rounded-md bg-[#fff] text-slate-700 hover:text-slate-900 border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Left"
              >
                <ArrowLeft className="w-3 h-3" />
              </button>

              <button
                type="button"
                disabled={idx === images.length - 1}
                onClick={() => handleMove(idx, idx + 1)}
                className="p-1 rounded-md bg-[#fff] text-slate-700 hover:text-slate-900 border border-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Move Right"
              >
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}

        {/* Upload Trigger Tile */}
        <label className="relative aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-rose-500/80 bg-[#fff] hover:bg-slate-50 transition-all flex flex-col items-center justify-center gap-2 cursor-pointer p-4 text-center group">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
          />

          {isUploading ? (
            <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <UploadCloud className="w-6 h-6 text-slate-600 group-hover:text-red-800 transition-colors" />
          )}

          <span className="text-[11px] font-bold text-slate-600 group-hover:text-slate-900 uppercase tracking-wider">
            {isUploading ? "Uploading..." : "Upload Media"}
          </span>
          <span className="text-[9px] text-slate-600">Up to 4 MB · JPEG, PNG, WebP, AVIF</span>
        </label>
      </div>
    </fieldset>
  );
}
