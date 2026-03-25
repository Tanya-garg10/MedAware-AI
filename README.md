# MedAware AI - Medicine Scanner with AI Safety Analysis

An intelligent medicine scanning application that uses OCR, computer vision, and **AI-powered reasoning** to analyze medicine packaging and provide comprehensive safety warnings and simplified explanations for non-medical users.

## Features

### Core Scanning Functionality
- **Camera & Upload**: Capture photos directly from device camera or upload images
- **OCR Processing**: Tesseract.js for accurate text extraction from medicine packaging
- **Medicine Database**: Comprehensive database with 10+ common medicines
- **Intelligent Analysis**: Extracts medicine names and expiry dates from OCR text
- **Expiry Status Check**: Validates medicine expiry dates (valid/near-expiry/expired)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### AI-Powered Safety Layer (NEW)
- **AI Safety Analysis**: Claude AI generates context-aware safety warnings for each medicine
- **Simplified Explanations**: Complex medical terminology automatically converted to simple language for lay users
- **Drug Interaction Warnings**: AI-generated common drug interactions and substance conflicts
- **Population-Specific Warnings**: Special alerts for pregnant women, elderly, children, and people with specific health conditions
- **Confidence Scoring**: Each analysis includes a confidence score for transparency
- **Multi-Tab Dashboard**: Beautiful tab-based results with Uses, Side Effects, Interactions, and Population warnings

## Features

- **Camera & Upload**: Capture photos directly from device camera or upload images
- **OCR Processing**: Tesseract.js for accurate text extraction from medicine packaging
- **Medicine Database**: Comprehensive database with 10+ common medicines
- **Intelligent Analysis**: Extracts medicine names and expiry dates from OCR text
- **Simplified Information**: Converts complex medical terminology into simple language
- **Expiry Status Check**: Validates medicine expiry dates (valid/near-expiry/expired)
- **Beautiful Dashboard**: Tab-based results display with uses, side effects, and warnings
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices
- **Dark Mode Support**: Built-in dark theme compatibility

## Tech Stack

- **Frontend**: React.js 19 with Next.js 16 (App Router)
- **UI Components**: shadcn/ui + Radix UI + Tailwind CSS v4
- **OCR**: Tesseract.js (browser-based)
- **AI Engine**: Vercel AI SDK 6 with Claude 3.5 Sonnet
- **Backend**: Next.js API Routes
- **Database**: In-memory medicine database (easily expandable to real DB)
- **Language**: TypeScript
- **Validation**: Zod schemas

## Project Structure

```
medaware-ai/
├── app/
│   ├── page.tsx                         # Main scanner page
│   ├── layout.tsx                       # Root layout
│   ├── globals.css                      # Global styles
│   └── api/
│       ├── analyze/route.ts             # Medicine analysis endpoint
│       ├── ocr/route.ts                 # OCR processing endpoint
│       └── safety-analysis/route.ts     # AI safety warnings endpoint (NEW)
├── components/
│   ├── image-uploader.tsx               # Image upload & drag-drop
│   ├── camera-capture.tsx               # Camera capture interface
│   ├── medicine-results.tsx             # Basic results display
│   ├── medicine-results-enhanced.tsx    # Enhanced results with AI (NEW)
│   └── ui/                              # shadcn/ui components
├── lib/
│   ├── medicine-database.ts             # Medicine data & search
│   ├── ocr-utils.ts                     # OCR and text processing
│   ├── medicine-analyzer.ts             # Analysis engine
│   ├── ai-safety-analyzer.ts            # AI safety analysis utilities (NEW)
│   └── utils.ts                         # Utility functions
└── public/
    └── medicine-app-architecture.jpg    # Architecture diagram
```

## Installation

1. **Clone/Download the Project**
   ```bash
   # Extract the project files
   cd medaware-ai
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   pnpm install
   # or
   yarn install
   ```

3. **Set Environment (Optional)**
   - For production use, add AI Gateway API key:
   ```bash
   # .env.local
   # Not needed for basic OpenAI via AI Gateway
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   # or
   pnpm dev
   ```

5. **Open in Browser**
   ```
   http://localhost:3000
   ```

### First Time Setup

- No environment variables required for basic functionality
- Tesseract.js models download automatically on first OCR call
- Medicine database is pre-loaded
- Claude AI is accessed via Vercel AI Gateway (no manual setup needed)

## How to Use

1. **Capture or Upload Medicine Image**
   - Click "Upload Image" to select from files
   - Click "Take Photo" to use device camera
   - Drag and drop images directly onto the upload area

2. **Wait for OCR Processing**
   - The app extracts text from the medicine packaging
   - Shows confidence level of text extraction

3. **AI Safety Analysis Generates** (NEW)
   - Claude AI automatically generates:
     - Simple explanation of how the medicine works
     - Critical safety warnings (top 3-4)
     - Common drug interactions
     - Warnings for specific populations (elderly, pregnant, children, etc.)
   - Loading indicator shows when analysis is generating

4. **View Comprehensive Results**
   - Medicine name and confidence badge
   - Expiry status (valid/near-expiry/expired)
   - Four tabs: Uses, Side Effects, Interactions, Populations
   - AI-generated safety analysis sections
   - Important disclaimers and warnings

5. **Scan Another Medicine**
   - Click "Scan Another Medicine" to start over

## Medicine Database

The app includes 10 common medicines:
- Aspirin
- Paracetamol (Acetaminophen)
- Ibuprofen
- Amoxicillin
- Omeprazole
- Metformin
- Lisinopril
- Sertraline
- Atorvastatin
- Levothyroxine

### Expanding the Database

Edit `/lib/medicine-database.ts` to add more medicines:

```typescript
export const medicineDatabase: Record<string, Medicine> = {
  'new-medicine': {
    id: 'new-medicine',
    name: 'New Medicine Name',
    aliases: ['alias1', 'alias2'],
    uses: ['Use 1', 'Use 2'],
    sideEffects: ['Effect 1', 'Effect 2'],
    dosage: 'Dosage info',
    warnings: ['Warning 1', 'Warning 2']
  },
  // ... more medicines
};
```

## API Endpoints

### POST /api/analyze
Analyzes extracted medicine text and returns detailed information.

**Request:**
```
FormData:
- file: File
- extractedText: string
- confidence: number
```

**Response:**
```json
{
  "success": true,
  "result": {
    "medicineName": "Aspirin",
    "medicineData": { ... },
    "expiryStatus": { "status": "valid", "message": "..." },
    "simplifiedInfo": { "uses": [...], "sideEffects": [...], "warnings": [...] },
    "confidence": 0.95,
    "timestamp": "2026-03-25T..."
  }
}
```

### POST /api/ocr
Validates image files for OCR processing.

### POST /api/safety-analysis (NEW - AI Safety Analysis)
Generates AI-powered safety warnings and simplified explanations.

**Request:**
```json
{
  "medicineName": "Aspirin",
  "uses": ["Pain relief", "Fever reduction"],
  "sideEffects": ["Stomach upset", "Heartburn"],
  "warnings": ["Do not take with blood thinners"],
  "expiryStatus": "valid"
}
```

**Response:**
```json
{
  "safetyWarnings": ["Never take if allergic to aspirin", "May increase bleeding risk", "Can cause stomach ulcers"],
  "interactionRisks": ["Increases bleeding risk with anticoagulants", "May reduce effectiveness of ACE inhibitors"],
  "populationWarnings": ["Pregnant women: Avoid unless advised by doctor", "Elderly: Higher risk of GI bleeding", "Children: Use lower doses"],
  "simplifiedExplanation": "Aspirin works by blocking pain signals and reducing inflammation in your body. It also makes blood thinner, which helps prevent blood clots...",
  "confidenceScore": 0.92,
  "disclaimers": ["Educational purposes only", "Always consult healthcare professionals", "Not a substitute for medical advice", "Seek immediate medical attention for severe reactions"]
}
```

## Key Functions

### AI Safety Analysis (`lib/ai-safety-analyzer.ts`) - NEW
- `prepareMedicineForAIAnalysis()` - Formats medicine data for Claude
- `generateSafetyContext()` - Creates system prompts for AI
- `generateInteractionPrompt()` - Generates drug interaction analysis prompts
- `generatePopulationWarningsPrompt()` - Creates population-specific warning prompts
- `generateSimplifiedExplanationPrompt()` - Creates explanation prompts

### OCR Utilities (`lib/ocr-utils.ts`)
- `extractTextFromImage()` - Tesseract.js OCR extraction
- `extractMedicineInfo()` - Parse medicine name and expiry date
- `cleanExtractedText()` - Normalize text
- `validateImage()` - File validation

### Medicine Database (`lib/medicine-database.ts`)
- `searchMedicine()` - Find medicine by name/alias
- `simplifyMedicalText()` - Convert medical terms to simple language
- `checkExpiryStatus()` - Validate expiry dates

### Analysis Engine (`lib/medicine-analyzer.ts`)
- `analyzeMedicineText()` - Main analysis function
- `generateMedicineSummary()` - Create text summary

## Deployment

### Deploy to Vercel (Recommended)

1. Push code to GitHub
2. Connect repository to Vercel
3. Click "Deploy"
4. No configuration needed - it just works!

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Deploy to Other Platforms

The app works with any platform supporting Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify
- Self-hosted with Node.js

## Configuration

### Tailwind CSS v4
Customization in `/app/globals.css`:
```css
@theme inline {
  --color-primary: #3b82f6;
  --color-primary-dark: #1e40af;
  /* ... */
}
```

### Next.js Config
Modify `/next.config.mjs` for:
- Image optimization
- API routes
- Middleware
- Custom webpack config

## Performance Tips

1. **Image Optimization**
   - Keep uploaded images under 5MB
   - Use compressed formats (JPEG/WebP)
   - Good lighting for better OCR

2. **OCR Processing**
   - First OCR call downloads Tesseract models (~80MB)
   - Subsequent calls are faster
   - Models cached in browser storage

3. **Database**
   - Currently in-memory
   - For production: migrate to Supabase, Firebase, or PostgreSQL

## Troubleshooting

### Camera Not Working
- Check browser permissions
- Ensure HTTPS in production
- Test with different browser

### OCR Not Recognizing Text
- Ensure image is clear and well-lit
- Text should be at least 12pt font
- Avoid extreme angles or blur
- Try different image angles

### Medicine Not Found
- Check spelling in database
- Verify medicine name on packaging
- Add new medicines to database

### Tesseract.js Issues
- First load downloads models (may take time)
- Check browser storage/cache
- Works offline after initial download

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers with camera support

## Limitations & Future Improvements

### Current Capabilities
- Database includes 10 common medicines (easily expandable)
- OCR works best with clear, well-lit images
- English text only currently
- AI analysis generated in real-time (no caching)
- Single-image analysis per scan

### Planned Future Improvements
- Backend database integration (Supabase/Firebase)
- Expanded medicine database (1000+ medicines)
- Multiple language support
- Barcode/QR code scanning
- Real-time drug interaction database
- User history and favorites
- Doctor consultation integration
- Prescription verification
- Medical alert profile system
- Export results as PDF
- Offline mode support

## Security & Privacy

- No data is stored on servers
- Camera images processed locally
- OCR text not logged
- No personal health data collection
- GDPR compliant

## Medical Disclaimer

This application provides educational information only and should NOT be used as a substitute for professional medical advice, diagnosis, or treatment. Always:

- Consult healthcare professionals
- Read medication labels carefully
- Follow dosage instructions
- Report side effects to your doctor
- Don't self-diagnose or self-treat

The app developers are not responsible for any adverse effects or damages resulting from the use of this application.

## Contributing

Improvements welcome! Areas for contribution:

- Add more medicines to database
- Improve OCR accuracy
- Enhance UI/UX
- Add new languages
- Performance optimizations
- Bug fixes

## License

MIT License - Feel free to use, modify, and distribute.

## Support

For issues or questions:
1. Check troubleshooting section
2. Review code comments
3. Check browser console for errors
4. Test with different images/medicines

## Credits

Built with:
- Tesseract.js for OCR
- Next.js and React
- shadcn/ui and Tailwind CSS
- Vercel for hosting

---

**Version**: 1.0.0  
**Last Updated**: March 2026  
**Status**: Production Ready
