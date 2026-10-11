"use client";

import React from "react";
import Link from "next/link";
import { Camera, CheckCircle2, ArrowRight, Sparkles, Eye, ShieldCheck } from "lucide-react";
import ProductRecommendations from "@/components/ProductRecommendations";
import { PRODUCT_CATALOG } from "@/lib/youcam";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* 1. Hero Section: Mobile First, zero unnecessary jargon */}
      <section className="pt-8 pb-12 sm:pt-16 sm:pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 mb-4">
            <Sparkles className="h-3.5 w-3.5 text-emerald-600" />
            <span>Instant Skin Check & Recommendations</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            See What Your Skin Really Needs.
          </h1>

          {/* User-friendly description */}
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed max-w-lg">
            Take a quick selfie. We check your hydration, fine lines, dark spots, and texture in 2
            seconds, then show you the best products and let you preview the results on your face.
          </p>

          {/* Instant Call-to-action */}
          <div className="mt-6 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="/scanner"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-7 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700 active:scale-98 transition-all dark:bg-emerald-600 dark:hover:bg-emerald-500"
            >
              <Camera className="h-4 w-4" />
              Check My Skin Now
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-all dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            >
              Browse Skincare Products
            </Link>
          </div>

          {/* Trust bullet points */}
          <div className="mt-6 flex items-center justify-center gap-4 sm:gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              Fast & Free
            </span>
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Your photo stays private
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5 text-emerald-500" />
              See before & after
            </span>
          </div>
        </div>
      </section>

      {/* 2. Three Simple Steps */}
      <section className="py-10 bg-slate-100/60 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              How It Works
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
              <div className="text-emerald-600 font-extrabold text-sm mb-1">Step 1</div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                Take or upload a selfie
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Snap a photo in good lighting right from your phone.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
              <div className="text-teal-600 font-extrabold text-sm mb-1">Step 2</div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                Get your skin score
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Learn your moisture levels, spot areas, and skin age instantly.
              </p>
            </div>

            <div className="rounded-2xl bg-white p-5 shadow-sm dark:bg-slate-900">
              <div className="text-amber-600 font-extrabold text-sm mb-1">Step 3</div>
              <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
                Try products on your face
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Preview how serums and creams will improve your skin with our virtual try-on.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Recommended Formulations */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <ProductRecommendations
          products={PRODUCT_CATALOG}
          title="Popular Skincare Formulations"
          subtitle="Formulated with dermatologist-approved ingredients."
        />
      </section>
    </div>
  );
}
