"use client";

import React from "react";
import { Sparkles, Eye, Star } from "lucide-react";
import { RecommendedProduct } from "@/types/skin";
import { useSkinScan } from "@/context/SkinScanContext";

interface ProductRecommendationsProps {
  products: RecommendedProduct[];
  title?: string;
  subtitle?: string;
}

export default function ProductRecommendations({
  products,
  title = "Products For Your Skin",
  subtitle = "Tailored specifically for your scan results."
}: ProductRecommendationsProps) {
  const { openVtoModal } = useSkinScan();

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {products.map((product) => (
          <div
            key={product.id}
            className="flex flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900"
          >
            {/* Image */}
            <div className="relative mb-2.5 aspect-square w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.imageUrl}
                alt={product.name}
                className="h-full w-full object-cover"
              />
              <span className="absolute top-2 left-2 rounded-md bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800 shadow-sm">
                {product.matchingMetricTag.split("(")[0]}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 flex flex-col">
              <span className="text-[10px] text-slate-400 font-medium">
                {product.category}
              </span>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug mb-1">
                {product.name}
              </h4>

              <div className="mt-auto pt-2 flex flex-col gap-2">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                    ${product.price}
                  </span>
                  <span className="text-[10px] text-amber-500 font-semibold flex items-center gap-0.5">
                    ★ {product.rating}
                  </span>
                </div>

                {/* Primary Button */}
                <button
                  type="button"
                  onClick={() => openVtoModal(product)}
                  className="w-full inline-flex items-center justify-center gap-1 rounded-xl bg-slate-900 py-2 text-[11px] font-semibold text-white hover:bg-emerald-600 active:scale-95 transition-all dark:bg-emerald-600 dark:hover:bg-emerald-500"
                >
                  <Eye className="h-3.5 w-3.5" />
                  Try on Face
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
