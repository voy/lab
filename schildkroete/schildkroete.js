// ==UserScript==
// @name         Schildkröte Berlin - Mealplan Side by Side
// @namespace    https://bestellung.schildkroete-berlin.de/
// @version      0.1.0
// @description  Displays mealplan panels side by side using flexbox
// @author       You
// @match        https://bestellung.schildkroete-berlin.de/kunden/essen/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=schildkroete-berlin.de
// @grant        none
// @run-at       document-idle
// ==/UserScript==

"use strict";
(() => {
  const SHOULD_LOG = true;
  const LOG_PREFIX = "[Schildkröte:Mealplan]";
  const SELECTOR = ".panel-mealplan";
  const WRAPPER_ID = "mealplan-flex-wrapper";

  function log(...args) {
    if (SHOULD_LOG) {
      console.log(LOG_PREFIX, ...args);
    }
  }

  function findCommonParent(elements) {
    if (elements.length === 0) return null;
    if (elements.length === 1) return elements[0].parentElement;

    let parent = elements[0].parentElement;
    while (parent) {
      const allAreDescendants = Array.from(elements).every(
        (el) => parent.contains(el)
      );
      if (allAreDescendants) {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  function wrapPanelsInFlex() {
    // Skip if already wrapped
    if (document.getElementById(WRAPPER_ID)) {
      log("Already wrapped, skipping");
      return;
    }

    const panels = document.querySelectorAll(SELECTOR);
    if (panels.length < 2) {
      log("Less than 2 panels found, skipping");
      return;
    }

    log("Found", panels.length, "panels");

    const commonParent = findCommonParent(panels);
    if (!commonParent) {
      log("Could not find common parent");
      return;
    }

    log("Common parent:", commonParent);

    // Create flex wrapper
    const wrapper = document.createElement("div");
    wrapper.id = WRAPPER_ID;
    wrapper.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      align-items: flex-start;
    `;

    // Style each panel to take up roughly half the width
    panels.forEach((panel) => {
      panel.style.flex = "1 1 45%";
      panel.style.minWidth = "300px";
      panel.style.maxWidth = "100%";
    });

    // Insert wrapper before the first panel
    const firstPanel = panels[0];
    firstPanel.parentElement.insertBefore(wrapper, firstPanel);

    // Move all panels into the wrapper
    panels.forEach((panel) => {
      wrapper.appendChild(panel);
    });

    log("Panels wrapped successfully");
  }

  function waitForElement(selector, timeout = 10000) {
    return new Promise((resolve) => {
      const existing = document.querySelector(selector);
      if (existing) return resolve(existing);

      const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
          observer.disconnect();
          resolve(el);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });

      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, timeout);
    });
  }

  async function init() {
    log("Initializing...");

    const panel = await waitForElement(SELECTOR, 10000);
    if (!panel) {
      log("No panels found after waiting");
      return;
    }

    // Small delay to ensure all panels are loaded
    await new Promise((r) => setTimeout(r, 500));

    wrapPanelsInFlex();

    log("Initialization complete");
  }

  init().catch((err) => console.error(LOG_PREFIX, "Error:", err));
})();