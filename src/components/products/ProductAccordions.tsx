"use client";

import { useState } from "react";
import { ChevronDown, Sparkles, Shirt, Truck } from "lucide-react";

interface ProductAccordionsProps {
  description: string;
}

export function ProductAccordions({ description }: ProductAccordionsProps) {
  const [openSection, setOpenSection] = useState<string | null>("details");

  const toggle = (section: string) => {
    setOpenSection((prev) => (prev === section ? null : section));
  };

  const sections = [
    {
      id: "details",
      title: "Details & Silhouette",
      icon: Sparkles,
      content: (
        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <p>{description}</p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 pt-1">
            <li>Signature oversized drop-shoulder tailoring</li>
            <li>Reinforced double-needle collar and hem stitching</li>
            <li>Custom woven silicone brand label at hem</li>
            <li>Limited edition seasonal release — no restocks planned</li>
          </ul>
        </div>
      ),
    },
    {
      id: "fabric",
      title: "Fabric & Garment Care",
      icon: Shirt,
      content: (
        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <p>
            Constructed from 100% combed heavyweight 450 GSM organic French Terry cotton, custom-milled for structure, breathability, and lifetime durability.
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 pt-1">
            <li>Machine wash cold (30°C) with like colors</li>
            <li>Wash inside out to preserve artwork and screen print</li>
            <li>Do not tumble dry; lay flat or hang dry in shade</li>
            <li>Cool iron on reverse side if needed; do not iron prints directly</li>
          </ul>
        </div>
      ),
    },
    {
      id: "shipping",
      title: "Shipping & Free Returns",
      icon: Truck,
      content: (
        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <p>
            Orders are packed in branded anti-static dust bags and dispatched within 24–48 business hours from our central fulfillment hub.
          </p>
          <ul className="list-disc list-inside space-y-1 text-zinc-400 pt-1">
            <li>Free standard delivery on all domestic orders over ₹1,999</li>
            <li>Express courier delivery with live SMS tracking</li>
            <li>7-day hassle-free return and exchange policy for unworn pieces with tags attached</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {sections.map((sec) => {
        const isOpen = openSection === sec.id;
        const Icon = sec.icon;

        return (
          <div
            key={sec.id}
            className="rounded-2xl glass overflow-hidden transition-all duration-300"
          >
            <button
              type="button"
              onClick={() => toggle(sec.id)}
              aria-expanded={isOpen}
              className="w-full px-5 py-4 flex items-center justify-between text-left font-sans text-xs uppercase tracking-wider font-bold text-white hover:text-white/90 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-accent" />
                <span>{sec.title}</span>
              </div>
              <ChevronDown
                className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${
                  isOpen ? "rotate-180 text-white" : ""
                }`}
              />
            </button>

            {isOpen && (
              <div className="px-5 pb-5 pt-1 border-t border-white/[0.06] animate-in fade-in-50 duration-200">
                {sec.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
