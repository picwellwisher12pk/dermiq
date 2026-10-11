"use client";

import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import VtoModal from "@/components/VtoModal";
import { useSkinScan } from "@/context/SkinScanContext";

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const { activeVtoProduct, closeVtoModal } = useSkinScan();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      {activeVtoProduct && <VtoModal product={activeVtoProduct} onClose={closeVtoModal} />}
    </div>
  );
}
