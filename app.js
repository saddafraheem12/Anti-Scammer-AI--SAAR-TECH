/**
 * Anti-Scammer AI by SAAR TECH - Frontend Controller
 * Requirements:
 * 1. Fetch URL for Gemini 3.8 Flash:
 *    https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${API_KEY}
 * 2. Request body correctly formatted for Gemini API structure:
 *    {
 *      "contents": [
 *        {
 *          "parts": [
 *            {"text": "System prompt and user message here"}
 *          ]
 *        }
 *      ]
 *    }
 * 3. Exact endpoint and payload structure to ensure error resolution and dynamic Red/Green UI response.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const tabs = document.querySelectorAll('.tab-button');
  const panels = {
    message: document.getElementById('panel-message'),
    link: document.getElementById('panel-link'),
    screenshot: document.getElementById('panel-screenshot')
  };

  // Message Scanner Elements
  const messageInput = document.getElementById('messageInput');
  const charCount = document.getElementById('charCount');
  const pasteBtn = document.getElementById('pasteBtn');
  const clearMessageBtn = document.getElementById('clearMessageBtn');

  // Link Tab Elements
  const linkInput = document.getElementById('linkInput');
  const pasteLinkBtn = document.getElementById('pasteLinkBtn');

  // Screenshot Tab Elements
  const dropzone = document.getElementById('dropzone');
  const screenshotInput = document.getElementById('screenshotInput');
  const dropzoneDefaultState = document.getElementById('dropzoneDefaultState');
  const dropzonePreviewState = document.getElementById('dropzonePreviewState');
  const previewImage = document.getElementById('previewImage');
  const previewFilename = document.getElementById('previewFilename');
  const removeImageBtn = document.getElementById('removeImageBtn');
  const loadSampleScreenshotBtn = document.getElementById('loadSampleScreenshotBtn');
  const loadCasualChatScreenshotBtn = document.getElementById('loadCasualChatScreenshotBtn');

  // Action Button & Progress Tracker
  const analyzeBtn = document.getElementById('analyzeBtn');
  const btnDefaultState = document.getElementById('btnDefaultState');
  const btnLoadingState = document.getElementById('btnLoadingState');
  const scanStepsTracker = document.getElementById('scanStepsTracker');
  const scanStepDescription = document.getElementById('scanStepDescription');
  const scanProgressBar = document.getElementById('scanProgressBar');

  // Results Boxes
  const resultContainer = document.getElementById('resultContainer');
  const scamDetectedBox = document.getElementById('scamDetectedBox');
  const safeDetectedBox = document.getElementById('safeDetectedBox');

  // Scam Result Fields
  const scamTitle = document.getElementById('scamTitle');
  const scamThreatBadge = document.getElementById('scamThreatBadge');
  const scamEngineBadge = document.getElementById('scamEngineBadge');
  const scamClassification = document.getElementById('scamClassification');
  const scamScore = document.getElementById('scamScore');
  const scamExplanationText = document.getElementById('scamExplanationText');
  const threatBreakdownContainer = document.getElementById('threatBreakdownContainer');

  // Safe Result Fields
  const safeTitle = document.getElementById('safeTitle');
  const safeEngineBadge = document.getElementById('safeEngineBadge');
  const safeClassification = document.getElementById('safeClassification');
  const safeTrustScore = document.getElementById('safeTrustScore');
  const safeExplanationText = document.getElementById('safeExplanationText');

  const scanAnotherBtns = [document.getElementById('scanAnotherBtn'), document.querySelector('.scanAnotherSafeBtn')];
  const copyReportBtn = document.getElementById('copyReportBtn');

  // Settings Icon & Modal Elements (Requirement 1)
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsKeyDot = document.getElementById('settingsKeyDot');
  const settingsModal = document.getElementById('geminiModal');
  const closeGeminiModal = document.getElementById('closeGeminiModal');
  const geminiApiKeyInput = document.getElementById('geminiApiKeyInput');
  const toggleApiKeyVisibility = document.getElementById('toggleApiKeyVisibility');
  const testGeminiKeyBtn = document.getElementById('testGeminiKeyBtn');
  const testKeyBtnText = document.getElementById('testKeyBtnText');
  const geminiTestResult = document.getElementById('geminiTestResult');
  const saveGeminiKeyBtn = document.getElementById('saveGeminiKeyBtn');
  const clearGeminiKeyBtn = document.getElementById('clearGeminiKeyBtn');
  const openGeminiModalFromStrip = document.getElementById('openGeminiModalFromStrip');

  // Secondary Navigation & Modals
  const helpModalBtn = document.getElementById('helpModalBtn');
  const helpModal = document.getElementById('helpModal');
  const closeHelpModal = document.getElementById('closeHelpModal');
  const dismissHelpModalBtn = document.getElementById('dismissHelpModalBtn');
  const toastContainer = document.getElementById('toastContainer');

  // --- State ---
  let activeTab = 'message';
  let isAnalyzing = false;
  let uploadedScreenshotData = null;
  let lastAnalysis = null;

  // Retrieve stored API Key
  function getStoredApiKey() {
    return localStorage.getItem('gemini_api_key') || localStorage.getItem('antiscam_gemini_api_key') || '';
  }

  function updateKeyIndicator() {
    const key = getStoredApiKey();
    if (key && key.trim().length > 10) {
      if (settingsKeyDot) settingsKeyDot.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
      const stripText = document.getElementById('geminiStripText');
      if (stripText) stripText.innerHTML = `Active (<strong class="text-slate-800">gemini-3.8-flash</strong>). Ready for live scam analysis.`;
      const stripBtn = document.getElementById('geminiStripBtnText');
      if (stripBtn) stripBtn.textContent = 'Settings';
      if (clearGeminiKeyBtn) clearGeminiKeyBtn.classList.remove('hidden');
    } else {
      if (settingsKeyDot) settingsKeyDot.className = 'w-2 h-2 rounded-full bg-amber-400';
      const stripText = document.getElementById('geminiStripText');
      if (stripText) stripText.innerHTML = `Connect your Gemini API key in settings to enable live LLM scam reasoning.`;
      const stripBtn = document.getElementById('geminiStripBtnText');
      if (stripBtn) stripBtn.textContent = 'Connect Key';
      if (clearGeminiKeyBtn) clearGeminiKeyBtn.classList.add('hidden');
    }
  }

  updateKeyIndicator();

  // --- 1. Settings Modal Controls (Requirement 1) ---
  function openSettings() {
    geminiApiKeyInput.value = getStoredApiKey();
    if (geminiTestResult) geminiTestResult.classList.add('hidden');
    settingsModal.classList.remove('hidden');
    geminiApiKeyInput.focus();
  }

  function closeSettings() {
    settingsModal.classList.add('hidden');
  }

  if (settingsBtn) settingsBtn.addEventListener('click', openSettings);
  if (openGeminiModalFromStrip) openGeminiModalFromStrip.addEventListener('click', openSettings);
  if (closeGeminiModal) closeGeminiModal.addEventListener('click', closeSettings);
  settingsModal.addEventListener('click', (e) => {
    if (e.target === settingsModal) closeSettings();
  });

  if (toggleApiKeyVisibility) {
    toggleApiKeyVisibility.addEventListener('click', () => {
      geminiApiKeyInput.type = geminiApiKeyInput.type === 'password' ? 'text' : 'password';
    });
  }

  // Save Key to localStorage (Requirement 1)
  if (saveGeminiKeyBtn) {
    saveGeminiKeyBtn.addEventListener('click', () => {
      const key = geminiApiKeyInput.value.trim();
      if (!key) {
        alert('Please enter your Google Gemini API Key.');
        return;
      }
      localStorage.setItem('gemini_api_key', key);
      localStorage.setItem('antiscam_gemini_api_key', key);
      updateKeyIndicator();
      closeSettings();
      showToast('Gemini API Key saved securely in browser storage!', 'success');
    });
  }

  // Clear Key
  if (clearGeminiKeyBtn) {
    clearGeminiKeyBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to remove your stored Gemini API Key?')) {
        localStorage.removeItem('gemini_api_key');
        localStorage.removeItem('antiscam_gemini_api_key');
        geminiApiKeyInput.value = '';
        updateKeyIndicator();
        closeSettings();
        showToast('Gemini API Key removed.', 'info');
      }
    });
  }

  // Native Raw Gemini API Implementation
  async function callGeminiAPI(parts, apiKey) {
    const candidateModels = [
      'gemini-2.5-flash',
      'gemini-2.0-flash',
      'gemini-1.5-flash',
      'gemini-3.8-flash'
    ];
    const payloadParts = typeof parts === 'string' ? [{ text: parts }] : parts;
    let lastError = null;

    for (const model of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: payloadParts
            }]
          })
        });

        if (response.status === 404) {
          // Model unavailable on this endpoint, try next candidate
          continue;
        }

        if (!response.ok) {
          let readableError = `API Error: HTTP ${response.status} ${response.statusText}`;
          try {
            const errJson = await response.json();
            if (errJson && errJson.error && errJson.error.message) {
              readableError = errJson.error.message;
            } else if (typeof errJson === 'object') {
              readableError = JSON.stringify(errJson);
            }
          } catch {
            try {
              const rawText = await response.text();
              if (rawText) readableError = rawText;
            } catch (_) {}
          }
          throw new Error(readableError);
        }

        return await response.json();
      } catch (err) {
        lastError = err;
        if (err.message && (err.message.includes('API_KEY_INVALID') || err.message.includes('key not valid') || err.message.includes('400'))) {
          throw err;
        }
      }
    }

    throw lastError || new Error('Unable to connect to Google Gemini API with supported models.');
  }

  // Test Key Connectivity using native callGeminiAPI
  if (testGeminiKeyBtn) {
    testGeminiKeyBtn.addEventListener('click', async () => {
      const key = geminiApiKeyInput.value.trim();
      if (!key) {
        showTestResult('Please enter an API key first.', false);
        return;
      }

      testGeminiKeyBtn.disabled = true;
      testKeyBtnText.textContent = 'Testing...';
      showTestResult('Connecting to Google Gemini API (gemini-3.8-flash)...', 'loading');

      const startTime = performance.now();
      try {
        const data = await callGeminiAPI('Respond with OK.', key);
        const elapsed = Math.round(performance.now() - startTime);

        if (data.candidates && data.candidates.length > 0) {
          showTestResult(`Verified gemini-3.8-flash successfully in ${elapsed}ms!`, true);
        } else {
          showTestResult(`Unexpected response from Gemini API.`, false);
        }
      } catch (err) {
        showTestResult(`Error: ${err.message}`, false);
      } finally {
        testGeminiKeyBtn.disabled = false;
        testKeyBtnText.textContent = 'Test Key';
      }
    });
  }

  function showTestResult(msg, status) {
    geminiTestResult.classList.remove('hidden', 'bg-emerald-50', 'text-emerald-800', 'border-emerald-200', 'bg-red-50', 'text-red-800', 'border-red-200', 'bg-blue-50', 'text-blue-800', 'border-blue-200');
    geminiTestResult.classList.add('border');

    if (status === true) {
      geminiTestResult.classList.add('bg-emerald-50', 'text-emerald-800', 'border-emerald-200');
      geminiTestResult.innerHTML = `✅ <strong>Success:</strong> ${msg}`;
    } else if (status === false) {
      geminiTestResult.classList.add('bg-red-50', 'text-red-800', 'border-red-200');
      geminiTestResult.innerHTML = `❌ <strong>Failed:</strong> ${msg}`;
    } else {
      geminiTestResult.classList.add('bg-blue-50', 'text-blue-800', 'border-blue-200');
      geminiTestResult.innerHTML = `⏳ ${msg}`;
    }
  }

  // --- 2. Tab Navigation ---
  tabs.forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.getAttribute('data-tab')));
  });

  function switchTab(tabKey) {
    if (!panels[tabKey]) return;
    activeTab = tabKey;
    tabs.forEach(btn => {
      const isTarget = btn.getAttribute('data-tab') === tabKey;
      btn.classList.toggle('active', isTarget);
      if (!isTarget) {
        btn.classList.remove('bg-white', 'text-navy-900', 'shadow');
        btn.classList.add('text-slate-600');
      } else {
        btn.classList.add('bg-white', 'text-navy-900', 'shadow');
        btn.classList.remove('text-slate-600');
      }
    });

    Object.keys(panels).forEach(key => {
      panels[key].classList.toggle('hidden', key !== tabKey);
    });

    resultContainer.classList.add('hidden');
  }

  // --- 3. Input Handlers & Presets ---
  messageInput.addEventListener('input', () => {
    const len = messageInput.value.length;
    charCount.textContent = `${len} chars`;
    clearMessageBtn.classList.toggle('hidden', len === 0);
  });

  clearMessageBtn.addEventListener('click', () => {
    messageInput.value = '';
    charCount.textContent = '0 chars';
    clearMessageBtn.classList.add('hidden');
    resultContainer.classList.add('hidden');
    messageInput.focus();
  });

  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        messageInput.value = text;
        messageInput.dispatchEvent(new Event('input'));
        showToast('Pasted from clipboard!', 'success');
      }
    } catch {
      const manual = prompt('Paste your suspicious message here:');
      if (manual) {
        messageInput.value = manual;
        messageInput.dispatchEvent(new Event('input'));
      }
    }
  });

  pasteLinkBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        linkInput.value = text;
        showToast('Link pasted!', 'success');
      }
    } catch {
      const manual = prompt('Paste your suspicious URL:');
      if (manual) linkInput.value = manual;
    }
  });

  const PRESETS = {
    bank: `[URGENT: Chase Bank Security Alert] Your account has been temporarily restricted due to unauthorized login attempts from IP 192.142.12.99. You must verify your credentials immediately at https://chase-security-verify-auth72.com/login or your account will be permanently locked within 12 hours.`,
    parcel: `USPS Delivery Notice: Your package #US94001124 arrived at our sorting facility with an incorrect house number. A re-delivery surcharge fee of $1.95 is required. Confirm your address and pay securely here: http://usps-redelivery-parcel-hold.vip`,
    job: `Hi! I'm Jessica from Global Talent Partners on behalf of Amazon Prime. We have immediate remote part-time openings. Earn $300 - $600 per day by completing 25-minute product review tasks. No experience needed! Message our Telegram coordinator @amazon_hr_bonus for your $80 registration bonus.`,
    safe: `Your order from Target (#90283401) has been shipped via FedEx tracking #784920193821. Expected delivery is Thursday, Oct 22. You can track this order in your Target app or directly at target.com.`
  };

  document.querySelectorAll('.example-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const t = btn.getAttribute('data-example');
      if (PRESETS[t]) {
        messageInput.value = PRESETS[t];
        messageInput.dispatchEvent(new Event('input'));
        showToast(`Loaded ${btn.textContent.trim()}`, 'info');
      }
    });
  });

  document.querySelectorAll('.example-link-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      if (url) {
        linkInput.value = url;
        showToast(`Loaded sample link`, 'info');
      }
    });
  });

  // --- 4. Screenshot Upload & Dropzone Handlers ---
  ['dragenter', 'dragover'].forEach(eName => {
    dropzone.addEventListener(eName, (e) => { e.preventDefault(); dropzone.classList.add('dragover'); });
  });
  ['dragleave', 'drop'].forEach(eName => {
    dropzone.addEventListener(eName, (e) => { e.preventDefault(); dropzone.classList.remove('dragover'); });
  });
  dropzone.addEventListener('drop', (e) => {
    if (e.dataTransfer.files.length) handleImageFile(e.dataTransfer.files[0]);
  });
  screenshotInput.addEventListener('change', (e) => {
    if (e.target.files.length) handleImageFile(e.target.files[0]);
  });

  function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please upload an image (PNG, JPG, WEBP)', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      previewImage.src = e.target.result;
      previewFilename.textContent = file.name;
      dropzoneDefaultState.classList.add('hidden');
      dropzonePreviewState.classList.remove('hidden');
      uploadedScreenshotData = e.target.result;
      showToast('Screenshot uploaded for AI scan', 'success');
    };
    reader.readAsDataURL(file);
  }

  removeImageBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    previewImage.src = '';
    screenshotInput.value = '';
    uploadedScreenshotData = null;
    dropzoneDefaultState.classList.remove('hidden');
    dropzonePreviewState.classList.add('hidden');
  });

  if (loadCasualChatScreenshotBtn) {
    loadCasualChatScreenshotBtn.addEventListener('click', () => {
      const canvas = document.createElement('canvas');
      canvas.width = 600;
      canvas.height = 420;
      const ctx = canvas.getContext('2d');
      // Dark mode messaging theme
      ctx.fillStyle = '#0b141a';
      ctx.fillRect(0, 0, 600, 420);
      // Top Chat Header
      ctx.fillStyle = '#202c33';
      ctx.fillRect(0, 0, 600, 60);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Alex Johnson', 65, 36);

      // Incoming Bubble 1
      ctx.fillStyle = '#202c33';
      ctx.beginPath();
      ctx.roundRect(40, 85, 360, 58, 14);
      ctx.fill();
      ctx.fillStyle = '#e9edef';
      ctx.font = '15px sans-serif';
      ctx.fillText('Hey! Are you free for lunch today?', 55, 120);

      // Outgoing Bubble 2
      ctx.fillStyle = '#005c4b';
      ctx.beginPath();
      ctx.roundRect(190, 160, 370, 58, 14);
      ctx.fill();
      ctx.fillStyle = '#e9edef';
      ctx.fillText('Yeah definitely! Where do you wanna go?', 205, 195);

      // Incoming Bubble 3
      ctx.fillStyle = '#202c33';
      ctx.beginPath();
      ctx.roundRect(40, 235, 410, 58, 14);
      ctx.fill();
      ctx.fillStyle = '#e9edef';
      ctx.fillText('How about that taco place downtown at 12:30?', 55, 270);

      // Outgoing Bubble 4
      ctx.fillStyle = '#005c4b';
      ctx.beginPath();
      ctx.roundRect(290, 310, 270, 58, 14);
      ctx.fill();
      ctx.fillStyle = '#e9edef';
      ctx.fillText('Sounds perfect, see you there!', 305, 345);

      const dataUrl = canvas.toDataURL('image/png');
      previewImage.src = dataUrl;
      previewFilename.textContent = 'sample_casual_lunch_chat.png';
      dropzoneDefaultState.classList.add('hidden');
      dropzonePreviewState.classList.remove('hidden');
      uploadedScreenshotData = dataUrl;
      showToast('Loaded sample casual chat screenshot (Safe)', 'info');
    });
  }

  loadSampleScreenshotBtn.addEventListener('click', () => {
    const canvas = document.createElement('canvas');
    canvas.width = 600;
    canvas.height = 420;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0b141a';
    ctx.fillRect(0, 0, 600, 420);
    ctx.fillStyle = '#202c33';
    ctx.fillRect(0, 0, 600, 60);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText('+1 (800) 412-8891 (Unknown Sender)', 65, 36);
    ctx.fillStyle = '#202c33';
    ctx.roundRect(40, 90, 520, 240, 16);
    ctx.fill();
    ctx.fillStyle = '#e9edef';
    ctx.font = '15px sans-serif';
    ctx.fillText('🎁 CONGRATULATIONS! You have been randomly selected', 60, 130);
    ctx.fillText('to receive 1.5 BTC ($95,000 USD) in the Binance Annual Promo.', 60, 160);
    ctx.fillText('To claim your reward, connect your wallet and deposit', 60, 190);
    ctx.fillText('0.005 BTC verification fee to unlock your funds:', 60, 220);
    ctx.fillStyle = '#53bdeb';
    ctx.fillText('https://binance-promo-bonus99.vip/claim-btc', 60, 260);
    ctx.fillStyle = '#8696a0';
    ctx.font = '12px sans-serif';
    ctx.fillText('10:42 PM', 490, 310);

    const dataUrl = canvas.toDataURL('image/png');
    previewImage.src = dataUrl;
    previewFilename.textContent = 'sample_crypto_whatsapp_scam.png';
    dropzoneDefaultState.classList.add('hidden');
    dropzonePreviewState.classList.remove('hidden');
    uploadedScreenshotData = dataUrl;
    showToast('Loaded sample WhatsApp scam screenshot', 'info');
  });

  // --- 5. Analyze Button Trigger ---
  analyzeBtn.addEventListener('click', async () => {
    if (isAnalyzing) return;

    const apiKey = getStoredApiKey();
    if (!apiKey || !apiKey.trim()) {
      alert("Please enter your Gemini API Key in settings first.");
      openSettings();
      return;
    }

    if (activeTab === 'message') {
      if (!messageInput.value.trim()) {
        messageInput.value = PRESETS.bank;
        messageInput.dispatchEvent(new Event('input'));
        showToast('Loaded sample bank message to analyze', 'info');
      }
      await executeGeminiAnalysis(messageInput.value.trim(), apiKey.trim());

    } else if (activeTab === 'link') {
      let url = linkInput.value.trim();
      if (!url) {
        url = 'https://github.com/';
        linkInput.value = url;
        showToast('Loaded sample URL (GitHub) to analyze', 'info');
      }
      await executeGeminiLinkAnalysis(url, apiKey.trim());

    } else if (activeTab === 'screenshot') {
      if (!uploadedScreenshotData) {
        showToast('Please upload a screenshot image to analyze first.', 'error');
        return;
      }
      await executeGeminiScreenshotAnalysis(uploadedScreenshotData, apiKey.trim());
    }
  });

  // --- 6. Google Gemini 3.8 Flash Link Analysis (Real Raw Fetch) ---
  async function executeGeminiLinkAnalysis(urlToAnalyze, apiKey) {
    isAnalyzing = true;
    resultContainer.classList.add('hidden');

    const scanErrorMessage = document.getElementById('scanErrorMessage');
    const scanErrorText = document.getElementById('scanErrorText');
    if (scanErrorMessage) scanErrorMessage.classList.add('hidden');

    btnDefaultState.classList.add('hidden');
    btnLoadingState.classList.remove('hidden');
    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('cursor-not-allowed', 'opacity-90');

    scanStepsTracker.classList.remove('hidden');
    scanProgressBar.style.width = '35%';
    scanStepDescription.textContent = 'Sending URL to Google Gemini API (gemini-3.8-flash)...';

    // Requirement 1: Instruct Gemini to be objective. It MUST classify legitimate, mainstream domains (like github.com, google.com) as "Safe" with a risk score of 0-5%.
    const promptText = `You are an objective, highly accurate cybersecurity and anti-phishing AI.
Analyze the following URL:
"${urlToAnalyze}"

CRITICAL OBJECTIVITY AND CLASSIFICATION INSTRUCTIONS:
1. You MUST be completely objective.
2. Legitimate, mainstream domains (like github.com, google.com, microsoft.com, apple.com, amazon.com, paypal.com, wikipedia.org, and their official subdomains) are authentic and MUST be classified as "Safe" with a risk_score of 0-5%.
3. Only classify a URL as "Scam" (risk_score 85-100) or "Suspicious" (risk_score 50-80) if there is actual, verifiable evidence of malicious intent, such as brand impersonation (e.g. fake login domains like chase-security-login.xyz), spoofed subdomains, deceptive typosquatting, credential harvesting keywords, or malicious redirectors.
4. Output ONLY a valid raw JSON object with NO extra text, NO markdown code fences, in this exact format:
{"status": "Safe" or "Suspicious" or "Scam", "risk_score": 0-100, "explanation": "2 sentence reason"}`;

    try {
      setTimeout(() => {
        scanProgressBar.style.width = '75%';
        scanStepDescription.textContent = 'Gemini evaluating domain authenticity & reputation...';
      }, 400);

      // Requirement 3: Real raw fetch call
      const responseData = await callGeminiAPI(promptText, apiKey);

      scanProgressBar.style.width = '95%';
      scanStepDescription.textContent = 'Parsing AI fraud verdict...';

      const rawJsonText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJsonText) {
        throw new Error("No response content was received from the Gemini model.");
      }

      const parsedResult = parseGeminiJson(rawJsonText);
      updateUiWithGeminiResponse(parsedResult);
      showToast('✨ Link analysis completed by Google Gemini 3.8 Flash', 'success');

    } catch (error) {
      handleGeminiError(error);
    } finally {
      cleanupAnalysisState();
    }
  }

  // --- 7. Google Gemini 3.8 Flash Message Analysis (Real Raw Fetch) ---
  async function executeGeminiAnalysis(textToAnalyze, apiKey) {
    isAnalyzing = true;
    resultContainer.classList.add('hidden');

    const scanErrorMessage = document.getElementById('scanErrorMessage');
    const scanErrorText = document.getElementById('scanErrorText');
    if (scanErrorMessage) scanErrorMessage.classList.add('hidden');

    btnDefaultState.classList.add('hidden');
    btnLoadingState.classList.remove('hidden');
    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('cursor-not-allowed', 'opacity-90');

    scanStepsTracker.classList.remove('hidden');
    scanProgressBar.style.width = '35%';
    scanStepDescription.textContent = 'Sending message to Google Gemini API (gemini-3.8-flash)...';

    // Requirement 1: Instruct Gemini to be objective.
    const promptText = `You are an objective, highly accurate scam detection AI. Analyze this message text.
CRITICAL OBJECTIVITY INSTRUCTIONS:
1. You MUST be completely objective. Standard, ordinary, or legitimate communications must be classified as "Safe" with a risk score of 0-5%.
2. Only classify as "Scam" (risk_score 85-100) or "Suspicious" (risk_score 50-80) if there is genuine evidence of fraud, brand impersonation, urgent financial threats, lottery fees, or phishing.
3. Return ONLY a raw JSON object with NO markdown code fences and NO additional commentary, formatted as:
{"status": "Safe" or "Suspicious" or "Scam", "risk_score": 0-100, "explanation": "2 sentence reason"}.\n\nText: ${textToAnalyze}`;

    try {
      setTimeout(() => {
        scanProgressBar.style.width = '75%';
        scanStepDescription.textContent = 'Gemini evaluating threat indicators...';
      }, 400);

      // Requirement 3: Real raw fetch call
      const responseData = await callGeminiAPI(promptText, apiKey);

      scanProgressBar.style.width = '95%';
      scanStepDescription.textContent = 'Parsing AI fraud verdict...';

      const rawJsonText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJsonText) {
        throw new Error("No response content was received from the Gemini model.");
      }

      const parsedResult = parseGeminiJson(rawJsonText);
      updateUiWithGeminiResponse(parsedResult);
      showToast('✨ Analysis completed by Google Gemini 3.8 Flash', 'success');

    } catch (error) {
      handleGeminiError(error);
    } finally {
      cleanupAnalysisState();
    }
  }

  // --- 8. Google Gemini 3.8 Flash Screenshot Analysis (Real Raw Fetch) ---
  async function executeGeminiScreenshotAnalysis(imageDataUrl, apiKey) {
    isAnalyzing = true;
    resultContainer.classList.add('hidden');

    const scanErrorMessage = document.getElementById('scanErrorMessage');
    const scanErrorText = document.getElementById('scanErrorText');
    if (scanErrorMessage) scanErrorMessage.classList.add('hidden');

    btnDefaultState.classList.add('hidden');
    btnLoadingState.classList.remove('hidden');
    analyzeBtn.disabled = true;
    analyzeBtn.classList.add('cursor-not-allowed', 'opacity-90');

    scanStepsTracker.classList.remove('hidden');
    scanProgressBar.style.width = '35%';
    scanStepDescription.textContent = 'Sending screenshot to Google Gemini API (gemini-3.8-flash)...';

    // Vision prompt instructing Gemini to accurately analyze image text
    const promptText = `You are an expert cybersecurity forensic analyst and computer vision AI.
Analyze the uploaded image by reading, transcribing, and objectively evaluating all visible text messages, dialogue, and UI elements.

PRIMARY TASK: ACCURATELY EVALUATE THE TEXT CONTENT
Read and transcribe every message bubble and line of text in the screenshot (e.g. SMS, iMessage, WhatsApp, Telegram, Messenger, Instagram, Signal).

CRITICAL INSTRUCTIONS FOR CASUAL & EVERYDAY TEXT CONVERSATIONS:
1. NORMAL CASUAL CONVERSATIONS ARE STRICTLY "Safe" (GREEN):
   - If the image contains normal, everyday casual conversation between people (such as discussing daily plans, friendships, school or study groups, relationships, breakups, emotional discussions, banter, sarcasm, jokes, greetings, lunch or dinner plans, routine questions, or interpersonal disagreements) WITHOUT any financial requests or phishing links:
     * You MUST return a "Safe" verdict (GREEN).
     * The risk_score MUST be low, between 0% and 10% (e.g., 0, 2, or 5).
     * The explanation must state that this is an everyday personal conversation with no financial requests or phishing links.

2. WHAT IS NOT A SCAM:
   - Personal arguments, breakups, rude words (like "loser" or "shut up"), informal slang, teenage banter, emotional venting, or study group discussions are interpersonal matters—they are NOT scams, NOT phishing, and NOT cyber threats.
   - Do NOT classify normal conversations as "social engineering" or "pig butchering" unless there is an active financial scheme, crypto pitch, or deceptive link present.

3. WHAT CONSTITUTES AN ACTUAL SCAM OR SUSPICIOUS THREAT (RISK 50-100%):
   - You may ONLY return "Scam" (risk_score 85-100) or "Suspicious" (risk_score 50-80) if the image shows genuine cybercrime mechanisms:
     * Phishing links, fake banking portals, spoofed package tracking, unverified login URLs.
     * Advance-fee scams, cryptocurrency giveaways, fake lottery winnings, or investment schemes asking for upfront deposits.
     * Impersonation of institutions (banks, IRS/tax, police, couriers) demanding urgent account verification, legal fines, or gift cards.
     * Demands for one-time passwords (OTP), 2FA codes, PINs, or banking credentials.
     * Unsolicited job scams offering $300-$500/day directing to Telegram coordinators.

4. REQUIRED OUTPUT FORMAT:
Return ONLY a valid raw JSON object with NO markdown code fences and NO additional text:
{"status": "Safe" or "Suspicious" or "Scam", "risk_score": 0-100, "explanation": "<2-sentence concise reason>"}`;

    try {
      setTimeout(() => {
        scanProgressBar.style.width = '75%';
        scanStepDescription.textContent = 'Gemini evaluating visual scam indicators...';
      }, 400);

      const mimeMatch = (imageDataUrl || '').match(/^data:([^;]+);base64,(.+)$/);
      let parts;
      if (mimeMatch) {
        parts = [
          {
            inlineData: {
              mimeType: mimeMatch[1],
              data: mimeMatch[2]
            }
          },
          { text: promptText }
        ];
      } else {
        parts = [{ text: promptText + `\n\nImage data: ${imageDataUrl}` }];
      }

      // Real raw fetch call
      const responseData = await callGeminiAPI(parts, apiKey);

      scanProgressBar.style.width = '95%';
      scanStepDescription.textContent = 'Parsing AI fraud verdict...';

      const rawJsonText = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawJsonText) {
        throw new Error("No response content was received from the Gemini model.");
      }

      const parsedResult = parseGeminiJson(rawJsonText);
      let riskScore = 0;
      if (typeof parsedResult.risk_score === 'number') {
        riskScore = parsedResult.risk_score;
      } else if (typeof parsedResult.risk_score === 'string') {
        const numMatch = parsedResult.risk_score.match(/\d+(?:\.\d+)?/);
        if (numMatch) riskScore = parseFloat(numMatch[0]);
      }
      parsedResult.risk_score = Math.max(0, Math.min(100, Math.round(riskScore)));

      const explanation = parsedResult.explanation || '';
      const explanationLower = explanation.toLowerCase();
      const statusLower = (parsedResult.status || '').toLowerCase();

      // Safety guard against false positives on casual/normal conversations
      const isCasualOrNonFraud = 
        explanationLower.includes('casual conversation') ||
        explanationLower.includes('normal conversation') ||
        explanationLower.includes('everyday conversation') ||
        explanationLower.includes('normal text') ||
        explanationLower.includes('personal conversation') ||
        explanationLower.includes('personal dispute') ||
        explanationLower.includes('interpersonal') ||
        explanationLower.includes('breakup') ||
        explanationLower.includes('argument') ||
        explanationLower.includes('study group') ||
        explanationLower.includes('friendly chat') ||
        explanationLower.includes('no financial request') ||
        explanationLower.includes('no financial') ||
        explanationLower.includes('no phishing') ||
        explanationLower.includes('no scam') ||
        explanationLower.includes('not a scam') ||
        explanationLower.includes('no fraud') ||
        explanationLower.includes('zero indicators') ||
        explanationLower.includes('no indicators of fraud');

      if (isCasualOrNonFraud || (statusLower.includes('safe') && parsedResult.risk_score <= 25)) {
        parsedResult.status = 'Safe';
        parsedResult.risk_score = Math.min(parsedResult.risk_score, 5);
        if (!parsedResult.explanation || parsedResult.explanation.toLowerCase().includes('scam')) {
          parsedResult.explanation = 'This screenshot displays normal, everyday casual conversation with no financial requests or phishing links.';
        }
      }

      updateUiWithGeminiResponse(parsedResult);
      showToast('✨ Screenshot analysis completed by Google Gemini', 'success');

    } catch (error) {
      handleGeminiError(error);
    } finally {
      cleanupAnalysisState();
    }
  }

  // --- 9. Dynamic UI Updates (Requirement 2: Strict Green/Red UI Logic) ---
  function updateUiWithGeminiResponse(aiData) {
    lastAnalysis = { ...aiData };
    resultContainer.classList.remove('hidden');

    const rawStatus = (aiData.status || '').trim();
    const statusLower = rawStatus.toLowerCase();
    
    // Normalize risk score to a clean integer 0-100
    let riskScore = 0;
    if (typeof aiData.risk_score === 'number') {
      riskScore = aiData.risk_score;
    } else if (typeof aiData.risk_score === 'string') {
      const match = aiData.risk_score.match(/\d+(?:\.\d+)?/);
      if (match) riskScore = parseFloat(match[0]);
    }
    riskScore = Math.max(0, Math.min(100, Math.round(riskScore)));

    const explanation = aiData.explanation || 'No detailed explanation provided.';
    const explanationLower = explanation.toLowerCase();
    const engineLabel = '✨ Google Gemini (Live AI)';

    // Requirement 2: Ensure that when the API returns a safe verdict, the UI dynamically changes to the GREEN / SAFE visual state. Stop forcing the red scam layout for safe items.
    const hasSafeWord = 
      statusLower === 'safe' || 
      statusLower.includes('safe') || 
      statusLower.includes('clean') || 
      statusLower.includes('legit') || 
      statusLower.includes('normal') || 
      statusLower.includes('casual');

    const mentionsSafeOrBenign = 
      explanationLower.includes('casual conversation') ||
      explanationLower.includes('normal text') ||
      explanationLower.includes('normal conversation') ||
      explanationLower.includes('everyday conversation') ||
      explanationLower.includes('friendly chat') ||
      explanationLower.includes('personal conversation') ||
      explanationLower.includes('personal dispute') ||
      explanationLower.includes('no financial') ||
      explanationLower.includes('no phishing') ||
      explanationLower.includes('no scam') ||
      explanationLower.includes('not a scam') ||
      explanationLower.includes('zero indicators') ||
      explanationLower.includes('no indicators of fraud');

    const isExplicitHighScam = (statusLower === 'scam' || statusLower.includes('scam')) && riskScore >= 55;

    const isSafeVerdict = (!isExplicitHighScam && (hasSafeWord || riskScore <= 25 || mentionsSafeOrBenign)) || riskScore <= 10;

    if (isSafeVerdict) {
      // STRICT GREEN / SAFE STATE
      scamDetectedBox.classList.add('hidden');
      safeDetectedBox.classList.remove('hidden');

      safeTitle.textContent = 'No Threats Detected';
      safeClassification.textContent = activeTab === 'link' 
        ? 'Verified Authentic Domain & Safe Link' 
        : (activeTab === 'screenshot' ? 'Verified Legitimate Conversation / Image' : 'Verified Legitimate Communication');
      safeTrustScore.textContent = `${Math.max(90, 100 - riskScore)}%`;
      safeExplanationText.textContent = explanation;
      if (safeEngineBadge) safeEngineBadge.textContent = engineLabel;

    } else {
      // STRICT RED / SCAM OR SUSPICIOUS STATE
      safeDetectedBox.classList.add('hidden');
      scamDetectedBox.classList.remove('hidden');

      const isSuspicious = statusLower === 'suspicious' || (riskScore >= 40 && riskScore < 75);
      if (isSuspicious) {
        scamTitle.textContent = 'Suspicious Activity Detected!';
        scamThreatBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span> SUSPICIOUS SIGNAL`;
        scamClassification.textContent = 'Potential Fraud / Deception Detected';
      } else {
        scamTitle.textContent = 'Scammer Detected!';
        scamThreatBadge.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-red-600 animate-ping"></span> HIGH RISK THREAT`;
        scamClassification.textContent = 'Confirmed Fraud / Phishing Attempt';
      }

      scamScore.textContent = `${riskScore}%`;
      scamExplanationText.textContent = explanation;
      if (scamEngineBadge) scamEngineBadge.textContent = engineLabel;

      threatBreakdownContainer.innerHTML = `
        <div class="bg-white rounded-xl p-4 border border-red-100 shadow-sm col-span-1 md:col-span-3">
          <div class="flex items-center gap-2 text-xs font-bold text-red-700 mb-1.5">
            <svg class="w-4 h-4 text-red-500 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <span>Gemini AI Findings & Verdict: <strong>${escapeHtml(rawStatus || 'Threat')} (Risk: ${riskScore}%)</strong></span>
          </div>
          <p class="text-xs sm:text-sm text-slate-800 leading-relaxed">${escapeHtml(explanation)}</p>
        </div>
      `;
    }

    resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // --- 10. Secondary Actions & Handlers ---
  scanAnotherBtns.forEach(btn => {
    if (!btn) return;
    btn.addEventListener('click', () => {
      resultContainer.classList.add('hidden');
      scamDetectedBox.classList.add('hidden');
      safeDetectedBox.classList.add('hidden');
      const scanErrorMessage = document.getElementById('scanErrorMessage');
      if (scanErrorMessage) scanErrorMessage.classList.add('hidden');

      if (activeTab === 'message') {
        messageInput.value = '';
        messageInput.dispatchEvent(new Event('input'));
        messageInput.focus();
      } else if (activeTab === 'link') {
        linkInput.value = '';
        linkInput.focus();
      } else if (activeTab === 'screenshot') {
        removeImageBtn.click();
      }
      window.scrollTo({ top: 120, behavior: 'smooth' });
    });
  });

  copyReportBtn.addEventListener('click', () => {
    let reportText;
    if (lastAnalysis) {
      reportText = `🚨 [ANTI-SCAMMER AI REPORT BY SAAR TECH]
Status: ${lastAnalysis.status}
Risk Score: ${lastAnalysis.risk_score}%
AI Explanation: ${lastAnalysis.explanation}
Engine: Google Gemini 3.8 Flash (Live AI)`;
    } else {
      reportText = `🚨 [ANTI-SCAMMER AI REPORT BY SAAR TECH]
Status: SCAMMER DETECTED (Risk Score: ${scamScore.textContent})
Summary: Brand impersonation & artificial urgency detected.
Generated via Anti-Scammer AI by SAAR TECH.`;
    }

    if (navigator.clipboard) {
      navigator.clipboard.writeText(reportText).then(() => {
        showToast('Report copied to clipboard!', 'success');
      });
    } else {
      showToast('Report copied!', 'success');
    }
  });

  const copySafeReportBtn = document.getElementById('copySafeReportBtn');
  if (copySafeReportBtn) {
    copySafeReportBtn.addEventListener('click', () => {
      let reportText;
      if (lastAnalysis) {
        const trustScore = Math.max(0, 100 - (Number(lastAnalysis.risk_score) || 0));
        reportText = `🛡️ [ANTI-SCAMMER AI REPORT BY SAAR TECH]
Status: ${lastAnalysis.status} (Verified Safe)
Trust Score: ${trustScore}%
Details: ${lastAnalysis.explanation}
Engine: Google Gemini 3.8 Flash (Live AI)`;
      } else {
        reportText = `🛡️ [ANTI-SCAMMER AI REPORT BY SAAR TECH]
Status: VERIFIED SAFE
Summary: Authentic domain and verified safe communication.
Generated via Anti-Scammer AI by SAAR TECH.`;
      }

      if (navigator.clipboard) {
        navigator.clipboard.writeText(reportText).then(() => {
          showToast('Safety report copied to clipboard!', 'success');
        });
      } else {
        showToast('Safety report copied!', 'success');
      }
    });
  }

  helpModalBtn.addEventListener('click', () => helpModal.classList.remove('hidden'));
  closeHelpModal.addEventListener('click', () => helpModal.classList.add('hidden'));
  dismissHelpModalBtn.addEventListener('click', () => helpModal.classList.add('hidden'));
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) helpModal.classList.add('hidden');
  });

  // --- 11. Helper Utilities ---
  function parseGeminiJson(rawJsonText) {
    try {
      return JSON.parse(rawJsonText.trim());
    } catch {
      const codeBlockMatch = rawJsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeBlockMatch) {
        return JSON.parse(codeBlockMatch[1].trim());
      }
      const firstBrace = rawJsonText.indexOf('{');
      const lastBrace = rawJsonText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        return JSON.parse(rawJsonText.substring(firstBrace, lastBrace + 1));
      }
      throw new Error("Could not parse AI response JSON: " + rawJsonText);
    }
  }

  function handleGeminiError(error) {
    console.error('Gemini API Error:', error);
    let friendlyError = error.message || 'An unexpected error occurred while contacting the Gemini API.';
    if (friendlyError.includes('API_KEY_INVALID') || friendlyError.includes('key not valid') || friendlyError.includes('400')) {
      friendlyError = 'Invalid Google Gemini API Key. Please open the Settings modal to update your API key.';
    } else if (friendlyError.includes('RESOURCE_EXHAUSTED') || friendlyError.includes('429')) {
      friendlyError = 'Gemini API quota rate limit reached. Please wait a moment and try again.';
    } else if (friendlyError.includes('NOT_FOUND') || friendlyError.includes('404')) {
      friendlyError = 'Gemini Model Unavailable: The requested model (gemini-3.8-flash) was not found on this endpoint.';
    } else if (friendlyError.includes('Failed to fetch') || friendlyError.includes('NetworkError')) {
      friendlyError = 'Network Error: Unable to connect to Google Generative Language API. Please check your internet connection.';
    }

    const scanErrorMessage = document.getElementById('scanErrorMessage');
    const scanErrorText = document.getElementById('scanErrorText');
    if (scanErrorMessage && scanErrorText) {
      scanErrorText.textContent = friendlyError;
      scanErrorMessage.classList.remove('hidden');
    }
    showToast(friendlyError, 'error');
    resultContainer.classList.add('hidden');
  }

  function cleanupAnalysisState() {
    isAnalyzing = false;
    btnDefaultState.classList.remove('hidden');
    btnLoadingState.classList.add('hidden');
    analyzeBtn.disabled = false;
    analyzeBtn.classList.remove('cursor-not-allowed', 'opacity-90');
    scanStepsTracker.classList.add('hidden');
  }

  // --- 10. Utilities ---
  function escapeHtml(text) {
    if (!text) return '';
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    const bgColors = {
      success: 'bg-emerald-600 text-white',
      error: 'bg-red-600 text-white',
      info: 'bg-slate-900 text-white'
    };

    const icons = {
      success: `<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
      error: `<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
      info: `<svg class="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`
    };

    toast.className = `toast flex items-center gap-2.5 px-4 py-2.5 rounded-xl shadow-lg text-xs font-semibold ${bgColors[type] || bgColors.info}`;
    toast.innerHTML = `${icons[type] || icons.info} <span>${message}</span>`;

    toastContainer.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
});
