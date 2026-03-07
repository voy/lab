// Tab operations

async function getAllTabs() {
  return new Promise((resolve) => {
    chrome.tabs.query({}, (tabs) => {
      // Sort by lastAccessed (oldest first) to show neglected tabs at the top
      const sortedTabs = tabs.sort((a, b) => a.lastAccessed - b.lastAccessed);

      resolve(sortedTabs.map(tab => ({
        url: tab.url,
        title: tab.title,
        id: tab.id,
        favIconUrl: tab.favIconUrl,
        lastAccessed: tab.lastAccessed
      })));
    });
  });
}

function closeTab(tabId) {
  chrome.tabs.remove(tabId, async () => {
    // Refresh the tab list
    allTabs = await getAllTabs();

    // Re-display results
    if (currentMatchedUrls.length > 0) {
      displayResults(currentMatchedUrls, true);
    } else {
      displayResults([], false);
    }
  });
}

async function filterTabs(userQuery, tabs) {
  if (!API_KEY) {
    throw new Error("API key not configured");
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`;

  const debugInstructions = DEBUG_MODE
    ? `- Return a JSON array of objects with "url" and "reason" fields
- The "reason" should be a brief (5-10 words) explanation of why this tab matched
- Example format: [{"url": "https://example.com", "reason": "News site matching user query"}, {"url": "https://another.com", "reason": "Contains news content"}]`
    : `- Return ONLY a valid JSON array of the matching URLs (just the URL strings)
- Example format: ["https://example.com", "https://another.com"]`;

  const prompt = `You are a browser extension that helps users close tabs using natural language.
The user will tell you which tabs they want to close, and you must identify those tabs from the list provided.

IMPORTANT INSTRUCTIONS:
${debugInstructions}
- Follow the user's instructions to the best of your ability
- If the user says "first", return only the FIRST matching tab in the list
- If the user says "last", return only the LAST matching tab in the list
- If the user says "all", return ALL matching tabs
- COMMA-SEPARATED QUERIES: Treat commas as OR operators
  - Example: "gmail, calendar" = return all tabs that match Gmail OR Google Calendar
  - Example: "news, twitter, reddit" = return all tabs that are news sites OR Twitter OR Reddit
- QUANTITY-BASED EXCEPTIONS: Support keeping a specific number of tabs
  - Example: "all google services, except 1 maps tab" = return all Google tabs EXCEPT one Google Maps tab (keep the first matching Maps tab)
  - Example: "all gmail tabs except 2" = return all Gmail tabs except 2 (keep the first 2 Gmail tabs)
  - Example: "twitter tabs but keep 3" = return all Twitter tabs except 3 (keep the first 3 Twitter tabs)
  - When a quantity is specified with "except" or "but keep", EXCLUDE the first N matching tabs from the exception category
- INVERSE MODE: If the user says "except", "keep", "everything but", "all but", or similar phrases (without quantities), return ALL tabs EXCEPT the ones mentioned
  - Example: "close everything except Gmail" = return all tabs that are NOT Gmail
  - Example: "keep only YouTube" = return all tabs that are NOT YouTube
  - Example: "all but Twitter" = return all tabs that are NOT Twitter
- Do not include markdown formatting, code blocks, or any other text

User's request: "${userQuery}"

Available tabs (in order):
${JSON.stringify(tabs, null, 2)}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  const data = await response.json();
  let responseText = data.candidates[0].content.parts[0].text;

  // Clean up response - remove markdown code blocks if present
  responseText = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  console.log("Filtered response:", responseText);

  const parsed = JSON.parse(responseText);

  if (DEBUG_MODE && parsed.length > 0 && typeof parsed[0] === 'object') {
    // Extract URLs and reasons
    const urls = parsed.map(item => item.url);
    const reasons = {};
    parsed.forEach(item => {
      reasons[item.url] = item.reason;
    });
    currentMatchReasons = reasons;
    return urls;
  } else {
    currentMatchReasons = {};
    return parsed;
  }
}
