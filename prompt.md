You are an expert full-stack developer and UX/UI designer.  
Your task is to create a complete, production-ready landing page for a car inspection service.  
The website concept is based on this summary:

---

BUSINESS CONCEPT:
•⁠  ⁠A simple landing page for a "Book a Car Inspection" service in Indonesia.
•⁠  ⁠Target: people buying used cars from OLX, Facebook Marketplace, Mobil123, or dealers.
•⁠  ⁠Goal: Get visitors to submit their car link or details, then book an inspection.
•⁠  Support feature: Upload photos for AI condition scoring (0–100) before booking.
•⁠  ⁠Monetization: Flat fee Rp 500-700k per inspection, upsell OBD scan or rush service.

---

CORE FEATURES:
1.⁠ ⁠Hero Section:
   - Headline: find the best wording in bahasa indonesia that can hook for users
   - Subheadline: find the best wording in bahasa indonesia that can hook for users for target market in indonesia
   - CTA: find the best wording call to action using bahasa indonesia
2.⁠ ⁠How It Works:
   - Step 1: Paste car link or upload photos
   - Step 2: System will crawl the link
   - Step 3: System will download the image and analyze to get inspection scoring using chat gpt api
   - Step 4: Show the report and show button, book a real person inspection
   - Step 5: User will make payment via midtrans, use midtrans api to create the payment link
   - Step 5: We send an inspector
   - Step 6: Get a report with photos and recommendations

3.⁠ ⁠Pricing Section:
   - Standard: Rp 500k
   - Express (same day): Rp 750k
   - OBD Scan: +Rp 100k

4.⁠ ⁠Example Report:
   - Show screenshots of a real report
   - Customer testimonial

5.⁠ ⁠Service Area:
   - Map or list of cities (e.g., Jakarta, Bekasi, Tangerang)

6.⁠ ⁠Contact / Booking Form:
   - Name, WhatsApp, Car link/details, Preferred time
   - Payment integration (Midtrans/Xendit)
   - WhatsApp click-to-chat

---

SUPPORT FEATURE AI:
•⁠  ⁠User pastes car listing link → system scrapes title, price, year, mileage, location, description, and photos.
•⁠  ⁠AI analyzes photos and gives a condition score (0–100) + short notes.
•⁠  ⁠Display score, then offer inspection booking.

SEO FEATURE:
•⁠  Everytime user send link, scrape data and make it seo article
•⁠  Use chatgpt API to make seo article from exported information before
•⁠  Post it on blog
---

DESIGN REQUIREMENTS:
•⁠  ⁠Mobile-first, fast-loading
•⁠  ⁠Trust-focused: clean, minimal, with icons for checklist items
•⁠  ⁠Colors: blue, white, light gray
•⁠  ⁠Clear CTA buttons in multiple sections

---

TECH STACK SUGGESTION:
•⁠  ⁠Frontend: Next.js + TailwindCSS
•⁠  ⁠Backend: Node.js/Express or Next.js API routes
•⁠  ⁠AI Scoring: Integrate Roboflow or OpenAI Vision API
•⁠  ⁠Hosting: Vercel or Netlify
•⁠  ⁠Image storage: AWS S3 or Supabase
•⁠  ⁠Payments: Midtrans

---

OUTPUT FORMAT:
•⁠  ⁠Provide complete code for the landing page (frontend + minimal backend for booking form)
•⁠  ⁠Include comments for each section
•⁠  ⁠Make the AI scoring module a placeholder function for now
•⁠  ⁠Ensure SEO best practices (meta tags, schema.org/Car)