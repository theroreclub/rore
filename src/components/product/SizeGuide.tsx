"use client";
import { useRef } from "react";
import { X } from "lucide-react";
import { sizes } from "@/lib/catalog";
export function SizeGuide({ hoodie }: { hoodie: boolean }) {
  const modal = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button className="text-link" onClick={() => modal.current?.showModal()}>
        Size guide
      </button>
      <dialog
        className="panel"
        ref={modal}
        aria-labelledby="guide-title"
        onClick={(e) => {
          if (e.target === modal.current) modal.current.close();
        }}
      >
        <div className="panel-content">
          <button
            className="close icon-button"
            aria-label="Close size guide"
            onClick={() => modal.current?.close()}
          >
            <X size={18} />
          </button>
          <h2 id="guide-title">Find your size.</h2>
          <p>
            Lay a {hoodie ? "hoodie" : "tee"} flat. Measure across the chest,
            then from shoulder to hem. Compare with the sample garment
            measurements below.
          </p>
          <table className="size-table">
            <caption>Preview measurements in centimetres</caption>
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest width</th>
                <th>Length</th>
              </tr>
            </thead>
            <tbody>
              {sizes.map((s, i) => (
                <tr key={s}>
                  <th scope="row">{s}</th>
                  <td>{(hoodie ? 54 : 50) + i * 3}</td>
                  <td>{(hoodie ? 65 : 68) + i * 2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </dialog>
    </>
  );
}
