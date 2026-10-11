"use client";

import React from "react";
import ImageUploader from "@/components/ImageUploader";

export default function ScannerPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center py-4 px-3 sm:px-6 max-w-xl mx-auto">
      <div className="w-full">
        <ImageUploader />
      </div>
    </div>
  );
}
