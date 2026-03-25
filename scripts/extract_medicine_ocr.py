#!/usr/bin/env python3
"""
EasyOCR Text Extraction with Structured Data Output

This script uses EasyOCR to extract text from images and returns:
- Raw extracted text
- Structured medicine information (name, dosage, expiry date)
- Confidence scores for each text region
- Bounding boxes and coordinates
- Organized JSON output
"""

import json
import sys
import os
from pathlib import Path
from typing import Dict, List, Any, Tuple
import re
from datetime import datetime

try:
    import easyocr
    from PIL import Image
    import cv2
    import numpy as np
except ImportError as e:
    print(f"[v0] Error: Required package not installed. Run: uv add easyocr pillow opencv-python numpy", file=sys.stderr)
    sys.exit(1)


class OCRExtractor:
    """Extract structured data from images using EasyOCR."""
    
    def __init__(self, languages: List[str] = None, gpu: bool = False):
        """
        Initialize OCR reader.
        
        Args:
            languages: List of language codes (default: ['en'])
            gpu: Use GPU if available (default: False)
        """
        if languages is None:
            languages = ['en']
        
        print(f"[v0] Initializing EasyOCR reader with languages: {languages}", file=sys.stderr)
        self.reader = easyocr.Reader(languages, gpu=gpu)
        self.languages = languages
    
    def extract_text_from_image(self, image_path: str, detail: bool = True) -> Dict[str, Any]:
        """
        Extract text from an image file.
        
        Args:
            image_path: Path to image file
            detail: Return detailed results with coordinates and confidence
            
        Returns:
            Dictionary with extraction results
        """
        print(f"[v0] Loading image from: {image_path}", file=sys.stderr)
        
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Image not found: {image_path}")
        
        # Read image and get metadata
        img = Image.open(image_path)
        width, height = img.size
        
        print(f"[v0] Image size: {width}x{height}", file=sys.stderr)
        print(f"[v0] Running OCR extraction...", file=sys.stderr)
        
        # Perform OCR
        results = self.reader.readtext(image_path, detail=detail)
        
        print(f"[v0] OCR completed. Found {len(results)} text regions.", file=sys.stderr)
        
        return {
            "image_path": str(image_path),
            "image_size": {"width": width, "height": height},
            "regions": self._format_results(results),
            "raw_text": self._extract_raw_text(results),
            "confidence_stats": self._calculate_stats(results),
        }
    
    def _format_results(self, results: List[Tuple]) -> List[Dict[str, Any]]:
        """Format OCR results into structured data."""
        formatted = []
        
        for detection in results:
            # Each detection: ((x1, y1), (x2, y2), ...) -> text -> confidence
            bbox = detection[0]  # List of coordinate tuples
            text = detection[1]
            confidence = detection[2]
            
            # Convert bbox to rectangle bounds
            xs = [point[0] for point in bbox]
            ys = [point[1] for point in bbox]
            
            formatted.append({
                "text": text,
                "confidence": round(float(confidence), 4),
                "bounding_box": {
                    "top_left": [float(min(xs)), float(min(ys))],
                    "bottom_right": [float(max(xs)), float(max(ys))],
                    "width": float(max(xs) - min(xs)),
                    "height": float(max(ys) - min(ys)),
                },
                "coordinates": [[float(x), float(y)] for x, y in bbox],
            })
        
        # Sort by vertical position (top to bottom)
        formatted.sort(key=lambda x: x["bounding_box"]["top_left"][1])
        return formatted
    
    def _extract_raw_text(self, results: List[Tuple]) -> str:
        """Extract concatenated text from results."""
        texts = [detection[1] for detection in results]
        return "\n".join(texts)
    
    def _calculate_stats(self, results: List[Tuple]) -> Dict[str, Any]:
        """Calculate confidence statistics."""
        if not results:
            return {"total_regions": 0, "average_confidence": 0, "min_confidence": 0, "max_confidence": 0}
        
        confidences = [float(detection[2]) for detection in results]
        
        return {
            "total_regions": len(results),
            "average_confidence": round(sum(confidences) / len(confidences), 4),
            "min_confidence": round(min(confidences), 4),
            "max_confidence": round(max(confidences), 4),
        }
    
    def extract_medicine_info(self, image_path: str) -> Dict[str, Any]:
        """
        Extract and parse medicine-specific information.
        
        Args:
            image_path: Path to medicine packaging image
            
        Returns:
            Structured medicine data
        """
        extraction = self.extract_text_from_image(image_path)
        raw_text = extraction["raw_text"].upper()
        
        print(f"[v0] Parsing medicine information from extracted text", file=sys.stderr)
        
        # Parse common medicine patterns
        medicine_data = {
            "extraction_metadata": extraction,
            "medicine_info": {
                "name": self._extract_medicine_name(extraction["regions"]),
                "active_ingredients": self._extract_ingredients(raw_text),
                "expiry_date": self._extract_expiry_date(raw_text),
                "dosage": self._extract_dosage(raw_text),
                "batch_number": self._extract_batch_number(raw_text),
                "manufacturer": self._extract_manufacturer(raw_text),
            },
            "confidence": extraction["confidence_stats"]["average_confidence"],
        }
        
        return medicine_data
    
    def _extract_medicine_name(self, regions: List[Dict]) -> str:
        """Extract likely medicine name (usually first text)."""
        if not regions:
            return ""
        
        # Medicine names usually appear first and have good confidence
        high_confidence = [r for r in regions if r["confidence"] > 0.5]
        if high_confidence:
            return high_confidence[0]["text"].strip()
        return regions[0]["text"].strip() if regions else ""
    
    def _extract_ingredients(self, text: str) -> List[str]:
        """Extract active ingredients."""
        patterns = [
            r"active\s+ingredient[s]?:?\s*([^\n]*)",
            r"ingredients?:?\s*([^\n]*)",
        ]
        
        ingredients = []
        for pattern in patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                ingredient_text = match.group(1).strip()
                if ingredient_text:
                    # Split by common delimiters
                    items = re.split(r',|;|\band\b|\bor\b', ingredient_text)
                    ingredients.extend([item.strip() for item in items if item.strip()])
        
        return list(set(ingredients))[:5]  # Top 5 unique ingredients
    
    def _extract_expiry_date(self, text: str) -> Dict[str, Any]:
        """Extract expiry date."""
        patterns = [
            r"exp\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"expiry\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"best\s+before\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
            r"use\s+by\s*:?\s*(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                date_str = match.group(1)
                return {
                    "raw": date_str,
                    "formatted": date_str,
                    "status": "VALID" if self._is_future_date(date_str) else "EXPIRED",
                }
        
        return {"raw": None, "formatted": None, "status": "UNKNOWN"}
    
    def _is_future_date(self, date_str: str) -> bool:
        """Check if date is in the future."""
        try:
            # Try common date formats
            for fmt in ["%m/%d/%Y", "%m-%d-%Y", "%d/%m/%Y", "%d-%m-%Y", "%m/%y", "%m-%y"]:
                try:
                    parsed_date = datetime.strptime(date_str, fmt)
                    # Assume year 20xx if 2 digit year
                    if parsed_date.year < 100:
                        parsed_date = parsed_date.replace(year=parsed_date.year + 2000)
                    return parsed_date > datetime.now()
                except ValueError:
                    continue
        except Exception:
            pass
        return False
    
    def _extract_dosage(self, text: str) -> str:
        """Extract dosage information."""
        pattern = r"(\d+\s*(?:mg|g|ml|iu|mcg|units?|tablets?|capsules?|drops?))"
        match = re.search(pattern, text, re.IGNORECASE)
        return match.group(1) if match else ""
    
    def _extract_batch_number(self, text: str) -> str:
        """Extract batch/lot number."""
        patterns = [
            r"batch\s*[#:]?\s*(\w+)",
            r"lot\s*[#:]?\s*(\w+)",
            r"batch\s+no\.?\s*(\w+)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1)
        return ""
    
    def _extract_manufacturer(self, text: str) -> str:
        """Extract manufacturer information."""
        patterns = [
            r"made\s+by\s*:?\s*([^\n]+)",
            r"manufacturer\s*:?\s*([^\n]+)",
            r"mfg\.?\s+by\s*:?\s*([^\n]+)",
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                return match.group(1).strip()
        return ""


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python extract_medicine_ocr.py <image_path> [--medicine] [--gpu]", file=sys.stderr)
        print("\nExamples:", file=sys.stderr)
        print("  python extract_medicine_ocr.py medicine.jpg", file=sys.stderr)
        print("  python extract_medicine_ocr.py medicine.jpg --medicine", file=sys.stderr)
        print("  python extract_medicine_ocr.py medicine.jpg --medicine --gpu", file=sys.stderr)
        sys.exit(1)
    
    image_path = sys.argv[1]
    medicine_mode = "--medicine" in sys.argv
    gpu_mode = "--gpu" in sys.argv
    
    print(f"[v0] Starting OCR extraction: {image_path}", file=sys.stderr)
    print(f"[v0] Medicine mode: {medicine_mode}, GPU: {gpu_mode}", file=sys.stderr)
    
    try:
        extractor = OCRExtractor(gpu=gpu_mode)
        
        if medicine_mode:
            result = extractor.extract_medicine_info(image_path)
        else:
            result = extractor.extract_text_from_image(image_path)
        
        # Output as JSON
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(f"[v0] Error: {str(e)}", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
