"""
detection_service.py
--------------------
Handles the pothole detection pipeline:
  1. Receive image bytes
  2. Run YOLO detection (mock for Phase 2, real model in Phase 3)
  3. Upload original + result image to S3
  4. Return detection results

The mock_detect() function simulates what YOLO will return
so the entire pipeline (upload → detect → save → respond) can be
tested before the AI model is integrated.
"""

import time
import random
import io
from PIL import Image, ImageDraw
from ..services.s3_service import upload_file


def mock_detect(image_bytes: bytes) -> dict:
    """
    Simulates YOLO detection.
    Returns a dict with bounding boxes and confidence scores.
    Replace the body of this function in Phase 3 with real YOLO inference.
    """
    time.sleep(0.3)  # simulate processing time

    num_potholes = random.randint(1, 3)
    detections = []

    for i in range(num_potholes):
        confidence = round(random.uniform(72.0, 98.5), 1)
        severity = (
            "Critical" if confidence >= 95 else
            "High"     if confidence >= 85 else
            "Medium"   if confidence >= 75 else
            "Low"
        )
        detections.append({
            "id": i + 1,
            "confidence": confidence,
            "severity": severity,
            "bbox": [
                random.randint(50, 200),
                random.randint(50, 150),
                random.randint(250, 400),
                random.randint(200, 350),
            ],
        })

    return {
        "potholes_found": num_potholes,
        "detections": detections,
        "processing_ms": random.randint(200, 600),
    }


def draw_bounding_boxes(image_bytes: bytes, detections: list) -> bytes:
    """
    Draws red bounding boxes and labels on the image.
    Returns the annotated image as bytes.
    In Phase 3, YOLO will do this natively — this is a placeholder.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        draw = ImageDraw.Draw(img)

        color_map = {
            "Critical": "#7c3aed",
            "High":     "#ef4444",
            "Medium":   "#f59e0b",
            "Low":      "#22c55e",
        }

        w, h = img.size

        for det in detections:
            bbox = det["bbox"]
            # Scale bbox percentages to actual pixel coords
            x1 = int((bbox[0] / 500) * w)
            y1 = int((bbox[1] / 400) * h)
            x2 = int((bbox[2] / 500) * w)
            y2 = int((bbox[3] / 400) * h)

            color = color_map.get(det["severity"], "#ef4444")
            draw.rectangle([x1, y1, x2, y2], outline=color, width=3)
            label = f"{det['severity']} {det['confidence']}%"
            draw.text((x1 + 4, y1 - 16), label, fill=color)

        buf = io.BytesIO()
        img.save(buf, format="JPEG", quality=90)
        return buf.getvalue()

    except Exception:
        # If drawing fails, return the original image unchanged
        return image_bytes


async def run_detection_pipeline(image_bytes: bytes, filename: str) -> dict:
    """
    Full pipeline:
      1. Upload original image to S3
      2. Run detection
      3. Draw bounding boxes
      4. Upload annotated image to S3
      5. Return combined result

    Args:
        image_bytes: raw image file bytes
        filename:    original filename (for extension)

    Returns:
        dict with S3 URLs, detections, and processing time
    """
    start = time.time()

    # Step 1 — Upload original to S3
    original_upload = upload_file(image_bytes, filename, folder="potholes/originals")

    # Step 2 — Run detection
    detection_result = mock_detect(image_bytes)

    # Step 3 — Draw bounding boxes on result image
    annotated_bytes = draw_bounding_boxes(image_bytes, detection_result["detections"])

    # Step 4 — Upload annotated result to S3
    result_filename = f"result_{filename}"
    result_upload = upload_file(annotated_bytes, result_filename, folder="potholes/results")

    total_ms = int((time.time() - start) * 1000)

    # Determine overall severity (highest among detections)
    severities = [d["severity"] for d in detection_result["detections"]]
    severity_rank = {"Critical": 4, "High": 3, "Medium": 2, "Low": 1}
    overall_severity = max(severities, key=lambda s: severity_rank.get(s, 0)) if severities else "Low"

    # Average confidence
    avg_confidence = round(
        sum(d["confidence"] for d in detection_result["detections"]) / len(detection_result["detections"]), 1
    ) if detection_result["detections"] else 0.0

    return {
        "potholes_found":    detection_result["potholes_found"],
        "detections":        detection_result["detections"],
        "overall_severity":  overall_severity,
        "avg_confidence":    avg_confidence,
        "processing_ms":     total_ms,
        "image_url":         original_upload.get("url"),
        "image_key":         original_upload.get("key"),
        "result_image_url":  result_upload.get("url"),
        "result_image_key":  result_upload.get("key"),
        "s3_success":        original_upload.get("success", False),
    }
