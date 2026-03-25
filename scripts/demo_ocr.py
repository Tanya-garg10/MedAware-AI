#!/usr/bin/env python3
"""
Demo: EasyOCR Medicine Extraction

This script demonstrates the OCR extraction capabilities
without needing an actual image file.
"""

import json
from typing import Dict, List, Any

# Simulated OCR results for demonstration
DEMO_EXTRACTION = {
    "image_path": "medicine_package.jpg",
    "image_size": {"width": 1920, "height": 1440},
    "regions": [
        {
            "text": "ASPIRIN",
            "confidence": 0.9847,
            "bounding_box": {
                "top_left": [150, 50],
                "bottom_right": [450, 120],
                "width": 300,
                "height": 70
            },
            "coordinates": [[150, 50], [450, 50], [450, 120], [150, 120]]
        },
        {
            "text": "500 mg",
            "confidence": 0.9623,
            "bounding_box": {
                "top_left": [160, 140],
                "bottom_right": [350, 180],
                "width": 190,
                "height": 40
            },
            "coordinates": [[160, 140], [350, 140], [350, 180], [160, 180]]
        },
        {
            "text": "Active Ingredient: Acetylsalicylic Acid",
            "confidence": 0.9512,
            "bounding_box": {
                "top_left": [100, 250],
                "bottom_right": [600, 290],
                "width": 500,
                "height": 40
            },
            "coordinates": [[100, 250], [600, 250], [600, 290], [100, 290]]
        },
        {
            "text": "Exp: 12/2025",
            "confidence": 0.9734,
            "bounding_box": {
                "top_left": [1500, 1300],
                "bottom_right": [1800, 1350],
                "width": 300,
                "height": 50
            },
            "coordinates": [[1500, 1300], [1800, 1300], [1800, 1350], [1500, 1350]]
        },
        {
            "text": "Batch No: 2024ABC123",
            "confidence": 0.9401,
            "bounding_box": {
                "top_left": [1500, 1370],
                "bottom_right": [1850, 1420],
                "width": 350,
                "height": 50
            },
            "coordinates": [[1500, 1370], [1850, 1370], [1850, 1420], [1500, 1420]]
        },
        {
            "text": "Manufactured by: AcmePharma Inc.",
            "confidence": 0.9245,
            "bounding_box": {
                "top_left": [100, 500],
                "bottom_right": [500, 550],
                "width": 400,
                "height": 50
            },
            "coordinates": [[100, 500], [500, 500], [500, 550], [100, 550]]
        }
    ],
    "raw_text": "ASPIRIN\n500 mg\nActive Ingredient: Acetylsalicylic Acid\nExp: 12/2025\nBatch No: 2024ABC123\nManufactured by: AcmePharma Inc.",
    "confidence_stats": {
        "total_regions": 6,
        "average_confidence": 0.9527,
        "min_confidence": 0.9245,
        "max_confidence": 0.9847
    }
}

DEMO_MEDICINE_INFO = {
    "extraction_metadata": DEMO_EXTRACTION,
    "medicine_info": {
        "name": "ASPIRIN",
        "active_ingredients": ["ACETYLSALICYLIC ACID"],
        "expiry_date": {
            "raw": "12/2025",
            "formatted": "12/2025",
            "status": "VALID"
        },
        "dosage": "500 mg",
        "batch_number": "2024ABC123",
        "manufacturer": "AcmePharma Inc."
    },
    "confidence": 0.9527
}


def print_section(title: str) -> None:
    """Print a formatted section header."""
    print(f"\n{'='*70}")
    print(f"  {title}")
    print(f"{'='*70}\n")


def demo_basic_extraction() -> None:
    """Demonstrate basic text extraction."""
    print_section("1. BASIC TEXT EXTRACTION")
    
    print("Raw Extracted Text:")
    print("-" * 70)
    print(DEMO_EXTRACTION["raw_text"])
    
    print("\n\nConfidence Statistics:")
    print("-" * 70)
    stats = DEMO_EXTRACTION["confidence_stats"]
    print(f"  Total text regions found: {stats['total_regions']}")
    print(f"  Average confidence: {stats['average_confidence']:.2%}")
    print(f"  Confidence range: {stats['min_confidence']:.2%} - {stats['max_confidence']:.2%}")


def demo_detailed_regions() -> None:
    """Demonstrate detailed region extraction."""
    print_section("2. DETAILED TEXT REGIONS WITH COORDINATES")
    
    for i, region in enumerate(DEMO_EXTRACTION["regions"], 1):
        print(f"Region {i}:")
        print(f"  Text: '{region['text']}'")
        print(f"  Confidence: {region['confidence']:.2%}")
        bbox = region["bounding_box"]
        print(f"  Position: ({bbox['top_left'][0]}, {bbox['top_left'][1]}) to ({bbox['bottom_right'][0]}, {bbox['bottom_right'][1]})")
        print(f"  Size: {bbox['width']}x{bbox['height']} pixels")
        print()


def demo_medicine_parsing() -> None:
    """Demonstrate medicine information parsing."""
    print_section("3. STRUCTURED MEDICINE INFORMATION")
    
    info = DEMO_MEDICINE_INFO["medicine_info"]
    
    print(f"Medicine Name: {info['name']}")
    print(f"Dosage: {info['dosage']}")
    print(f"Active Ingredients: {', '.join(info['active_ingredients'])}")
    print(f"Expiry Date: {info['expiry_date']['formatted']} ({info['expiry_date']['status']})")
    print(f"Batch Number: {info['batch_number']}")
    print(f"Manufacturer: {info['manufacturer']}")
    print(f"\nOverall Confidence: {DEMO_MEDICINE_INFO['confidence']:.2%}")


def demo_json_output() -> None:
    """Demonstrate JSON output format."""
    print_section("4. JSON OUTPUT (Machine-Readable)")
    
    # Show medicine info as JSON
    output = {
        "status": "success",
        "timestamp": "2024-03-25T10:30:45Z",
        "results": DEMO_MEDICINE_INFO
    }
    
    print(json.dumps(output, indent=2))


def demo_use_cases() -> None:
    """Show practical use cases."""
    print_section("5. PRACTICAL USE CASES")
    
    use_cases = [
        {
            "title": "Medicine Verification",
            "description": "Verify if extracted medicine matches user's prescription"
        },
        {
            "title": "Expiry Checking",
            "description": "Alert user if medicine is expired or near expiry"
        },
        {
            "title": "Interaction Warnings",
            "description": "Cross-reference active ingredients against known interactions"
        },
        {
            "title": "Dosage Verification",
            "description": "Confirm correct dosage matches patient's prescription"
        },
        {
            "title": "Batch Tracking",
            "description": "Track medicine batches for recall notifications"
        },
        {
            "title": "Counterfeit Detection",
            "description": "Verify batch number and manufacturer against database"
        }
    ]
    
    for i, case in enumerate(use_cases, 1):
        print(f"{i}. {case['title']}")
        print(f"   {case['description']}\n")


def demo_accuracy_factors() -> None:
    """Explain accuracy factors."""
    print_section("6. FACTORS AFFECTING OCR ACCURACY")
    
    factors = {
        "Image Quality": [
            "High resolution (300+ DPI recommended)",
            "Proper lighting and contrast",
            "Focus and sharpness"
        ],
        "Text Characteristics": [
            "Clear, printed text (not handwritten)",
            "Standard fonts (medical packaging typically uses standard fonts)",
            "Sufficient spacing between characters"
        ],
        "Language & Content": [
            "Text in supported languages",
            "Consistent text patterns",
            "No extreme rotations or tilts"
        ],
        "Processing Settings": [
            "Correct language selection",
            "GPU acceleration for faster processing",
            "Pre-processing filters for difficult images"
        ]
    }
    
    for category, items in factors.items():
        print(f"\n{category}:")
        for item in items:
            print(f"  ✓ {item}")


def main():
    """Run all demonstrations."""
    print("\n" + "="*70)
    print("  EASYOCR MEDICINE EXTRACTION - COMPREHENSIVE DEMO")
    print("="*70)
    
    demo_basic_extraction()
    demo_detailed_regions()
    demo_medicine_parsing()
    demo_json_output()
    demo_use_cases()
    demo_accuracy_factors()
    
    print_section("SUMMARY")
    print("""
The EasyOCR extraction system provides:

1. Raw text extraction from images with confidence scores
2. Detailed bounding box coordinates for each text region
3. Medicine-specific parsing (name, dosage, ingredients, expiry, batch)
4. Structured JSON output for integration with other systems
5. Confidence metrics for accuracy assessment
6. Support for multiple languages and text orientations

Usage in Python:
    from extract_medicine_ocr import OCRExtractor
    
    extractor = OCRExtractor(languages=['en'])
    result = extractor.extract_text_from_image('medicine.jpg')
    medicine_data = extractor.extract_medicine_info('medicine.jpg')

Command-line usage:
    python extract_medicine_ocr.py medicine.jpg
    python extract_medicine_ocr.py medicine.jpg --medicine
    python extract_medicine_ocr.py medicine.jpg --medicine --gpu
    """)


if __name__ == "__main__":
    main()
