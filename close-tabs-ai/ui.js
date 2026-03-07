// UI rendering functions

function updateCloseAllButton() {
  const checkboxes = document.querySelectorAll('#results input[type="checkbox"]');
  const closeAllBtn = document.getElementById("closeAllBtn");
  const selectedCount = Array.from(checkboxes).filter(cb => cb.checked).length;

  closeAllBtn.textContent = `Close ${selectedCount} Selected Tab${selectedCount !== 1 ? 's' : ''}`;
  closeAllBtn.disabled = selectedCount === 0;
}

function closeSelectedTabs() {
  const checkboxes = document.querySelectorAll('#results input[type="checkbox"]:checked');
  const tabIds = Array.from(checkboxes).map(cb => parseInt(cb.dataset.tabId));

  if (tabIds.length === 0) return;

  // Confirm if closing more than 5 tabs
  if (tabIds.length > 5) {
    if (!confirm(`Are you sure you want to close ${tabIds.length} tabs?`)) {
      return;
    }
  }

  chrome.tabs.remove(tabIds, async () => {
    // Refresh the tab list
    allTabs = await getAllTabs();

    // Clear search and show all tabs
    clearSearch();
  });
}

function clearSearch() {
  document.getElementById("userQuery").value = "";
  currentMatchedUrls = [];
  currentMatchReasons = {};
  displayResults([], false);
  // Restore filter button in tab order
  document.getElementById("submit").tabIndex = 0;
}

function displayResults(matchedUrls, showOnlyMatched = false) {
  const resultsDiv = document.getElementById("results");
  const tabCountDiv = document.getElementById("tabCount");
  const actionsDiv = document.getElementById("actions");
  resultsDiv.innerHTML = "";

  const tabsToShow = showOnlyMatched
    ? allTabs.filter(tab => matchedUrls.includes(tab.url))
    : allTabs;

  const matchedCount = matchedUrls.length;

  if (showOnlyMatched && matchedCount > 0) {
    tabCountDiv.textContent = `${matchedCount} tab${matchedCount !== 1 ? 's' : ''} matched`;
    actionsDiv.style.display = 'flex';
  } else if (showOnlyMatched) {
    tabCountDiv.textContent = 'No tabs matched';
    actionsDiv.style.display = 'none';
  } else {
    tabCountDiv.textContent = `Showing all ${allTabs.length} tabs`;
    actionsDiv.style.display = 'none';
  }

  tabsToShow.forEach((tab, index) => {
    const tabItem = document.createElement("div");
    tabItem.className = 'tab-item';

    // Only show checkbox when in filtered mode
    let checkbox = null;
    if (showOnlyMatched) {
      checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = true;
      checkbox.dataset.tabId = tab.id;
    }

    const tabContent = document.createElement("div");
    tabContent.className = "tab-content";

    const favicon = document.createElement("img");
    favicon.className = "tab-favicon";
    favicon.src = tab.favIconUrl || 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23ddd"/></svg>';
    favicon.onerror = () => {
      favicon.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16"><rect width="16" height="16" fill="%23ddd"/></svg>';
    };

    const tabInfo = document.createElement("div");
    tabInfo.className = "tab-info";

    let infoHTML = `
      <div class="tab-title">${tab.title}</div>
      <div class="tab-url">${tab.url}</div>
    `;

    // Add debug reason if available
    if (DEBUG_MODE && showOnlyMatched && currentMatchReasons[tab.url]) {
      infoHTML += `<div class="tab-reason">→ ${currentMatchReasons[tab.url]}</div>`;
    }

    tabInfo.innerHTML = infoHTML;

    tabContent.appendChild(favicon);
    tabContent.appendChild(tabInfo);

    const closeBtn = document.createElement("button");
    closeBtn.className = "close-btn";
    closeBtn.textContent = "×";
    closeBtn.title = "Close this tab";
    closeBtn.onclick = (e) => {
      e.stopPropagation();
      closeTab(tab.id);
    };

    // Handle row clicks
    tabItem.onclick = (e) => {
      // Don't do anything if clicking the checkbox itself or close button
      if ((checkbox && e.target === checkbox) || e.target === closeBtn) {
        return;
      }

      // If clicking on tab content (title/url/favicon), switch to tab
      if (e.target.closest('.tab-content')) {
        chrome.tabs.update(tab.id, { active: true });
        chrome.tabs.get(tab.id, (tab) => {
          chrome.windows.update(tab.windowId, { focused: true });
        });
        window.close();
      } else if (checkbox) {
        // Otherwise toggle checkbox (only if in filtered mode)
        checkbox.checked = !checkbox.checked;
        updateCloseAllButton();
      }
    };

    if (checkbox) {
      tabItem.appendChild(checkbox);
    }
    tabItem.appendChild(tabContent);
    tabItem.appendChild(closeBtn);

    resultsDiv.appendChild(tabItem);
  });

  updateCloseAllButton();
}

function showSettingsScreen() {
  document.getElementById("mainScreen").style.display = "none";
  document.getElementById("settingsScreen").style.display = "block";
  document.getElementById("apiKeyInput").focus();
}

function showMainScreen() {
  document.getElementById("settingsScreen").style.display = "none";
  document.getElementById("mainScreen").style.display = "block";
  document.getElementById("userQuery").focus();
}

function showPresetsDropdown() {
  const dropdown = document.getElementById("presetsDropdown");
  dropdown.innerHTML = "";

  let hasItems = false;

  // Show presets first
  if (presets.length > 0) {
    const header = document.createElement("div");
    header.className = "preset-section-header";
    header.textContent = "Presets (Del to remove)";
    dropdown.appendChild(header);

    presets.forEach((preset, index) => {
      const item = document.createElement("div");
      item.className = "preset-item";
      item.dataset.index = index;
      item.dataset.type = "preset";
      item.innerHTML = `
        <span class="preset-icon">⭐</span>
        <span class="preset-text">${preset}</span>
        <span class="preset-remove" title="Remove preset">×</span>
      `;

      const removeBtn = item.querySelector(".preset-remove");
      removeBtn.onclick = async (e) => {
        e.stopPropagation();
        await removePreset(preset);
        showPresetsDropdown();
      };

      item.onclick = (e) => {
        if (!e.target.classList.contains("preset-remove")) {
          selectDropdownItem(preset);
        }
      };

      dropdown.appendChild(item);
    });
    hasItems = true;
  }

  // Show recent searches
  if (recentSearches.length > 0) {
    const header = document.createElement("div");
    header.className = "preset-section-header";
    header.textContent = "Recent";
    dropdown.appendChild(header);

    recentSearches.forEach((search, index) => {
      const item = document.createElement("div");
      item.className = "preset-item";
      item.dataset.index = presets.length + index;
      item.dataset.type = "recent";
      item.innerHTML = `
        <span class="preset-icon">🕐</span>
        <span class="preset-text">${search}</span>
      `;
      item.onclick = () => selectDropdownItem(search);
      dropdown.appendChild(item);
    });
    hasItems = true;
  }

  if (hasItems) {
    // Add keyboard shortcuts hint at the bottom
    const footer = document.createElement("div");
    footer.className = "preset-section-header";
    footer.style.borderTop = "1px solid #e0e0e0";
    footer.style.borderBottom = "none";
    footer.textContent = "Ctrl+S to save • ↑↓ to navigate • Enter to select";
    dropdown.appendChild(footer);

    dropdown.classList.add("active");
    // Select first item
    const firstItem = dropdown.querySelector(".preset-item");
    if (firstItem) firstItem.classList.add("selected");
  }
}

function hidePresetsDropdown() {
  document.getElementById("presetsDropdown").classList.remove("active");
}

function selectDropdownItem(query) {
  document.getElementById("userQuery").value = query;
  hidePresetsDropdown();
  document.getElementById("submit").click();
}

function navigateDropdown(direction) {
  const dropdown = document.getElementById("presetsDropdown");
  const items = dropdown.querySelectorAll(".preset-item");
  if (items.length === 0) return;

  const selected = dropdown.querySelector(".preset-item.selected");
  let nextIndex = 0;

  if (selected) {
    const currentIndex = Array.from(items).indexOf(selected);
    nextIndex = direction === "down"
      ? (currentIndex + 1) % items.length
      : (currentIndex - 1 + items.length) % items.length;
    selected.classList.remove("selected");
  }

  items[nextIndex].classList.add("selected");
  items[nextIndex].scrollIntoView({ block: "nearest" });
}

function selectCurrentDropdownItem() {
  const selected = document.querySelector(".preset-item.selected");
  if (selected) {
    const query = selected.querySelector(".preset-text").textContent;
    selectDropdownItem(query);
  }
}
