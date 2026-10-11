"use client";

import React, { useState } from "react";
import { X, Sparkles, ShoppingCart, Check, ZoomIn, ZoomOut } from "lucide-react";
import { RecommendedProduct } from "@/types/skin";
import { useSkinScan } from "@/context/SkinScanContext";
import { PRODUCT_CATALOG } from "@/lib/youcam";
import confetti from "canvas-confetti";

interface VtoModalProps {
  product: RecommendedProduct | null;
  onClose: () => void;
}

export default function VtoModal({ product: initialProduct, onClose }: VtoModalProps) {
  const { uploadedImage } = useSkinScan();
  const [selectedProduct, setSelectedProduct] = useState<RecommendedProduct | null>(initialProduct);
  const [sliderPosition, setSliderPosition] = useState(50);
  const [addedToCart, setAddedToCart] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const product = selectedProduct || initialProduct;
  if (!product) return null;

  const handleAddToCart = () => {
    setAddedToCart(true);
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch (e) {}
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const getOverlayFilter = () => {
    switch (product.vtoEffect.overlayType) {
      case "glow":
        return "brightness(1.12) contrast(1.05) saturate(1.18)";
      case "smoothing":
        return "contrast(0.95) brightness(1.06) blur(0.4px)";
      case "firming":
        return "contrast(1.08) brightness(1.04) saturate(1.06)";
      case "clarifying":
        return "contrast(1.06) brightness(1.08) saturate(0.95)";
      default:
        return "none";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800">
        {/* Header */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 sm:px-6 py-3 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] uppercase font-bold text-emerald-600 block">
              Virtual Try-On • Simulated Formulation
            </span>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
              {product.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Product Quick-Switcher Tabs */}
        <div className="px-4 pt-3 pb-1 border-b border-slate-100 dark:border-slate-800/60 overflow-x-auto no-scrollbar">
          <div className="flex gap-1.5 min-w-max pb-1">
            {PRODUCT_CATALOG.map((p) => {
              const isActive = p.id === product.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProduct(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-slate-900 text-white shadow-sm dark:bg-white dark:text-slate-900"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  <span>{p.category}</span>
                  <span className="text-[10px] opacity-75">(${p.price})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* True Non-Distorting Split Compare Canvas */}
          <div className="relative aspect-square w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-slate-950 shadow-inner select-none border border-slate-800">
            {uploadedImage ? (
              <div
                className={`relative w-full h-full transition-transform duration-300 origin-center ${
                  isZoomed ? "scale-150 cursor-grab" : "scale-100"
                }`}
              >
                {/* 1. Underlying Original Image (Before) */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadedImage}
                  alt="Original skin portrait"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* 2. Overlaid After Image using stationary CSS clip-path */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={uploadedImage}
                  alt="After using product"
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    filter: getOverlayFilter(),
                    clipPath: `polygon(0% 0%, ${sliderPosition}% 0%, ${sliderPosition}% 100%, 0% 100%)`
                  }}
                />

                {/* Soft glow highlight on the after area */}
                <div
                  className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-teal-300/10 to-transparent pointer-events-none"
                  style={{
                    clipPath: `polygon(0% 0%, ${sliderPosition}% 0%, ${sliderPosition}% 100%, 0% 100%)`
                  }}
                />

                {/* 3. Slider Divider Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_10px_rgba(0,0,0,0.5)] pointer-events-none z-10"
                  style={{ left: `${sliderPosition}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-7 w-7 rounded-full bg-white shadow-lg flex items-center justify-center text-slate-800 text-[10px] font-black border border-slate-200">
                    ↔
                  </div>
                </div>

                {/* 4. Range Input Controller */}
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={sliderPosition}
                  onChange={(e) => setSliderPosition(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                  aria-label="Before and after comparison slider"
                />

                {/* Floating Labels */}
                <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none">
                  <span className="rounded-md bg-emerald-950/80 px-2 py-0.5 text-[9px] font-bold text-emerald-300 backdrop-blur-sm border border-emerald-500/30">
                    AFTER
                  </span>
                </div>
                <div className="absolute top-2.5 right-2.5 z-10 pointer-events-none">
                  <span className="rounded-md bg-slate-950/80 px-2 py-0.5 text-[9px] font-bold text-slate-300 backdrop-blur-sm border border-white/20">
                    BEFORE
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4 text-slate-400">
                <p className="text-xs">Take a selfie to preview this product on your face.</p>
              </div>
            )}

            {/* Zoom Toggle Floating Button */}
            {uploadedImage && (
              <button
                type="button"
                onClick={() => setIsZoomed(!isZoomed)}
                className="absolute bottom-2.5 right-2.5 z-30 inline-flex items-center gap-1 rounded-xl bg-slate-900/85 px-2.5 py-1 text-[11px] font-semibold text-white shadow backdrop-blur-md hover:bg-slate-800 border border-white/10"
                title="Toggle 2x Macro Inspection"
              >
                {isZoomed ? (
                  <>
                    <ZoomOut className="h-3 w-3 text-emerald-400" />
                    1x
                  </>
                ) : (
                  <>
                    <ZoomIn className="h-3 w-3 text-emerald-400" />
                    2x Close-up
                  </>
                )}
              </button>
            )}

            <div className="absolute bottom-2.5 left-2.5 z-10 pointer-events-none">
              <span className="rounded-full bg-slate-900/80 px-2.5 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                Drag slider to compare
              </span>
            </div>
          </div>

          {/* Product Benefit Box */}
          <div className="rounded-xl bg-emerald-50/70 p-3.5 dark:bg-emerald-950/40">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1 mb-1">
              <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
              {product.vtoEffect.title}:
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {product.vtoEffect.description}
            </p>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
              <span>Timeline: {product.vtoEffect.expectedTimeline}</span>
              <span className="text-slate-500 dark:text-slate-400">
                Projected change: {product.vtoEffect.beforeAfterPreview.simulatedChange}
              </span>
            </div>
          </div>

          {/* Price & Add to Bag */}
          <div className="pt-2 flex items-center justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-400 block">Price</span>
              <span className="text-xl font-black text-slate-900 dark:text-white">
                ${product.price}
              </span>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl py-3 px-4 text-xs font-bold transition-all ${
                addedToCart
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900"
              }`}
            >
              {addedToCart ? (
                <>
                  <Check className="h-4 w-4" />
                  Added to Your Bag!
                </>
              ) : (
                <>
                  <ShoppingCart className="h-4 w-4" />
                  Add to Bag (${product.price})
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
