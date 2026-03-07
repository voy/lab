// Chrome storage operations

// API Key management
async function saveApiKey(key) {
  return new Promise((resolve, reject) => {
    if (!chrome?.storage?.local) {
      reject(new Error("Chrome storage API not available"));
      return;
    }
    chrome.storage.local.set({ geminiApiKey: key }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        API_KEY = key;
        resolve();
      }
    });
  });
}

async function loadApiKey() {
  return new Promise((resolve, reject) => {
    if (!chrome?.storage?.local) {
      console.error("Chrome storage API not available");
      resolve(""); // Resolve with empty string instead of rejecting
      return;
    }
    chrome.storage.local.get(['geminiApiKey'], (result) => {
      if (chrome.runtime.lastError) {
        console.error("Error loading API key:", chrome.runtime.lastError);
        resolve("");
      } else {
        API_KEY = result.geminiApiKey || "";
        resolve(API_KEY);
      }
    });
  });
}

// Preset and recent searches management
async function loadPresets() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['presets'], (result) => {
      presets = result.presets || [];
      resolve(presets);
    });
  });
}

async function savePresets() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ presets }, resolve);
  });
}

async function loadRecentSearches() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['recentSearches'], (result) => {
      recentSearches = result.recentSearches || [];
      resolve(recentSearches);
    });
  });
}

async function saveRecentSearches() {
  return new Promise((resolve) => {
    chrome.storage.local.set({ recentSearches }, resolve);
  });
}

async function addRecentSearch(query) {
  // Remove if already exists
  recentSearches = recentSearches.filter(s => s !== query);
  // Add to beginning
  recentSearches.unshift(query);
  // Keep only last 5
  recentSearches = recentSearches.slice(0, 5);
  await saveRecentSearches();
}

async function addPreset(query) {
  if (!presets.includes(query)) {
    presets.push(query);
    await savePresets();
  }
}

async function removePreset(query) {
  presets = presets.filter(p => p !== query);
  await savePresets();
}
