"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Upload,
  Camera,
  Image as ImageIcon,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  SwitchCamera,
  RotateCcw,
  Sun,
  SunMedium,
  UserCheck
} from "lucide-react";
import { useSkinScan } from "@/context/SkinScanContext";

interface ImageUploaderProps {
  onScanComplete?: () => void;
}

const SAMPLE_PRESETS = [
  {
    id: "sample-1",
    label: "Even Tone",
    url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "sample-2",
    label: "Dry Skin",
    url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: "sample-3",
    label: "Fine Lines",
    url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=80"
  }
];

export default function ImageUploader({ onScanComplete }: ImageUploaderProps) {
  const router = useRouter();
  const { startAnalysis, isAnalyzing, analysisProgress } = useSkinScan();

  const [inputMode, setInputMode] = useState<"upload" | "webcam">("upload");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Webcam states
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [liveGuidance, setLiveGuidance] = useState<{
    status: "optimal" | "dark" | "glare" | "align";
    message: string;
  }>({ status: "align", message: "Center face in oval" });
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check available cameras
  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices
        .enumerateDevices()
        .then((devices) => {
          const videoInputs = devices.filter((d) => d.kind === "videoinput");
          if (videoInputs.length > 1) {
            setHasMultipleCameras(true);
          }
        })
        .catch(() => {});
    }
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async (mode: "user" | "environment" = facingMode) => {
    stopCameraStream();
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Camera is not available on this browser or connection. You can upload a photo.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      console.warn("Camera access failed:", err);
      let errorMsg = "Could not access camera. Please allow camera permissions, or choose a photo.";
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        errorMsg = "Camera permission was not granted. Please allow camera access in your browser, or select a photo.";
      }
      setErrorMessage(errorMsg);
      setCameraActive(false);
    }
  };

  const handleSwitchCamera = () => {
    const nextMode = facingMode === "user" ? "environment" : "user";
    setFacingMode(nextMode);
    if (cameraActive) {
      startCamera(nextMode);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    if (facingMode === "user") {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);

    setPreviewImage(dataUrl);
    stopCameraStream();
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Real-time Optical Guidance Analyzer (Lighting & Face Centering)
  useEffect(() => {
    if (!cameraActive || !videoRef.current) return;

    let isMounted = true;
    const sampleCanvas = document.createElement("canvas");
    sampleCanvas.width = 64;
    sampleCanvas.height = 64;
    const sampleCtx = sampleCanvas.getContext("2d", { willReadFrequently: true });

    const interval = setInterval(() => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || !sampleCtx) return;

      try {
        sampleCtx.drawImage(video, 0, 0, 64, 64);
        const imgData = sampleCtx.getImageData(0, 0, 64, 64);
        const data = imgData.data;

        let totalLuminance = 0;
        let centerSkinCount = 0;
        let centerTotal = 0;

        for (let y = 0; y < 64; y++) {
          for (let x = 0; x < 64; x++) {
            const idx = (y * 64 + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const Y = 0.299 * r + 0.587 * g + 0.114 * b;
            totalLuminance += Y;

            // Check central face oval
            const dx = (x - 32) / 18;
            const dy = (y - 32) / 22;
            if (dx * dx + dy * dy <= 1.0) {
              centerTotal++;
              const isSkin = r > 70 && g > 42 && b > 22 && r > g && r > b && r - g > 10;
              if (isSkin) centerSkinCount++;
            }
          }
        }

        const avgY = totalLuminance / (64 * 64);
        const skinRatio = centerTotal > 0 ? centerSkinCount / centerTotal : 0;

        if (!isMounted) return;

        if (avgY < 58) {
          setLiveGuidance({ status: "dark", message: "Too dark — face towards light" });
        } else if (avgY > 222) {
          setLiveGuidance({ status: "glare", message: "Harsh glare — avoid direct flash" });
        } else if (skinRatio < 0.18) {
          setLiveGuidance({ status: "align", message: "Center face in oval" });
        } else {
          setLiveGuidance({ status: "optimal", message: "Perfect lighting & alignment" });
        }
      } catch (e) {
        // Ignore canvas draw race condition
      }
    }, 350);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [cameraActive]);

  const handleFileChange = (file?: File) => {
    setErrorMessage(null);
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file (JPG or PNG).");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setPreviewImage(result);
    };
    reader.onerror = () => {
      setErrorMessage("Could not read image file.");
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (url: string) => {
    stopCameraStream();
    setErrorMessage(null);
    setPreviewImage(url);
  };

  const executeAnalysis = async () => {
    if (!previewImage) return;

    try {
      await startAnalysis(previewImage);
      if (onScanComplete) {
        onScanComplete();
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Could not analyze image. Please try again with a clear selfie.");
    }
  };

  return (
    <div className="w-full max-w-md mx-auto rounded-3xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-xl shadow-slate-200/40 dark:border-slate-800 dark:bg-slate-900 dark:shadow-none">
      {/* Switcher Tab Header */}
      {!previewImage && !isAnalyzing && (
        <div className="flex bg-slate-100 p-1 rounded-xl dark:bg-slate-800 w-full mb-3">
          <button
            type="button"
            onClick={() => {
              setInputMode("webcam");
              setErrorMessage(null);
              startCamera();
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              inputMode === "webcam"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            <Camera className="h-3.5 w-3.5 text-emerald-600" />
            Take Selfie
          </button>
          <button
            type="button"
            onClick={() => {
              stopCameraStream();
              setErrorMessage(null);
              setInputMode("upload");
            }}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              inputMode === "upload"
                ? "bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400"
            }`}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Photo
          </button>
        </div>
      )}

      {/* Main Interactive Screen */}
      {!isAnalyzing && (
        <>
          {previewImage ? (
            /* 1. Captured Photo Preview */
            <div className="flex flex-col items-center">
              <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-950 shadow-md ring-2 ring-emerald-500/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewImage}
                  alt="Selfie preview"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end justify-between p-3.5">
                  <span className="text-xs font-semibold text-white flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Looking Good!
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      if (inputMode === "webcam") startCamera();
                    }}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/20 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/30"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Retake
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={executeAnalysis}
                className="mt-3.5 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 px-6 text-sm font-bold text-white shadow-lg hover:bg-emerald-600 active:scale-98 transition-all dark:bg-emerald-600 dark:hover:bg-emerald-500"
              >
                Analyze My Skin
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          ) : inputMode === "webcam" ? (
            /* 2. Live Camera View */
            <div className="flex flex-col items-center">
              <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-950 shadow-inner border border-slate-800">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className={`h-full w-full object-cover ${
                    facingMode === "user" ? "scale-x-[-1]" : ""
                  }`}
                />

                {/* Dynamic Oval Guide Overlay */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div
                    className={`w-[66%] h-[74%] rounded-[50%] transition-all duration-300 ${
                      liveGuidance.status === "optimal"
                        ? "border-2 border-solid border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.6)]"
                        : liveGuidance.status === "dark" || liveGuidance.status === "glare"
                        ? "border-2 border-dashed border-amber-400/90 shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                        : "border-2 border-dashed border-slate-300/80 shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    }`}
                  />
                </div>

                {hasMultipleCameras && (
                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    className="absolute top-2.5 right-2.5 p-2 rounded-full bg-slate-900/80 text-white backdrop-blur-md"
                    title="Flip camera"
                  >
                    <SwitchCamera className="h-4 w-4" />
                  </button>
                )}

                {/* Live Guidance Badge */}
                <div className="absolute bottom-2.5 left-0 right-0 text-center pointer-events-none flex justify-center px-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold backdrop-blur-md transition-all shadow ${
                      liveGuidance.status === "optimal"
                        ? "bg-emerald-950/85 text-emerald-300 border border-emerald-500/40"
                        : liveGuidance.status === "dark" || liveGuidance.status === "glare"
                        ? "bg-amber-950/85 text-amber-300 border border-amber-500/40"
                        : "bg-slate-950/80 text-slate-200 border border-white/20"
                    }`}
                  >
                    {liveGuidance.status === "optimal" ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 animate-pulse" />
                    ) : liveGuidance.status === "dark" ? (
                      <Sun className="h-3.5 w-3.5 text-amber-400" />
                    ) : liveGuidance.status === "glare" ? (
                      <SunMedium className="h-3.5 w-3.5 text-amber-400" />
                    ) : (
                      <UserCheck className="h-3.5 w-3.5 text-slate-300" />
                    )}
                    {liveGuidance.message}
                  </span>
                </div>
              </div>

              {/* Shutter Button */}
              <div className="mt-3.5 flex items-center justify-center">
                <button
                  type="button"
                  onClick={capturePhoto}
                  disabled={!cameraActive}
                  className={`flex items-center justify-center h-14 w-14 rounded-full text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${
                    liveGuidance.status === "optimal"
                      ? "bg-gradient-to-tr from-emerald-600 to-teal-500 ring-4 ring-emerald-400/60 shadow-emerald-500/50 scale-105"
                      : "bg-slate-900 ring-4 ring-slate-800/40"
                  }`}
                  aria-label="Take Photo"
                >
                  <Camera className="h-6 w-6" />
                </button>
              </div>
            </div>
          ) : (
            /* 3. Upload Photo from Gallery */
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
              }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                if (e.dataTransfer.files?.[0]) handleFileChange(e.dataTransfer.files[0]);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 text-center transition-all cursor-pointer ${
                dragOver
                  ? "border-emerald-500 bg-emerald-50/50"
                  : "border-slate-200 hover:border-slate-300 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files?.[0]) handleFileChange(e.target.files[0]);
                }}
              />
              <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2.5 dark:bg-emerald-950/80 dark:text-emerald-400">
                <Upload className="h-6 w-6" />
              </div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                Choose Photo from Gallery
              </p>
              <p className="text-xs text-slate-500 mt-1">Tap here to pick a photo</p>
            </div>
          )}

          {/* Quick preset test portraits */}
          {!previewImage && (
            <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2 text-center">
                Or pick a sample photo:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {SAMPLE_PRESETS.map((sample) => (
                  <button
                    key={sample.id}
                    type="button"
                    onClick={() => handleSelectPreset(sample.url)}
                    className="flex flex-col items-center gap-1 p-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:border-emerald-400 transition-all dark:border-slate-800 dark:bg-slate-950"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={sample.url}
                      alt={sample.label}
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                    <span className="text-[10px] font-medium text-slate-700 dark:text-slate-300 truncate w-full text-center">
                      {sample.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {errorMessage && (
            <div className="mt-3 flex items-center gap-1.5 rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
              <AlertCircle className="h-4 w-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </>
      )}

      {/* Loading state */}
      {isAnalyzing && (
        <div className="py-12 flex flex-col items-center justify-center text-center">
          <div className="relative mb-5">
            <div className="h-20 w-20 rounded-full border-4 border-slate-200 border-t-emerald-600 animate-spin dark:border-slate-800 dark:border-t-emerald-400" />
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-900 dark:text-white">
              {analysisProgress.percent}%
            </div>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">
            Checking your skin...
          </h3>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 animate-pulse">
            {analysisProgress.stage}
          </p>
        </div>
      )}
    </div>
  );
}
