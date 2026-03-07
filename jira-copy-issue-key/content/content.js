/**
 * Jira Copy Issue Key Extension - Main Entry Point
 *
 * This content script runs on all Atlassian Jira pages and manages
 * the injection of "Copy Issue Key" buttons throughout the session.
 */

(function() {
  'use strict';

  // Global injector instance
  let injector = null;

  /**
   * Initialize the extension
   */
  function init() {
    console.log('[Jira Copy Key] Initializing extension');

    // Verify we're on a Jira page
    if (!isJiraPage()) {
      console.log('[Jira Copy Key] Not a Jira page, exiting');
      return;
    }

    console.log('[Jira Copy Key] Jira page detected');

    // Create and start the button injector
    injector = new JiraButtonInjector();
    injector.start();
  }

  /**
   * Check if we're on a Jira page
   * @returns {boolean}
   */
  function isJiraPage() {
    const hostname = window.location.hostname;
    const pathname = window.location.pathname;

    // Must be on Atlassian domain
    if (!hostname.includes('atlassian.net')) {
      return false;
    }

    // Check for Jira-specific paths
    const isJiraPath = pathname.includes('/jira/') ||
                       pathname.includes('/browse/') ||
                       pathname.includes('/projects/');

    return isJiraPath;
  }

  /**
   * Cleanup on page unload (optional)
   */
  function cleanup() {
    if (injector) {
      injector.stop();
      injector = null;
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // DOM already loaded
    init();
  }

  // Cleanup on page unload (not strictly necessary for content scripts)
  window.addEventListener('beforeunload', cleanup);

  console.log('[Jira Copy Key] Content script loaded');
})();
