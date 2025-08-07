# 🤖 ChatGPT Vision AI Analysis Setup

## Overview

BerburuMobil now uses **ChatGPT Vision API (GPT-4o)** to analyze car images from OLX, Facebook Marketplace, and Mobil123. The AI provides detailed condition assessments, scores, and recommendations based on visual inspection of the car photos.

## Features

### ✅ **Real AI Image Analysis**
- **GPT-4o Vision API** analyzes up to 5 car images per listing
- **Professional Inspector Prompts** - AI acts as an experienced Indonesian car inspector
- **Detailed Analysis** covering exterior, interior, and technical aspects
- **Risk Assessment** with LOW/MEDIUM/HIGH risk levels
- **Confidence Scoring** for analysis reliability

### ✅ **Comprehensive Analysis Includes:**
- **Exterior Condition**: Paint, scratches, rust, dents, tire condition
- **Interior Assessment**: Seats, dashboard, steering wheel wear
- **Technical Evaluation**: Signs of accidents or mechanical issues
- **Overall Condition Score**: 1-100 rating system
- **Specific Recommendations**: Tailored advice for each vehicle

### ✅ **Smart Fallback System**
- Graceful handling when OpenAI API isn't available
- Intelligent image filtering (removes logos, placeholders)
- Multiple parsing methods for robust operation

## Setup Instructions

### 1. **Get OpenAI API Key**
```bash
# Visit: https://platform.openai.com/api-keys
# Create a new API key with GPT-4 Vision access
# Copy your key (starts with sk-...)
```

### 2. **Configure Environment Variables**
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and add your OpenAI API key:
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

### 3. **Test the Integration**
```bash
# Start your development server
npm run dev

# Test with the OLX link:
# Visit: http://localhost:3000
# Enter: https://www.olx.co.id/item/dp-murah-honda-jazz-15-rs-bensin-at-2016-cworb-iid-937386980
# Click "Analisis AI Gratis"
```

## How It Works

### 🔍 **Analysis Process**

1. **Image Extraction**: Scraper finds up to 10 images from car listing
2. **Image Filtering**: AI system filters out logos, placeholders, icons
3. **Quality Selection**: Selects best 5 images for analysis (cost control)
4. **AI Analysis**: GPT-4o Vision analyzes images with expert prompts
5. **Structured Output**: Returns JSON with scores, findings, recommendations
6. **UI Display**: Shows detailed analysis in user-friendly format

### 📊 **Analysis Output**

The AI provides structured analysis in this format:

```json
{
  "score": 82,
  "confidence": 90,
  "riskLevel": "LOW",
  "findings": [
    "Cat mobil dalam kondisi baik, tidak terlihat goresan besar",
    "Interior terlihat terawat, jok masih dalam kondisi bagus",
    "Ban dan velg tampak normal sesuai usia kendaraan",
    "Tidak terlihat tanda-tanda kecelakaan pada foto"
  ],
  "recommendation": "Mobil Honda Jazz 2016 ini terlihat dalam kondisi baik dari foto. Disarankan inspeksi teknisi untuk memastikan kondisi mesin.",
  "detailedAnalysis": {
    "exterior": [
      "Cat bodi dalam kondisi baik, tidak terlihat baret atau karat",
      "Bemper dan lampu terlihat original dan tidak rusak"
    ],
    "interior": [
      "Dashboard dan panel instrumen terlihat bersih",
      "Jok kulit masih dalam kondisi terawat"
    ],
    "engine": [
      "Kondisi ruang mesin perlu diperiksa secara langsung",
      "Tidak terlihat tanda kebocoran dari foto yang tersedia"
    ],
    "overall": "Kendaraan menunjukkan tanda perawatan yang baik, kondisi visual sesuai dengan tahun pembuatan 2016"
  }
}
```

### 🎨 **Enhanced UI Display**

The new UI shows:
- **Color-coded scoring**: Green (85+), Yellow (70-84), Red (<70)
- **Risk level badges**: Visual indicators for LOW/MEDIUM/HIGH risk
- **Confidence percentage**: Shows AI confidence in analysis
- **Detailed breakdown**: Separate sections for exterior, interior, engine
- **Professional recommendations**: Tailored advice for each vehicle

## API Usage & Costs

### **OpenAI Vision API Costs**
- **Model**: GPT-4o (most accurate vision model)
- **Input**: ~$5.00 per 1K tokens + $1.25 per image
- **Per Analysis**: ~$0.10-0.25 per car (5 images)
- **Monthly Estimate**: $25-50 for 200 analyses

### **Cost Control Features**
- **Image Limit**: Maximum 5 images per analysis
- **Smart Filtering**: Removes non-relevant images
- **Fallback System**: Continues operation even without API
- **Error Prevention**: Robust error handling

## Troubleshooting

### **Common Issues**

#### 1. "OpenAI API key not provided"
```bash
# Check your .env.local file has:
OPENAI_API_KEY=sk-your-key-here

# Restart your development server
npm run dev
```

#### 2. "No valid images found"
- Some car listings may have placeholder images only
- AI falls back to basic analysis in this case
- This is normal behavior for some listings

#### 3. "API Rate Limit"
- OpenAI has rate limits for API usage
- The system includes automatic retry logic
- Consider upgrading your OpenAI plan for higher limits

#### 4. "JSON Parse Error"
- AI sometimes returns non-JSON responses
- System includes fallback text parsing
- Analysis continues with simplified format

## Testing Examples

### **Test URLs**
```
# Honda Jazz 2016 - Good condition
https://www.olx.co.id/item/dp-murah-honda-jazz-15-rs-bensin-at-2016-cworb-iid-937386980

# Test different car types and conditions
https://www.olx.co.id/item/[other-car-listings]
```

### **Expected Results**
- **Score Range**: 65-95 (realistic assessment)
- **Analysis Time**: 10-30 seconds
- **Image Count**: 3-5 images analyzed
- **Language**: Indonesian (localized for Indonesia market)

## Benefits for Users

### 🎯 **For Car Buyers**
- **Instant Assessment**: Get professional analysis in seconds
- **Risk Evaluation**: Understand potential issues before viewing
- **Negotiation Power**: Data-driven insights for price discussions
- **Time Saving**: Focus on promising vehicles only

### 🎯 **For BerburuMobil Business**
- **Competitive Advantage**: Only car inspection service with AI pre-analysis
- **Lead Quality**: Better qualified customers for paid inspections
- **User Engagement**: Interactive AI analysis increases conversion
- **Data Collection**: Insights into car market conditions

## Next Steps

1. **Set up OpenAI API key** in your environment
2. **Test with real car listings** to see AI in action  
3. **Monitor API usage** and costs in OpenAI dashboard
4. **Customize prompts** for specific analysis needs
5. **Scale up** as usage grows

The AI analysis is now fully functional and ready to provide professional car condition assessments to your users! 🚗✨