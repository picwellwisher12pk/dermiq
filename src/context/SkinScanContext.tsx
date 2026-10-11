"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { SkinAnalysisResult, RecommendedProduct } from "@/types/skin";
import { analyzeSkinImage, getProductById, PRODUCT_CATALOG, AnalyzeSkinOptions } from "@/lib/youcam";

interface SkinScanContextType {
  uploadedImage: string | null;
  isAnalyzing: boolean;
  analysisProgress: { stage: string; percent: number };
  analysisResult: SkinAnalysisResult | null;
  activeVtoProduct: RecommendedProduct | null;
  selectedMetricFilter: string | null;
  startAnalysis: (imageSrc: string, options?: AnalyzeSkinOptions) => Promise<SkinAnalysisResult>;
  resetAnalysis: () => void;
  openVtoModal: (product: RecommendedProduct) => void;
  closeVtoModal: () => void;
  setSelectedMetricFilter: (metric: string | null) => void;
}

const SkinScanContext = createContext<SkinScanContextType | undefined>(undefined);

const STORAGE_KEY_ANALYSIS = "dermiq_last_analysis";
const STORAGE_KEY_IMAGE = "dermiq_last_image";

export function SkinScanProvider({ children }: { children: React.ReactNode }) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ stage: "", percent: 0 });
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null);
  const [activeVtoProduct, setActiveVtoProduct] = useState<RecommendedProduct | null>(null);
  const [selectedMetricFilter, setSelectedMetricFilter] = useState<string | null>(null);

  // Restore on mount if available in session storage
  useEffect(() => {
    try {
      const savedAnalysis = sessionStorage.getItem(STORAGE_KEY_ANALYSIS);
      const savedImage = sessionStorage.getItem(STORAGE_KEY_IMAGE);
      if (savedAnalysis) {
        setAnalysisResult(JSON.parse(savedAnalysis));
      }
      if (savedImage) {
        setUploadedImage(savedImage);
      }
    } catch (e) {
      console.warn("Could not read previous scan session", e);
    }
  }, []);

  const startAnalysis = async (
    imageSrc: string,
    options?: AnalyzeSkinOptions
  ): Promise<SkinAnalysisResult> => {
    setIsAnalyzing(true);
    setUploadedImage(imageSrc);
    setAnalysisProgress({ stage: "Initializing YouCam Neural Skin Engine...", percent: 5 });

    try {
      const result = await analyzeSkinImage(
        imageSrc,
        (stage, percent) => {
          setAnalysisProgress({ stage, percent });
        },
        options
      );

      setAnalysisResult(result);
      try {
        sessionStorage.setItem(STORAGE_KEY_ANALYSIS, JSON.stringify(result));
        sessionStorage.setItem(STORAGE_KEY_IMAGE, imageSrc);
      } catch (err) {
        // Storage might fail if image data URL is large; ignore gracefully
      }
      return result;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    setUploadedImage(null);
    setAnalysisResult(null);
    setActiveVtoProduct(null);
    try {
      sessionStorage.removeItem(STORAGE_KEY_ANALYSIS);
      sessionStorage.removeItem(STORAGE_KEY_IMAGE);
    } catch (err) {
      // Ignore
    }
  };

  const openVtoModal = (product: RecommendedProduct) => {
    setActiveVtoProduct(product);
  };

  const closeVtoModal = () => {
    setActiveVtoProduct(null);
  };

  return (
    <SkinScanContext.Provider
      value={{
        uploadedImage,
        isAnalyzing,
        analysisProgress,
        analysisResult,
        activeVtoProduct,
        selectedMetricFilter,
        startAnalysis,
        resetAnalysis,
        openVtoModal,
        closeVtoModal,
        setSelectedMetricFilter
      }}
    >
      {children}
    </SkinScanContext.Provider>
  );
}

export function useSkinScan() {
  const context = useContext(SkinScanContext);
  if (!context) {
    throw new Error("useSkinScan must be used within a SkinScanProvider");
  }
  return context;
}
