"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Droplets,
  Activity,
  Layers,
  Sun,
  RotateCcw,
  CheckCircle2,
  Camera,
  Eye,
  SlidersHorizontal
} from "lucide-react";
import { SkinAnalysisResult } from "@/types/skin";
import { useSkinScan } from "@/context/SkinScanContext";
import ProductRecommendations from "./ProductRecommendations";
import { PRODUCT_CATALOG } from "@/lib/youcam";

interface AnalysisDashboardProps {
  result?: SkinAnalysisResult | null;
}

export default function AnalysisDashboard({ result }: AnalysisDashboardProps) {
  const { analysisResult, resetAnalysis } = useSkinScan();
  const data = result || analysisResult;

  const [activeMarkerId, setActiveMarkerId] = useState<string | null>(null);
  // Default to clean photo (no dots)
  const [showOverlays, setShowOverlays] = useState(false);
  const [selectedMetricFilter, setSelectedMetricFilter] = useState<string | null>(null);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 dark:bg-emerald-950/60">
          <Camera className="h-7 w-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">
          Ready to Check Your Skin?
        </h3>
        <p className="mt-1.5 text-sm text-slate-500 max-w-xs">
          Take a quick selfie to see your skin health score and personalized skincare recommendations.
        </p>
        <Link
          href="/scanner"
          className="mt-5 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition-all dark:bg-white dark:text-slate-900"
        >
          <Camera className="h-4 w-4" />
          Take a Selfie
        </Link>
      </div>
    );
  }

  // Filter recommendations based on selected skin goal
  const recommendedProducts = PRODUCT_CATALOG.filter((p) => {
    if (selectedMetricFilter) {
      return p.metricTarget === selectedMetricFilter;
    }
    return data.recommendedProductIds.includes(p.id);
  });

  const getMetricIcon = (id: string) => {
    switch (id) {
      case "moisture":
        return <Droplets className="h-4 w-4 text-emerald-500" />;
      case "wrinkles":
        return <Activity className="h-4 w-4 text-amber-500" />;
      case "texture":
        return <Layers className="h-4 w-4 text-teal-500" />;
      case "spots":
        return <Sun className="h-4 w-4 text-rose-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-indigo-500" />;
    }
  };

  const filteredLandmarks = data.landmarks.filter((lm) => {
    if (!selectedMetricFilter) return true;
    if (selectedMetricFilter === "moisture") return lm.type === "hydration_low";
    if (selectedMetricFilter === "wrinkles") return lm.type === "wrinkle";
    if (selectedMetricFilter === "spots") return lm.type === "spot";
    if (selectedMetricFilter === "texture") return lm.type === "texture_uneven";
    return true;
  });

  const activeLandmark = data.landmarks.find((lm) => lm.id === activeMarkerId);

  return (
    <div className="w-full space-y-6">
      {/* 1. Header & Overall Health Card */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Skin Analysis Complete
            </span>
            <span className="text-xs text-slate-500">Skin Type: {data.skinType}</span>
            <span className="hidden sm:inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {data.engineDetails || "Optical Biometric CV"}
            </span>
          </div>

          <Link
            href="/scanner"
            onClick={resetAnalysis}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
          >
            <RotateCcw className="h-3 w-3" />
            Retake
          </Link>
        </div>

        {/* Hero Score Row */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="relative flex h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 items-center justify-center">
            <svg className="h-full w-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="10"
                stroke="currentColor"
                fill="transparent"
                r="38"
                cx="50"
                cy="50"
              />
              <circle
                className="text-emerald-500 transition-all duration-1000 ease-out"
                strokeWidth="10"
                strokeDasharray={238.7}
                strokeDashoffset={238.7 - (238.7 * data.overallScore) / 100}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
                r="38"
                cx="50"
                cy="50"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">
                {data.overallScore}
              </span>
              <span className="text-[9px] font-semibold text-slate-400">/ 100</span>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-tight">
              {data.overallScore >= 75 ? "Optimal Balance" : data.overallScore >= 60 ? "Good Condition" : "Needs Targeted Care"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              Primary focus: <span className="font-semibold text-slate-800 dark:text-slate-200">{data.primaryConcern}</span>.
            </p>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
              Apparent Skin Age: ~{data.skinAgeEstimate} years
            </p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Photo & Skin Details */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
        {/* Photo View with Clean Portrait Default */}
        <div className="md:col-span-5 flex flex-col">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="text-xs font-semibold text-slate-500">Your Photo</span>
            {filteredLandmarks.length > 0 ? (
              <button
                type="button"
                onClick={() => setShowOverlays(!showOverlays)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  showOverlays
                    ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                {showOverlays ? "Hide Detected Spots" : `Inspect Spots (${filteredLandmarks.length})`}
              </button>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Clear Complexion
              </span>
            )}
          </div>

          <div className="relative aspect-[4/5] w-full max-w-sm mx-auto rounded-2xl overflow-hidden bg-slate-950 shadow-md ring-1 ring-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.imageUrl}
              alt="Your portrait"
              className="h-full w-full object-cover"
            />

            {/* Render genuine detected spot markers only if present and user explicitly enables */}
            {showOverlays &&
              filteredLandmarks.map((lm) => {
                const isActive = activeMarkerId === lm.id;
                return (
                  <div
                    key={lm.id}
                    style={{ left: `${lm.x}%`, top: `${lm.y}%` }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                  >
                    <button
                      onClick={() => setActiveMarkerId(isActive ? null : lm.id)}
                      className={`relative flex items-center justify-center p-2 focus:outline-none transition-transform ${
                        isActive ? "scale-125" : ""
                      }`}
                      aria-label={lm.label}
                    >
                      <span className="relative flex h-4 w-4">
                        <span
                          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                            lm.type === "spot" ? "bg-rose-400" : lm.type === "wrinkle" ? "bg-amber-400" : "bg-teal-400"
                          }`}
                        />
                        <span
                          className={`relative inline-flex rounded-full h-4 w-4 border-2 border-white shadow ${
                            lm.type === "spot" ? "bg-rose-500" : lm.type === "wrinkle" ? "bg-amber-500" : "bg-teal-500"
                          }`}
                        />
                      </span>
                    </button>
                  </div>
                );
              })}

            {/* Popup info when a genuine spot is clicked */}
            {activeLandmark && showOverlays && (
              <div className="absolute bottom-2 left-2 right-2 z-30 rounded-xl bg-slate-900/95 backdrop-blur-md p-3 text-white shadow-xl border border-slate-700 animate-in fade-in">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-emerald-400">{activeLandmark.label}</span>
                  <button
                    onClick={() => setActiveMarkerId(null)}
                    className="text-[10px] text-slate-400 hover:text-white"
                  >
                    Close
                  </button>
                </div>
                <p className="text-[11px] text-slate-300 leading-snug">{activeLandmark.details}</p>
              </div>
            )}
          </div>
          <p className="text-[11px] text-center text-slate-400 mt-1.5">
            {filteredLandmarks.length > 0 && showOverlays
              ? "Tap any marked spot above to see genuine pigment density."
              : "Clean natural portrait. Zero artificial marks placed on your skin."}
          </p>
        </div>

        {/* 3. The Key Metrics: Tap to filter products directly */}
        <div className="md:col-span-7 flex flex-col space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Skin Assessment (Tap to filter products)
            </span>
            {selectedMetricFilter && (
              <button
                onClick={() => setSelectedMetricFilter(null)}
                className="text-xs font-semibold text-emerald-600 hover:underline"
              >
                Show All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {Object.values(data.metrics).map((metric) => {
              const isSelected = selectedMetricFilter === metric.id;
              return (
                <button
                  key={metric.id}
                  type="button"
                  onClick={() => {
                    setSelectedMetricFilter(isSelected ? null : metric.id);
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20 dark:bg-emerald-950/40"
                      : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      {getMetricIcon(metric.id)}
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {metric.label}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      {metric.score}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden dark:bg-slate-800 mb-1">
                    <div
                      className={`h-1.5 rounded-full ${
                        metric.score >= 75
                          ? "bg-emerald-500"
                          : metric.score >= 60
                          ? "bg-teal-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${metric.score}%` }}
                    />
                  </div>

                  <span className="text-[10px] text-slate-500 block truncate">
                    {metric.status}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="rounded-xl bg-slate-100/70 p-3 text-xs text-slate-600 dark:bg-slate-800/60 dark:text-slate-300">
            <span className="font-semibold block mb-0.5 text-slate-800 dark:text-white">
              Doctor&apos;s Recommendation:
            </span>
            {data.metrics.moisture.score < 65
              ? "Focus on deeply hydrating serums morning and night to restore your skin's moisture barrier."
              : data.metrics.spots.score < 65
              ? "Apply vitamin C or brightening serums daily with SPF 50 to fade sun marks."
              : "Keep up your daily cleansing and gentle moisturizing routine to maintain this healthy glow."}
          </div>
        </div>
      </div>

      {/* 4. Products You Need: Tailored to your photo */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
        <ProductRecommendations
          products={recommendedProducts}
          title={
            selectedMetricFilter
              ? `Best Products for ${selectedMetricFilter.toUpperCase()}`
              : "Recommended For Your Skin"
          }
          subtitle="Selected based on your photo. Tap 'Try on Face' to see the difference before buying."
        />
      </div>
    </div>
  );
}
