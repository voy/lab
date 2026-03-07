/**
 * JiraButtonInjector - Manages dynamic button injection for Jira's SPA
 *
 * Handles:
 * - MutationObserver for detecting DOM changes
 * - Debouncing to prevent excessive injections
 * - Polling as a safety net
 * - Navigation listeners for SPA transitions
 */
class JiraButtonInjector {
  constructor() {
    this.debounceTimer = null;
    this.DEBOUNCE_DELAY = 300; // ms - wait for DOM to settle
    this.POLL_INTERVAL = 3000; // ms - safety net polling
    this.observer = null;
    this.pollInterval = null;
  }

  /**
   * Start the injection system
   * Sets up observers, polling, and event listeners
   */
  start() {
    console.log('[Jira Copy Key] Starting button injection system');

    // Initial injection
    this.inject();

    // Set up MutationObserver for dynamic content
    this.setupMutationObserver();

    // Set up polling as safety net
    this.setupPolling();

    // Listen for SPA navigation (back/forward)
    this.setupNavigationListener();
  }

  /**
   * Stop the injection system (cleanup)
   */
  stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }

    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }

    console.log('[Jira Copy Key] Stopped button injection system');
  }

  /**
   * Set up MutationObserver to watch for DOM changes
   */
  setupMutationObserver() {
    this.observer = new MutationObserver((mutations) => {
      // Check if any mutations added nodes (content appeared)
      const hasAddedNodes = mutations.some(mutation =>
        mutation.addedNodes && mutation.addedNodes.length > 0
      );

      if (hasAddedNodes) {
        this.scheduleInjection();
      }
    });

    // Observe the entire document body
    this.observer.observe(document.body, {
      childList: true,   // Watch for added/removed nodes
      subtree: true,     // Watch all descendants
      attributes: false  // Don't watch attribute changes (performance)
    });

    console.log('[Jira Copy Key] MutationObserver started');
  }

  /**
   * Set up polling as a safety net for missed mutations
   */
  setupPolling() {
    this.pollInterval = setInterval(() => {
      this.inject();
    }, this.POLL_INTERVAL);

    console.log('[Jira Copy Key] Polling started (every', this.POLL_INTERVAL, 'ms)');
  }

  /**
   * Listen for browser navigation events (back/forward buttons)
   */
  setupNavigationListener() {
    window.addEventListener('popstate', () => {
      console.log('[Jira Copy Key] Navigation detected (popstate)');
      this.scheduleInjection();
    });

    // Also listen for pushState (some SPAs use this)
    const originalPushState = history.pushState;
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      window.dispatchEvent(new Event('pushstate'));
    };

    window.addEventListener('pushstate', () => {
      console.log('[Jira Copy Key] Navigation detected (pushstate)');
      this.scheduleInjection();
    });
  }

  /**
   * Schedule an injection after a debounce delay
   * Prevents excessive injections during rapid DOM changes
   */
  scheduleInjection() {
    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Schedule new injection
    this.debounceTimer = setTimeout(() => {
      this.inject();
      this.debounceTimer = null;
    }, this.DEBOUNCE_DELAY);
  }

  /**
   * Execute the injection
   * Delegates to ButtonInjector
   */
  inject() {
    try {
      ButtonInjector.inject();
    } catch (err) {
      console.error('[Jira Copy Key] Injection error:', err);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JiraButtonInjector;
}
