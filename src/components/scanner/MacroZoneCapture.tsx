"use client";

import React, { useState, useRef, useEffect } from "react";
import { Camera, ArrowRight, RotateCcw, ScanLine, Layers, CheckCircle2 } from "lucide-react";
import { useSkinScan } from "@/context/SkinScanContext";
import { useRouter } from "next/navigation";

interface MacroZoneCaptureProps {
  onScanComplete?: () => void;
}

export default function MacroZoneCapture({ onScanComplete }: MacroZoneCaptureProps) {
  const router = useRouter();
  const { startAnalysis, isAnalyzing } = useSkinScan();

  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startCamera = async () => {
    stopCameraStream();
    setErrorMessage(null);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera not accessible on this device.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      setErrorMessage("Could not start high-res camera stream.");
      setCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCameraStream();
    };
  }, []);

  const captureHighResPortrait = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);

    setPreviewImage(dataUrl);
    stopCameraStream();
  };

  const executeMacroAnalysis = async () => {
    if (!previewImage) return;

    try {
      await startAnalysis(previewImage, { mode: "macro_zones" });
      if (onScanComplete) {
        onScanComplete();
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Could not analyze macro zones. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3.5">
      {/* Information Header */}
      <div className="w-full rounded-2xl bg-teal-50/70 p-3 border border-teal-200/60 dark:bg-teal-950/40 dark:border-teal-800/60">
        <div className="flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-teal-600 dark:text-teal-400" />
          <span className="text-xs font-bold text-teal-950 dark:text-teal-200">
            High-Resolution 4-Zone Macro Extraction
          </span>
        </div>
        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
          Takes one full portrait, then extracts 4 anatomical micro-crops at 1:1 optical pixel fidelity for Forehead Furrows, Left & Right Cheek Melanin, and T-Zone Pores.
        </p>
      </div>

      {errorMessage && (
        <div className="w-full rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      {/* Main Screen View */}
      {previewImage ? (
        <div className="w-full flex flex-col items-center">
          <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-950 shadow-md border border-slate-800">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={previewImage} alt="Portrait preview" className="h-full w-full object-cover" />

            {/* Visual Callout Boxes showing the 4 Macro Zones */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Forehead Zone Box */}
              <div className="absolute left-[28%] top-[12%] w-[44%] h-[22%] border-2 border-emerald-400/90 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <span className="absolute -top-4 left-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[8px] font-bold text-emerald-300">
                  Forehead Lines
                </span>
              </div>

              {/* Left Cheek Box */}
              <div className="absolute left-[16%] top-[36%] w-[28%] h-[28%] border-2 border-teal-400/90 rounded-lg shadow-[0_0_15px_rgba(20,184,166,0.4)]">
                <span className="absolute -top-4 left-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[8px] font-bold text-teal-300">
                  Left Cheek
                </span>
              </div>

              {/* Right Cheek Box */}
              <div className="absolute left-[56%] top-[36%] w-[28%] h-[28%] border-2 border-teal-400/90 rounded-lg shadow-[0_0_15px_rgba(20,184,166,0.4)]">
                <span className="absolute -top-4 left-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[8px] font-bold text-teal-300">
                  Right Cheek
                </span>
              </div>

              {/* T-Zone Box */}
              <div className="absolute left-[36%] top-[30%] w-[28%] h-[32%] border-2 border-amber-400/90 rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                <span className="absolute -bottom-4 left-1 bg-slate-950/80 px-1.5 py-0.5 rounded text-[8px] font-bold text-amber-300">
                  T-Zone Pores
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setPreviewImage(null);
                startCamera();
              }}
              className="absolute top-2.5 right-2.5 inline-flex items-center gap-1 rounded-lg bg-slate-950/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md hover:bg-slate-900"
            >
              <RotateCcw className="h-3 w-3" />
              Retake
            </button>
          </div>

          <button
            type="button"
            onClick={executeMacroAnalysis}
            disabled={isAnalyzing}
            className="mt-3.5 w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 py-3.5 px-6 text-sm font-bold text-white shadow-lg hover:bg-emerald-600 active:scale-98 transition-all dark:bg-emerald-600 dark:hover:bg-emerald-500"
          >
            Analyze 4 Macro Zones
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <div className="relative aspect-[4/5] w-full rounded-2xl overflow-hidden bg-slate-950 shadow-inner border border-slate-800">
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className="h-full w-full object-cover scale-x-[-1]"
            />

            {/* Oval Face Boundary */}
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-[66%] h-[74%] rounded-[50%] border-2 border-dashed border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.3)] animate-pulse" />
            </div>

            <div className="absolute bottom-2.5 left-0 right-0 text-center pointer-events-none">
              <span className="inline-block bg-slate-950/80 px-3 py-1 rounded-full text-[11px] font-medium text-teal-300 backdrop-blur-sm">
                Hold still for high-res macro capture
              </span>
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-center">
            <button
              type="button"
              onClick={captureHighResPortrait}
              disabled={!cameraActive}
              className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-lg hover:scale-105 active:scale-95 transition-all ring-4 ring-teal-500/20"
              aria-label="Capture High-Res Photo"
            >
              <Camera className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
