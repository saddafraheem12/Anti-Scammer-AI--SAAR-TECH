# Anti-Scammer AI by SAAR TECH — Frontend UI & Google Gemini Integration

An advanced AI-powered web application interface engineered by **SAAR TECH** to protect users against SMS fraud, phishing links, and deceptive social media/WhatsApp screenshots before they click or respond.

---

## 🌟 Key Features & Requirements

1. **Clean, Modern & Mobile-First Layout**:
   - Built with responsive design principles tailored for mobile screens (touch-friendly targets) and widescreen desktops.
   - Glassmorphic navigation header, live fraud alert banner, and emergency helpline quick-access modal.

2. **3 Main Threat Analysis Tabs**:
   - 💬 **Message Scanner**: Large input textarea for pasting SMS, WhatsApp messages, and phishing emails with character counters, quick paste, and pre-loaded scam samples (Fake Bank Alert, Unclaimed Package, WhatsApp Job Scam).
   - 🔗 **Link Checker**: Dedicated URL checker with real-time domain parsing and quick-test phishing links.
   - 📸 **Screenshot Analyzer**: Drag-and-drop file upload zone supporting PNG, JPG, and WEBP with instant image preview, removal tool, and one-click sample WhatsApp scam generator.

3. **Hero Section & Team Branding**:
   - **Title**: `Anti-Scammer AI by SAAR TECH` with distinct cyan/teal gradient typography.
   - **Subtitle**: *"Protect yourself from digital scammers before you click."*
   - Security verification badges and live threat shield status.

4. **Professional Color Palette**:
   - Deep navy blues (`#060D1A`, `#0A172E`, `#132850`) and crisp whites with subtle slate backgrounds.
   - **Red Indicator**: High-risk warning box (`#EF4444` / `#DC2626`) with glowing borders, warning icons, scam probability score, and immediate recommended actions.
   - **Green Indicator**: Clean verified box (`#10B981`) demonstrating safe verdicts and trust scores.

5. **Spacious, Accessible Inputs**:
   - Generous text area and input fields with clear focus states and accessibility features.
   - One-tap example chips to test real-world scam templates with zero typing needed.

6. **Interactive "Analyze" Workflow with Real Google Gemini AI**:
   - Directly integrated with **Google Gemini REST API**:
     - Supported model: `gemini-3.8-flash`.
     - In-browser API key management modal with live test ping and local storage persistence.
     - Structured JSON output format for threat classification, scam probability, itemized indicator breakdowns, and actionable safeguards.
     - Pure real-time raw fetch integration without mock or simulated data.

---

## 🔑 How to Use the Google Gemini API Integration

1. Open the application in your browser.
2. Click the **"Settings"** icon (gear icon) in the top header.
3. Enter your **Google Gemini API Key** (get a free key at [Google AI Studio](https://aistudio.google.com/app/apikey)).
4. Optional: Click **"Test Key"** to verify connection latency and status.
5. Click **"Save & Activate"** (stored securely in browser `localStorage.gemini_api_key`).
6. Paste any suspicious message into the **Message Scanner** and click **"Analyze with Anti-Scammer AI"**.
   - If analyzed without a key, the app displays: *"Please enter your Gemini API Key in settings first."*
   - Sends the exact scam detection instruction to `gemini-1.5-flash` and returns a raw JSON object `{ status, risk_score, explanation }`.
   - Automatically switches the UI between **Red Warning** (for *Scam* / *Suspicious*) and **Green Safe** (for *Safe*).

---

## 🚀 How to Run and Preview

### Option 1: Direct Browser Launch (Zero Installation)
Simply double-click [`index.html`](index.html) or [`standalone.html`](standalone.html) (self-contained single-file) in any browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server (Node.js)
```bash
# In the project directory:
npx serve -l 3000
```
Then visit `http://localhost:3000`.

---

## 📁 File Structure

- [`index.html`](index.html) — Application layout, Hero, 3 tabs, Gemini setup modal, and dynamic Red/Green indicator result cards.
- [`styles.css`](styles.css) — Custom styles, glow effects, bounce animations, and responsive rules.
- [`app.js`](app.js) — Google Gemini API client, JSON threat schema parser, tab router, and UI state manager.
- [`standalone.html`](standalone.html) — Self-contained, single-file distribution with embedded styles and JavaScript.
- [`package.json`](package.json) — NPM script definitions for local serving.
