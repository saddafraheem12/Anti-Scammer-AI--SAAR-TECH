🛡️ Anti-Scammer AI — SAAR TECH

AI-Assisted Digital Scam Awareness | NYLP AI Hackathon 2026

Anti-Scammer AI is a mobile-friendly web prototype developed by Team SAAR TECH to help users recognize potential warning signs in suspicious messages, URLs, and screenshots. The project aims to make digital scam awareness more accessible through a simple, user-friendly interface.

«Important: This project is an early-stage prototype. Its assessments may be inaccurate and must not be treated as a guarantee of safety.»

🌟 Project Overview

Online scams can use fake prizes, urgent messages, phishing links, fraudulent job offers, and impersonation to persuade people to share sensitive information or money. Many users need straightforward ways to assess suspicious content before responding.

Anti-Scammer AI explores how an AI-assisted interface can help users identify possible scam indicators and make more informed decisions online.

🎯 Problem Statement

People receive suspicious SMS messages, WhatsApp messages, emails, social media content, and links. Recognizing fraudulent content can be difficult, particularly when messages create urgency or appear to come from trusted organizations.

Users need accessible digital safety tools that help them evaluate warning signs without requiring advanced cybersecurity knowledge.

💡 Proposed Solution

Anti-Scammer AI brings three scam-awareness tools together in one web interface:

- Message Scanner: An interface for submitting suspicious messages for assessment.
- Link Checker: A tool interface for entering and assessing potentially suspicious URLs.
- Screenshot Analyzer: An interface for uploading and previewing screenshots that may contain scam-related content.

The project is designed to explore AI-assisted analysis and communicate possible risks in a simple format. Results are advisory and should be independently verified.

✨ Features

💬 Message Scanner

- Text input for suspicious SMS, WhatsApp messages, and emails.
- Example scam messages for testing the interface.
- An analysis workflow designed to present potential warning signs.

🔗 Link Checker

- URL input and domain-related information display.
- Example links for interface testing.
- A workflow intended to help users assess suspicious URLs.

Limitation: A displayed result should not be interpreted as proof that a website is safe or malicious unless supported by a verified analysis method.

📸 Screenshot Analyzer

- Image upload interface supporting PNG, JPG, and WEBP.
- Image preview and removal controls.
- Example screenshot functionality, where implemented.

Limitation: Image upload and preview alone do not establish that OCR, QR-code scanning, or AI-based image analysis is working.

📱 Responsive User Interface

- Mobile-first layout.
- Dark navy, cyan, and teal visual theme.
- Risk-indicator interface and suggested safety actions, where implemented.

🧰 Technology Stack

- HTML — application structure
- CSS — responsive styling and visual design
- JavaScript — interface interactions and application logic
- Google Gemini API — intended AI-assisted analysis integration; live operation depends on a valid API key, supported model, and successful API response
- GitHub — source-code hosting and version control
- Netlify — web deployment

🤖 AI Methodology and Implementation

The intended AI-assisted workflow is:

1. The user enters suspicious content into an available analysis interface.
2. The application prepares the content and sends a request to the configured AI service, if the integration is enabled and working.
3. The response is processed by the application.
4. The interface presents an assessment and potential warning signs.
5. The user is encouraged to verify important information independently.

AI-generated responses can be incorrect, incomplete, or misleading. The prototype should not be used as the sole basis for financial, cybersecurity, or other high-impact decisions.

AI Model and API Configuration

The project is designed to integrate with the Google Gemini REST API.

- Provider: Google Gemini
- Configured model: Confirm the exact model identifier in the application source code before listing it here.
- API access: Requires a valid API key and a model available to the configured API account.
- Response handling: The application is intended to process analysis responses and display results in the interface.

Verification status: Do not describe the AI integration as fully operational until a real API request has succeeded and the returned result has been tested.

Security note: This prototype uses browser-side API-key configuration. Browser local storage is not a secure vault, and client-side API keys can be exposed. Do not use sensitive production credentials in a public frontend. A production version should route requests through a protected backend and apply suitable access controls.

🚀 How to Run Locally

Option 1: Open in a Browser

1. Download or clone the repository.
2. Open the project folder.
3. Open "index.html" in a compatible browser if the project files support direct browser execution.

Option 2: Use a Local HTTP Server

Install Node.js, open a terminal in the project directory, and run:

npx serve -l 3000

Then visit:

http://localhost:3000

If the command or project structure differs from the actual repository, follow the instructions provided by the existing "package.json".

📁 Project Structure

The following describes the expected roles of the main files; confirm that each file exists in the repository.

- "index.html" — main application interface
- "styles.css" — layout, responsive styles, and visual design
- "app.js" — application interactions and analysis logic
- "standalone.html" — optional self-contained version
- "package.json" — project scripts and dependencies, if included
- "images.jpg" — project screenshot, if present
- "images 2 green.jpg" — additional project screenshot, if present

📸 Product Screenshots

Project screenshots:

- "Screenshot 1 — Main Interface" (images.jpg)
- "Screenshot 2 — Green Result Interface" (images%202%20green.jpg)

If the image filenames or paths change, update these links to match the repository.

👥 Team Members and Contributions

Team Name: SAAR TECH

- Aaliya Raheem — Deep Research and Problem Analysis: Researched the problem and helped identify project requirements.
- Anum Raheem — Demo Video and Presentation: Created the demonstration video and contributed to presenting the project.
- Saddaf Raheem — Frontend Development, Coding, Testing, Debugging, and Deployment: Worked on frontend implementation, feature testing, debugging, and deployment.

🌐 Project Links

- Live application: https://anti-scammer-ai-saar-teach.netlify.app/
- Source repository: https://github.com/saddafraheem12/Anti-Scammer-AI--SAAR-TECH

🧪 Testing and Limitations

The project is an early-stage functional prototype. Individual features and AI integration must be tested with real inputs before being described as fully operational.

Known considerations include:

- AI-generated assessments may be incorrect.
- A URL's appearance alone cannot establish its safety.
- Uploaded image previews do not necessarily mean image content has been analyzed.
- AI model availability and API behavior depend on the actual configuration.
- Browser-side credential storage has security limitations.
- Further testing, validation, privacy safeguards, and reliability improvements are needed.

🔭 Future Improvements

- Verify and strengthen the AI integration.
- Improve URL and domain-risk assessment.
- Add validated screenshot text extraction and image analysis where appropriate.
- Expand testing across mobile devices and browsers.
- Improve privacy, credential handling, and error reporting.
- Provide clearer explanations of risk indicators and recommended safety steps.

🏁 Hackathon Submission

Anti-Scammer AI is submitted by Team SAAR TECH for the NYLP AI Hackathon 2026. The project explores an accessible, AI-assisted approach to digital scam awareness.

Our goal is to help users pause, recognize potential warning signs, and verify suspicious content before taking action.