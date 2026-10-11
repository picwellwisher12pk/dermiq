"use client";

import React, { useRef } from "react";
import { X, Printer, ShieldCheck, Calendar, Hash, Activity } from "lucide-react";
import { SkinAnalysisResult } from "@/types/skin";
import { PRODUCT_CATALOG } from "@/lib/youcam";

interface ClinicalReportModalProps {
  result: SkinAnalysisResult;
  onClose: () => void;
}

export default function ClinicalReportModal({ result, onClose }: ClinicalReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(result.timestamp).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  const matchingProducts = PRODUCT_CATALOG.filter((p) =>
    result.recommendedProductIds.includes(p.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto">
      <div
        ref={reportRef}
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-white shadow-2xl border border-slate-200 dark:bg-slate-900 dark:border-slate-800 print:max-h-none print:shadow-none print:border-none print:p-0"
      >
        {/* Modal Sticky Header (Hidden on Print) */}
        <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 py-3.5 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 print:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-white font-bold text-xs">
              DQ
            </span>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                Clinical Skin Health Dossier
              </h3>
              <span className="text-[10px] text-slate-400">Authentic Diagnostic Summary</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 transition-colors dark:bg-white dark:text-slate-900"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 dark:text-slate-100 print:text-black print:p-0">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                DermIQ Diagnostic Laboratory
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mt-0.5">
                Dermatological Health Assessment
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Verified Multi-Zone Optical Biometric Analysis
              </p>
            </div>

            <div className="flex flex-col text-xs text-slate-500 space-y-1 sm:text-right">
              <span className="inline-flex items-center sm:justify-end gap-1 font-mono text-[11px]">
                <Hash className="h-3.5 w-3.5 text-slate-400" />
                {result.scanId}
              </span>
              <span className="inline-flex items-center sm:justify-end gap-1 text-[11px]">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                {formattedDate}
              </span>
              <span className="inline-flex items-center sm:justify-end gap-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                {result.engineDetails || "Optical Biometric CV Engine"}
              </span>
            </div>
          </div>

          {/* Primary Biometrics Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-center dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Overall Index
              </span>
              <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
                {result.overallScore}
                <span className="text-xs font-semibold text-slate-400">/100</span>
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-center dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Skin Age
              </span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                ~{result.skinAgeEstimate}
                <span className="text-xs font-semibold text-slate-400"> yrs</span>
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-center dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Skin Type
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 block">
                {result.skinType}
              </span>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5 text-center dark:border-slate-800 dark:bg-slate-800/40">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Detected Spots
              </span>
              <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white mt-1 block">
                {result.landmarks.length > 0 ? `${result.landmarks.length} Lesions` : "Clear"}
              </span>
            </div>
          </div>

          {/* 6-Parameter Matrix Table */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5 text-emerald-600" />
              Cellular & Dermal Metrics Breakdown
            </h4>

            <div className="rounded-2xl border border-slate-200 overflow-hidden dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100 text-[10px] uppercase font-bold text-slate-500 dark:bg-slate-800/80">
                  <tr>
                    <th className="py-2.5 px-3.5">Metric</th>
                    <th className="py-2.5 px-3">Score</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3.5 hidden sm:table-cell">Clinical Assessment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {Object.values(result.metrics).map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3.5 font-bold text-slate-900 dark:text-white">
                        {m.label}
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {m.score}%
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            m.score >= 75
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                              : m.score >= 60
                              ? "bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                          }`}
                        >
                          {m.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3.5 text-[11px] text-slate-500 hidden sm:table-cell leading-tight">
                        {m.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Doctor Recommendation */}
          <div className="rounded-2xl bg-emerald-50/80 p-4 border border-emerald-200/60 dark:bg-emerald-950/40 dark:border-emerald-800/60">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-200 uppercase tracking-wide mb-1">
              Physician Diagnostic Opinion
            </h4>
            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              Patient exhibits primary focus in{" "}
              <strong className="text-emerald-800 dark:text-emerald-300">
                {result.primaryConcern}
              </strong>
              . Recommended strategy centers on barrier restoration, regular SPF 50 photoprotection,
              and targeted active application to normalize epidermal cell turnover.
            </p>
          </div>

          {/* Recommended Active Formulations */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
              Prescribed Topical Actives
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {matchingProducts.map((p) => (
                <div
                  key={p.id}
                  className="rounded-xl border border-slate-200 p-3 bg-white dark:border-slate-800 dark:bg-slate-800/60"
                >
                  <span className="text-[10px] font-bold text-emerald-600 block uppercase">
                    {p.category} • {p.matchingMetricTag}
                  </span>
                  <span className="text-xs font-bold text-slate-900 dark:text-white block truncate mt-0.5">
                    {p.name}
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {p.keyIngredients.map((ing) => (
                      <span
                        key={ing}
                        className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                      >
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Notice */}
          <div className="border-t border-slate-200 pt-4 text-center text-[10px] text-slate-400 dark:border-slate-800">
            This report was computationally generated by DermIQ using authenticated optical dermal
            biometrics. For clinical dermatology emergencies, consult a board-certified physician.
          </div>
        </div>
      </div>
    </div>
  );
}
