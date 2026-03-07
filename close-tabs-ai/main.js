// Initialization and event handlers

async function initializeApp() {
  // Get all open tabs
  allTabs = await getAllTabs();

  // Display all tabs on initial load
  displayResults([], false);

  // Auto-focus input field
  document.getElementById("userQuery").focus();
}

window.addEventListener("load", async () => {
  // Check if chrome.storage is available
  if (!chrome?.storage?.local) {
    console.error("Chrome storage API not available. Please reload the extension.");
    document.body.innerHTML = `
      <div style="padding: 16px;">
        <h2>Error</h2>
        <p>Chrome storage API is not available. Please:</p>
        <ol>
          <li>Go to <code>chrome://extensions</code></li>
          <li>Find "Close Tabs AI"</li>
          <li>Click the reload button</li>
        </ol>
      </div>
    `;
    return;
  }

  // Load API key
  await loadApiKey();

  // Load presets and recent searches
  await loadPresets();
  await loadRecentSearches();

  // Show appropriate screen
  if (!API_KEY) {
    showSettingsScreen();
  } else {
    showMainScreen();
    await initializeApp();
  }

  // Settings button handler
  document.getElementById("settingsBtn").addEventListener("click", () => {
    showSettingsScreen();
    document.getElementById("apiKeyInput").value = API_KEY;
  });

  // Back button handler
  document.getElementById("backBtn").addEventListener("click", () => {
    showMainScreen();
  });

  // Save API key button handler
  document.getElementById("saveApiKey").addEventListener("click", async () => {
    const key = document.getElementById("apiKeyInput").value.trim();
    if (!key) {
      alert("Please enter an API key");
      return;
    }
    await saveApiKey(key);
    showMainScreen();
    await initializeApp();
  });

  // Allow Enter key to save API key
  document.getElementById("apiKeyInput").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      document.getElementById("saveApiKey").click();
    }
  });

  const handleSubmit = async () => {
    const userQuery = document.getElementById("userQuery").value;

    if (!userQuery.trim()) {
      clearSearch();
      return;
    }

    const spinner = document.getElementById("spinner");
    const resultsDiv = document.getElementById("results");
    const submitButton = document.getElementById("submit");
    const tabCountDiv = document.getElementById("tabCount");
    const actionsDiv = document.getElementById("actions");

    // Show spinner, disable button, hide tab count and actions
    spinner.classList.add("active");
    submitButton.disabled = true;
    resultsDiv.innerHTML = "";
    tabCountDiv.style.display = "none";
    actionsDiv.style.display = "none";
    // Skip filter button in tab order when results are showing
    submitButton.tabIndex = -1;

    try {
      const matchedUrls = await filterTabs(userQuery, allTabs);
      currentMatchedUrls = matchedUrls;
      displayResults(matchedUrls, true);
      tabCountDiv.style.display = "block";
      // Add to recent searches
      await addRecentSearch(userQuery);
    } catch (error) {
      resultsDiv.innerHTML = `<div style="color: red; padding: 10px;">Error: ${error.message}</div>`;
      currentMatchedUrls = [];
      currentMatchReasons = {};
      tabCountDiv.style.display = "block";
      // Restore filter button in tab order
      submitButton.tabIndex = 0;
    } finally {
      // Hide spinner, enable button
      spinner.classList.remove("active");
      submitButton.disabled = false;
    }
  };

  document.getElementById("submit").addEventListener("click", handleSubmit);

  const inputField = document.getElementById("userQuery");

  inputField.addEventListener("keydown", async (event) => {
    const dropdown = document.getElementById("presetsDropdown");
    const dropdownActive = dropdown.classList.contains("active");
    const resultsDiv = document.getElementById("results");
    const isFiltered = currentMatchedUrls.length > 0;

    // Navigate dropdown if active
    if (dropdownActive) {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        event.stopPropagation();
        navigateDropdown("down");
        return;
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        event.stopPropagation();
        navigateDropdown("up");
        return;
      }
      if (event.key === "Enter") {
        event.preventDefault();
        event.stopPropagation();
        selectCurrentDropdownItem();
        return;
      }
      if (event.key === "Escape") {
        event.preventDefault();
        event.stopPropagation();
        hidePresetsDropdown();
        return;
      }
      if (event.key === "Delete" || event.key === "Backspace") {
        event.preventDefault();
        event.stopPropagation();
        const selected = document.querySelector(".preset-item.selected");
        if (selected && selected.dataset.type === "preset") {
          const query = selected.querySelector(".preset-text").textContent;
          removePreset(query);
          showPresetsDropdown();
        }
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "s") {
        event.preventDefault();
        event.stopPropagation();
        const selected = document.querySelector(".preset-item.selected");
        if (selected && selected.dataset.type === "recent") {
          const query = selected.querySelector(".preset-text").textContent;
          await addPreset(query);
          showPresetsDropdown();
        }
        return;
      }
    }

    // Arrow down from input: blur input and focus first result
    if (!dropdownActive && isFiltered && event.key === "ArrowDown") {
      event.preventDefault();
      event.stopPropagation(); // Prevent document handler from also running
      const tabItems = Array.from(resultsDiv.querySelectorAll(".tab-item"));
      if (tabItems.length > 0) {
        inputField.blur();
        tabItems.forEach(item => item.classList.remove("focused"));
        tabItems[0].classList.add("focused");
        tabItems[0].scrollIntoView({ block: "nearest", behavior: "smooth" });
      }
      return;
    }

    // Show dropdown on arrow down when input is empty and not in filtered mode
    if (event.key === "ArrowDown" && !inputField.value.trim() && !dropdownActive && !isFiltered) {
      event.preventDefault();
      event.stopPropagation();
      showPresetsDropdown();
      return;
    }

    // Save as preset with Ctrl/Cmd+S
    if ((event.ctrlKey || event.metaKey) && event.key === "s") {
      event.preventDefault();
      const query = inputField.value.trim();
      if (query) {
        addPreset(query);
        alert("Saved as preset!");
      }
      return;
    }

    // Normal escape behavior
    if (event.key === "Escape") {
      event.preventDefault();
      if (inputField.value.trim() || currentMatchedUrls.length > 0) {
        // If input has content or showing results, clear it
        clearSearch();
      } else {
        // If input is empty and no results, close the popup
        window.close();
      }
    }

    // Hide dropdown when typing
    if (dropdownActive && event.key.length === 1) {
      hidePresetsDropdown();
    }
  });

  inputField.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      handleSubmit();
    }
  });

  // Global escape handler for closing popup when not in input
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && document.activeElement !== inputField) {
      window.close();
    }
  });

  // Close All button handler
  document.getElementById("closeAllBtn").addEventListener("click", closeSelectedTabs);

  // Close All button keyboard navigation
  document.getElementById("closeAllBtn").addEventListener("keydown", (event) => {
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      event.preventDefault();
      const resultsDiv = document.getElementById("results");
      const scrollAmount = 50; // pixels to scroll
      if (event.key === "ArrowUp") {
        resultsDiv.scrollBy({ top: -scrollAmount, behavior: "smooth" });
      } else {
        resultsDiv.scrollBy({ top: scrollAmount, behavior: "smooth" });
      }
    }
  });

  // Auto-focus Close button when Tab is pressed from input with results
  document.getElementById("userQuery").addEventListener("keydown", (event) => {
    if (event.key === "Tab" && currentMatchedUrls.length > 0) {
      event.preventDefault();
      document.getElementById("closeAllBtn").focus();
    }
  });

  // Listen for checkbox changes
  document.getElementById("results").addEventListener("change", (event) => {
    if (event.target.type === "checkbox") {
      updateCloseAllButton();
    }
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (event) => {
    const dropdown = document.getElementById("presetsDropdown");
    const inputWrapper = document.querySelector(".input-wrapper");
    if (dropdown.classList.contains("active") && !inputWrapper.contains(event.target)) {
      hidePresetsDropdown();
    }
  });

  // Global keyboard handler for result navigation (when input doesn't have focus)
  document.addEventListener("keydown", (event) => {
    const inputField = document.getElementById("userQuery");
    const inputHasFocus = document.activeElement === inputField;
    const resultsDiv = document.getElementById("results");
    const isFiltered = currentMatchedUrls.length > 0;

    // Only handle when input doesn't have focus and we're showing filtered results
    if (!inputHasFocus && isFiltered) {
      const tabItems = Array.from(resultsDiv.querySelectorAll(".tab-item"));
      if (tabItems.length === 0) return;

      const focused = resultsDiv.querySelector(".tab-item.focused");
      const focusedIndex = focused ? tabItems.indexOf(focused) : -1;

      if (event.key === "ArrowDown" && focusedIndex >= 0 && focusedIndex < tabItems.length - 1) {
        event.preventDefault();
        focused.classList.remove("focused");
        tabItems[focusedIndex + 1].classList.add("focused");
        tabItems[focusedIndex + 1].scrollIntoView({ block: "nearest", behavior: "smooth" });
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (focusedIndex === 0) {
          // From first item, refocus input and remove visual focus
          focused.classList.remove("focused");
          inputField.focus();
        } else if (focusedIndex > 0) {
          focused.classList.remove("focused");
          tabItems[focusedIndex - 1].classList.add("focused");
          tabItems[focusedIndex - 1].scrollIntoView({ block: "nearest", behavior: "smooth" });
        }
        return;
      }

      if (focused && event.key === " ") {
        event.preventDefault();
        const checkbox = focused.querySelector('input[type="checkbox"]');
        if (checkbox) {
          checkbox.checked = !checkbox.checked;
          updateCloseAllButton();
        }
        return;
      }

      if (focused && (event.key === "Delete" || event.key === "Backspace")) {
        event.preventDefault();
        const closeBtn = focused.querySelector(".close-btn");
        if (closeBtn) {
          closeBtn.click();
        }
        return;
      }
    }
  });
});
