export interface SkinMetric {
  id: "moisture" | "texture" | "wrinkles" | "spots" | "oiliness" | "pores";
  label: string;
  score: number; // 0 - 100
  status: "Excellent" | "Good" | "Needs Attention" | "Critical";
  color: string;
  description: string;
  benchmarkPercentile: number;
}

export interface LandmarkCoordinate {
  id: string;
  x: number; // percentage (0 - 100)
  y: number; // percentage (0 - 100)
  type: "wrinkle" | "spot" | "hydration_low" | "texture_uneven" | "pore_focus";
  severity: "mild" | "moderate" | "pronounced";
  label: string;
  details: string;
}

export interface RecommendedProduct {
  id: string;
  name: string;
  brand: string;
  category: "Serum" | "Cream" | "Toner" | "Exfoliant" | "Sunscreen";
  price: number;
  rating: number;
  reviewsCount: number;
  matchingMetricTag: string;
  metricTarget: "moisture" | "texture" | "wrinkles" | "spots";
  description: string;
  keyIngredients: string[];
  imageUrl: string;
  vtoEffect: {
    title: string;
    description: string;
    overlayType: "glow" | "smoothing" | "firming" | "clarifying";
    expectedTimeline: string;
    beforeAfterPreview: {
      beforeDescription: string;
      afterDescription: string;
      simulatedChange: string;
    };
  };
}

export interface SkinAnalysisResult {
  scanId: string;
  timestamp: string;
  imageUrl: string;
  overallScore: number; // 0 - 100
  skinAgeEstimate: number;
  skinType: "Dry" | "Normal" | "Combination" | "Oily" | "Sensitive";
  primaryConcern: string;
  metrics: Record<string, SkinMetric>;
  landmarks: LandmarkCoordinate[];
  recommendedProductIds: string[];
  engineSource?: "youcam_live_s2s" | "authentic_optical_cv";
  engineDetails?: string;
}
