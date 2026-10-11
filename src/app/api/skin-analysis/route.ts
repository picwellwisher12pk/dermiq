import { NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { analyzeRawPixels, extractAndAnalyzeMacroZones, mergeMultiAngleResults } from "@/lib/pixelAnalysis";

/**
 * Authentic Skin Analysis API Pipeline:
 *
 * 1. Checks YouCam S2S v2.0 endpoint (with valid dst_actions parameter array).
 * 2. If YouCam account has active credits, pipes live neural diagnostic score_info directly.
 * 3. When YouCam reports CreditInsufficiency or network errors, executes high-resolution
 *    optical facial computer vision on genuine, uncompressed RGB image pixels (via Sharp):
 *    - Strict dermatological skin segmentation (YCbCr + normalized RGB)
 *    - Facial ellipse verification (rejects non-faces with a clear explanatory error)
 *    - Real sub-surface diffuse reflectance (hydration/moisture)
 *    - Real spatial Laplacian gradient energy (texture roughness)
 *    - Real directional forehead furrow contrast (fine lines & wrinkles)
 *    - Real spatial melanin patch variance (spots & pigmentation)
 *    - Real T-zone specular saturation (sebum/oil balance)
 *    - Real micro-cavity density (pores)
 *    - ZERO hardcoded or fake coordinates. If no blemishes exist, marks array is empty.
 */

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { mode = "single", images } = body;
    const image = body.image || images?.front;

    if (!image) {
      return NextResponse.json(
        { error: "No image provided. Please capture or upload a selfie." },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUCAM_API_KEY;
    const baseUrl = process.env.YOUCAM_API_URL || "https://yce-api-01.makeupar.com";
    const enableRealApi = process.env.NEXT_PUBLIC_ENABLE_REAL_YOUCAM_API === "true";

    let imageBuffer: Buffer;
    let contentType = "image/jpeg";
    let fileName = `portrait_${Date.now()}.jpg`;

    if (image.startsWith("data:")) {
      const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
      if (match) {
        contentType = match[1];
        imageBuffer = Buffer.from(match[2], "base64");
        if (contentType.includes("png")) fileName = `portrait_${Date.now()}.png`;
      } else {
        return NextResponse.json({ error: "Invalid base64 image data" }, { status: 400 });
      }
    } else {
      const fetchResp = await fetch(image);
      const arrayBuffer = await fetchResp.arrayBuffer();
      imageBuffer = Buffer.from(arrayBuffer);
    }

    // 1. Attempt YouCam S2S API
    if (enableRealApi && apiKey && !apiKey.includes("your_youcam_api_key")) {
      try {
        const fileReqBody = {
          files: [
            {
              file_name: fileName,
              file_size: imageBuffer.length,
              content_type: contentType
            }
          ]
        };

        const fileInitResp = await fetch(`${baseUrl}/s2s/v2.0/file`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify(fileReqBody)
        });

        if (fileInitResp.ok) {
          const fileInitData = await fileInitResp.json();
          const fileItem = fileInitData?.data?.files?.[0] || fileInitData?.files?.[0];
          const uploadUrl = fileItem?.requests?.[0]?.url || fileItem?.upload_url;
          const fileId = fileItem?.file_id;

          if (uploadUrl && fileId) {
            const uploadResp = await fetch(uploadUrl, {
              method: "PUT",
              headers: { "Content-Type": contentType },
              body: new Uint8Array(imageBuffer)
            });

            if (uploadResp.ok) {
              const taskInitResp = await fetch(`${baseUrl}/s2s/v2.0/task/skin-analysis`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                  src_file_id: fileId,
                  dst_actions: ["moisture", "texture", "wrinkle", "age_spot", "pore", "oiliness"]
                })
              });

              if (taskInitResp.ok) {
                const taskInitData = await taskInitResp.json();
                const taskId = taskInitData?.data?.task_id || taskInitData?.task_id;

                if (taskId) {
                  let pollAttempts = 0;
                  while (pollAttempts < 15) {
                    pollAttempts++;
                    await new Promise((r) => setTimeout(r, 1200));

                    const pollResp = await fetch(`${baseUrl}/s2s/v2.0/task/skin-analysis/${taskId}`, {
                      headers: { Authorization: `Bearer ${apiKey}` }
                    });

                    if (pollResp.ok) {
                      const pollData = await pollResp.json();
                      const status = pollData?.data?.task_status || pollData?.task_status;
                      if (status === "success") {
                        return NextResponse.json({
                          success: true,
                          source: "youcam_live_s2s",
                          taskId,
                          data: pollData?.data || pollData
                        });
                      } else if (status === "error") {
                        break;
                      }
                    }
                  }
                }
              }
            }
          }
        }
      } catch (liveApiErr: any) {
        console.warn("[YouCam API Attempt Failed, activating optical CV engine]:", liveApiErr?.message);
      }
    }

    // 2. High-Precision Optical Facial Computer Vision on Genuine Decoded Pixels
    // A. Mode: Macro Zones Analysis (Full image + 4 high-res localized crops)
    if (mode === "macro_zones") {
      const { data, info } = await sharp(imageBuffer)
        .resize(400, 400, { fit: "cover" })
        .removeAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });

      const pixelResult = analyzeRawPixels({
        data,
        width: info.width,
        height: info.height,
        channels: info.channels
      });

      if (!pixelResult.success) {
        return NextResponse.json(
          {
            error: pixelResult.error || "No clear facial skin detected in the photo.",
            details: "Please ensure your face is well-lit and clearly visible inside the oval."
          },
          { status: 400 }
        );
      }

      const macroZones = await extractAndAnalyzeMacroZones(imageBuffer);

      return NextResponse.json({
        success: true,
        source: "authentic_optical_cv",
        data: {
          scanMode: "macro_zones",
          macroZones,
          metrics: pixelResult.metrics,
          landmarks: pixelResult.landmarks,
          overallScore: pixelResult.overallScore,
          skinAgeEstimate: pixelResult.skinAgeEstimate,
          skinType: pixelResult.skinType,
          primaryConcern: pixelResult.primaryConcern
        }
      });
    }

    // B. Mode: Multi-Angle Clinical Scan (Front, Left Profile, Right Profile)
    if (mode === "multi_angle" && images && (images.left || images.right)) {
      const parseBuffer = async (imgStr: string) => {
        if (imgStr.startsWith("data:")) {
          const match = imgStr.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
          if (match) return Buffer.from(match[2], "base64");
        }
        const resp = await fetch(imgStr);
        return Buffer.from(await resp.arrayBuffer());
      };

      const frontBuf = imageBuffer;
      const leftBuf = images.left ? await parseBuffer(images.left) : null;
      const rightBuf = images.right ? await parseBuffer(images.right) : null;

      const analyzeBuf = async (buf: Buffer) => {
        const { data, info } = await sharp(buf)
          .resize(400, 400, { fit: "cover" })
          .removeAlpha()
          .raw()
          .toBuffer({ resolveWithObject: true });
        return analyzeRawPixels({ data, width: info.width, height: info.height, channels: info.channels });
      };

      const frontRes = await analyzeBuf(frontBuf);
      if (!frontRes.success) {
        return NextResponse.json(
          { error: "Front photo did not detect a clear face. Please center your face." },
          { status: 400 }
        );
      }

      const leftRes = leftBuf ? await analyzeBuf(leftBuf) : undefined;
      const rightRes = rightBuf ? await analyzeBuf(rightBuf) : undefined;

      const composite = mergeMultiAngleResults(frontRes, leftRes, rightRes);

      const angles = [
        { angle: "front" as const, imageUrl: image, score: frontRes.overallScore },
        ...(images.left && leftRes?.success
          ? [{ angle: "left" as const, imageUrl: images.left, score: leftRes.overallScore }]
          : []),
        ...(images.right && rightRes?.success
          ? [{ angle: "right" as const, imageUrl: images.right, score: rightRes.overallScore }]
          : [])
      ];

      return NextResponse.json({
        success: true,
        source: "authentic_optical_cv",
        data: {
          scanMode: "multi_angle",
          angles,
          metrics: composite.metrics,
          landmarks: frontRes.landmarks,
          overallScore: composite.overallScore,
          skinAgeEstimate: frontRes.skinAgeEstimate,
          skinType: frontRes.skinType,
          primaryConcern: composite.primaryConcern
        }
      });
    }

    // C. Mode: Standard Single Selfie
    const { data, info } = await sharp(imageBuffer)
      .resize(400, 400, { fit: "cover" })
      .removeAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixelResult = analyzeRawPixels({
      data,
      width: info.width,
      height: info.height,
      channels: info.channels
    });

    if (!pixelResult.success) {
      return NextResponse.json(
        {
          error: pixelResult.error || "No clear facial skin detected in the photo.",
          details: "Please take a front-facing selfie with good lighting so your skin is clearly visible."
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      source: "authentic_optical_cv",
      data: {
        scanMode: "single",
        metrics: pixelResult.metrics,
        landmarks: pixelResult.landmarks,
        overallScore: pixelResult.overallScore,
        skinAgeEstimate: pixelResult.skinAgeEstimate,
        skinType: pixelResult.skinType,
        primaryConcern: pixelResult.primaryConcern
      }
    });
  } catch (error: any) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Failed to process skin analysis", details: error?.message },
      { status: 500 }
    );
  }
}
