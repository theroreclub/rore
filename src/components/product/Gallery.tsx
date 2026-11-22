"use client";
import Image from "next/image";
import { useRef, useState } from "react";
import { ZoomIn, X } from "lucide-react";
import type { Colorway } from "@/lib/catalog";
export function Gallery({ color, name }: { color: Colorway; name: string }) {
  const [detail, setDetail] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const source = detail ? color.detail : color.image;
  const alt =
    name + ", " + color.name + (detail ? ", fabric detail" : ", front view");
  return (
    <div className="gallery">
      <button
        className={"gallery-frame rc-product-stage " + (detail ? "detail-crop" : "")}
        aria-label="Enlarge product image"
        onClick={() => dialog.current?.showModal()}
      >
        <Image
          src={source}
          alt={alt}
          fill
          preload
          sizes="(min-width: 800px) 48vw, 90vw"
          unoptimized
        />
        <span className="zoom-label">
          <ZoomIn size={17} /> Enlarge
        </span>
      </button>
      <div className="gallery-tabs" aria-label="Product views">
        {["Full piece", "Fabric detail"].map((label, i) => (
          <button
            key={label}
            className={i ? "detail-crop" : ""}
            aria-pressed={detail === Boolean(i)}
            onClick={() => setDetail(Boolean(i))}
          >
            <span className="rc-product-stage">
              <Image
                src={i ? color.detail : color.image}
                alt=""
                fill
                sizes="50px"
                unoptimized
              />
            </span>
            {label}
          </button>
        ))}
      </div>
      <dialog
        className="panel lightbox"
        ref={dialog}
        aria-label={alt}
        onClick={(e) => {
          if (e.target === dialog.current) dialog.current.close();
        }}
      >
        <button
          className="close icon-button"
          aria-label="Close enlarged image"
          onClick={() => dialog.current?.close()}
        >
          <X />
        </button>
        <div className={"rc-product-stage" + (detail ? " detail-crop" : "")}>
          <Image width={850} height={850} src={source} alt={alt} unoptimized />
        </div>
      </dialog>
    </div>
  );
}
