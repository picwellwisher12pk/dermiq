"use client";

import React, { useState } from "react";
import ProductRecommendations from "@/components/ProductRecommendations";
import { PRODUCT_CATALOG } from "@/lib/youcam";
import { Filter, Sparkles, ShieldCheck } from "lucide-react";

export default function MarketplacePage() {
  const [filterCategory, setFilterCategory] = useState<string>("All");

  const categories = ["All", "Serum", "Cream"];

  const filteredProducts =
    filterCategory === "All"
      ? PRODUCT_CATALOG
      : PRODUCT_CATALOG.filter((p) => p.category === filterCategory);

  return (
    <div className="py-12 md:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2 dark:bg-emerald-950/60 dark:text-emerald-300">
            <Sparkles className="h-3.5 w-3.5" />
            Curated E-Commerce & AR VTO
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Clinical Prescription Dispensary
          </h1>
          <p className="mt-2 text-sm text-slate-500 max-w-xl">
            Each formula features interactive augmented reality virtual try-ons to preview
            projected skin improvements before purchasing.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl dark:bg-slate-800">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  filterCategory === cat
                    ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-300"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ProductRecommendations
        products={filteredProducts}
        title="Formulations with Interactive VTO"
        subtitle="Click 'Virtual Try-On' on any product card to see its projected transformation on your facial portrait."
      />
    </div>
  );
}
