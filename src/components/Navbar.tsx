"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, Camera, HeartHandshake, ShoppingBag, Menu, X } from "lucide-react";
import { APP_NAME } from "@/lib/version";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/95">
      <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 to-emerald-600 text-white shadow-sm transition-transform group-hover:scale-105">
            <Sparkles className="h-4 w-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-none">
              {APP_NAME}
            </span>
            <span className="text-[10px] text-slate-500 font-medium mt-0.5">
              Personal Skin Care
            </span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600 dark:text-slate-300">
          <Link
            href="/scanner"
            className="flex items-center gap-1.5 transition-colors hover:text-emerald-600"
          >
            <Camera className="h-4 w-4 text-emerald-600" />
            Check My Skin
          </Link>
          <Link
            href="/dashboard"
            className="transition-colors hover:text-emerald-600"
          >
            My Skin Report
          </Link>
          <Link
            href="/marketplace"
            className="flex items-center gap-1.5 transition-colors hover:text-emerald-600"
          >
            <ShoppingBag className="h-4 w-4 text-slate-400" />
            Recommended Products
          </Link>
        </nav>

        {/* Primary CTA */}
        <div className="flex items-center gap-2">
          <Link
            href="/scanner"
            className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 transition-all dark:bg-white dark:text-slate-900"
          >
            <Camera className="h-3.5 w-3.5 mr-1.5" />
            Take a Photo
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            aria-label="Open menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 dark:border-slate-800 dark:bg-slate-950">
          <Link
            href="/scanner"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            <Camera className="h-4 w-4 text-emerald-600" />
            Check My Skin
          </Link>
          <Link
            href="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            My Skin Report
          </Link>
          <Link
            href="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2.5 py-2.5 text-sm font-medium text-slate-800 dark:text-slate-200"
          >
            <ShoppingBag className="h-4 w-4 text-slate-400" />
            Recommended Products
          </Link>
        </div>
      )}
    </header>
  );
}
