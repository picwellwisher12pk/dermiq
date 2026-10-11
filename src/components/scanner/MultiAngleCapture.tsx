"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Camera,
  RotateCcw,
  CheckCircle2,
  ArrowRight,
  Sun,
  UserCheck,
  SwitchCamera
} from "lucide-react";
import { useSkinScan } from "@/context/SkinScanContext";
import { useRouter } from "next/navigation";

interface MultiAngleCaptureProps {
  onScanComplete?: () => void;
}

type Angle = "front" | "left" | "right";

const ANGLE_STEPS: Array<{ key: Angle; label: string; prompt: string }> = [
  { key: "front", label: "1. Direct Front", prompt: "Look straight into the camera" },
  { key: "left", label: "2. Left 45° Angle", prompt: "Turn head slightly to your left" },
  { key: "right", label: "3. Right 45° Angle", prompt: "Turn head slightly to your right" }
];

export default function MultiAngleCapture({ onScanComplete }: MultiAngleCaptureProps) {
  const router = useRouter();
  const { startAnalysis, isAnalyzing } = useSkinScan();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [capturedAngles, setCapturedAngles] = useState<{
    front?: string;
    left?: string;
    right?: string;
  }>({});
  const [cameraActive, setCameraActive] = useState(false);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentAngle = ANGLE_STEPS[currentStepIndex];

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
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("Camera not accessible on this device.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: mode, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      setErrorMessage("Could not start camera. Please grant camera permissions.");
      setCameraActive(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopCameraStream();
    };
  }, [facingMode]);

  const snapCurrentAngle = () => {
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

    const stepKey = currentAngle.key;
    const updated = { ...capturedAngles, [stepKey]: dataUrl };
    setCapturedAngles(updated);

    if (currentStepIndex < 2) {
      setCurrentStepIndex(currentStepIndex + 1);
    }
  };

  const retakeAngle = (index: number) => {
    setCurrentStepIndex(index);
    const key = ANGLE_STEPS[index].key;
    const nextAngles = { ...capturedAngles };
    delete nextAngles[key];
    setCapturedAngles(nextAngles);
  };

  const allAnglesCaptured =
    Boolean(capturedAngles.front) && Boolean(capturedAngles.left) && Boolean(capturedAngles.right);

  const executeCompositeAnalysis = async () => {
    if (!capturedAngles.front) return;

    try {
      await startAnalysis(capturedAngles.front, {
        mode: "multi_angle",
        images: {
          front: capturedAngles.front,
          left: capturedAngles.left,
          right: capturedAngles.right
        }
      });

      stopCameraStream();
      if (onScanComplete) {
        onScanComplete();
      } else {
        router.push("/dashboard");
      }
    } catch (err: any) {
      setErrorMessage(err?.message || "Could not complete multi-angle scan. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3.5">
      {/* Step Tracker Indicator */}
      <div className="grid grid-cols-3 gap-2 w-full">
        {ANGLE_STEPS.map((step, idx) => {
          const isDone = Boolean(capturedAngles[step.key]);
          const isCurrent = currentStepIndex === idx;

          return (
            <button
              key={step.key}
              type="button"
              onClick={() => isDone && retakeAngle(idx)}
              className={`p-2 rounded-xl text-left border transition-all ${
                isCurrent
                  ? "border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/40 ring-1 ring-emerald-500"
                  : isDone
                  ? "border-emerald-200 bg-white dark:border-slate-800 dark:bg-slate-900"
                  : "border-slate-200 bg-slate-50 opacity-60 dark:border-slate-800 dark:bg-slate-800/40"
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-bold text-slate-500">{step.label}</span>
                {isDone && <CheckCircle2 className="h-3 w-3 text-emerald-600" />}
              </div>
              <span className="text-[11px] font-semibold text-slate-900 dark:text-white truncate block">
                {isDone ? "Captured ✓" : isCurrent ? "Active" : "Pending"}
              </span>
            </button>
          );
        })}
      </div>

      {errorMessage && (
        <div className="w-full rounded-xl bg-rose-50 p-2.5 text-xs text-rose-700 dark:bg-rose-950/50 dark:text-rose-300">
          {errorMessage}
        </div>
      )}

      {/* Camera Viewfinder */}
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

        {/* Dynamic Pose Guide Overlay */}
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div
            className={`w-[66%] h-[74%] rounded-[50%] border-2 transition-all duration-300 ${
              currentAngle.key === "front"
                ? "border-dashed border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                : currentAngle.key === "left"
                ? "border-dashed border-teal-400 -rotate-12 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
                : "border-dashed border-teal-400 rotate-12 shadow-[0_0_20px_rgba(20,184,166,0.3)]"
            }`}
          />
        </div>

        {/* Prompt Banner */}
        <div className="absolute top-3 left-3 right-3 text-center pointer-events-none">
          <span className="inline-block bg-slate-950/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-white backdrop-blur-md border border-white/10 shadow-lg">
            {currentAngle.prompt}
          </span>
        </div>

        {/* Shutter Button floating over bottom */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={snapCurrentAngle}
            disabled={!cameraActive || isAnalyzing}
            className="flex items-center justify-center h-14 w-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-xl hover:scale-105 active:scale-95 transition-all ring-4 ring-emerald-500/30"
            aria-label={`Capture ${currentAngle.label}`}
          >
            <Camera className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Captured Mini Thumbnails Strip */}
      <div className="flex items-center justify-between w-full gap-2 pt-1">
        {(["front", "left", "right"] as Angle[]).map((ang, i) => {
          const img = capturedAngles[ang];
          return (
            <div
              key={ang}
              className="relative aspect-square w-16 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 dark:border-slate-800 dark:bg-slate-800"
            >
              {img ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={img} alt={ang} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] text-slate-400 font-semibold uppercase">
                  {ang}
                </div>
              )}
            </div>
          );
        })}

        {/* Execute Button */}
        <button
          type="button"
          onClick={executeCompositeAnalysis}
          disabled={!allAnglesCaptured || isAnalyzing}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-3 px-3 text-xs font-bold text-white shadow disabled:opacity-40 hover:bg-emerald-600 dark:bg-white dark:text-slate-900 transition-all"
        >
          Analyze 360° Profile
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
