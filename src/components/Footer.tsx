import React from "react";
import Link from "next/link";
import { Sparkles, Shield, Cpu, ExternalLink } from "lucide-react";
import { APP_VERSION, APP_NAME } from "@/lib/version";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/50 py-12 dark:border-slate-800 dark:bg-slate-950/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand Col */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                <Sparkles className="h-4 w-4" />
              </div>
              <span className="font-semibold text-lg text-slate-900 dark:text-white">
                {APP_NAME}
              </span>
              <span className="text-xs text-slate-500 font-mono">v{APP_VERSION}</span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              DermIQ bridges clinical-grade dermatological AI computer vision with interactive
              e-commerce virtual try-ons (VTO). Built for the YouCam Skin AI & eCommerce Hackathon.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Shield className="h-4 w-4 text-emerald-600" />
              <span>Zero server-storage biometric privacy compliance simulation</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Application
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <Link href="/scanner" className="hover:text-emerald-600 transition-colors">
                  AI Face Scanner
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-emerald-600 transition-colors">
                  Clinical Metrics Matrix
                </Link>
              </li>
              <li>
                <Link href="/marketplace" className="hover:text-emerald-600 transition-colors">
                  Recommended Regimen
                </Link>
              </li>
            </ul>
          </div>

          {/* Tech & Hackathon */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Hackathon Track
            </h4>
            <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <p className="flex items-center gap-1.5 text-xs">
                <Cpu className="h-3.5 w-3.5 text-teal-600" />
                YouCam Skin AI API & AR VTO
              </p>
              <p className="text-xs text-slate-500">
                Next.js 16 App Router · Tailwind CSS v4 · TypeScript
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200/70 pt-6 dark:border-slate-800/70 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 DermIQ Health Technologies. All rights reserved.</p>
          <p className="flex items-center gap-1">
            Built for YouCam Skin AI & eCommerce VTO Hackathon
          </p>
        </div>
      </div>
    </footer>
  );
}
