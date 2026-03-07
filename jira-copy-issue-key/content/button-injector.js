/**
 * ButtonInjector - Finds copy link buttons and injects copy key buttons
 *
 * Handles:
 * - Finding copy link buttons using multiple selectors
 * - Creating styled copy key buttons
 * - Copying to clipboard with fallback
 * - Deduplication to avoid multiple injections
 */
class ButtonInjector {
  /**
   * Selectors to find Jira's copy link button
   * Tries multiple patterns for resilience across Jira versions
   */
  static COPY_LINK_SELECTORS = [
    // Modern Jira - button contains span with permalink testid
    'button:has(span[data-testid*="permalink-button"])',
    // Button contains element with "Copy link" aria-label
    'button:has([aria-label*="Copy link" i])',
    // Wrapper with testid containing button
    '[data-testid*="copy-link-button-wrapper"] button',
    // Older patterns (fallbacks)
    'button[aria-label*="Copy link" i]',
    'button[data-testid*="copy-link"]',
    'button[title*="Copy link" i]',
  ];

  /**
   * Main injection method - finds copy link buttons and injects copy key buttons
   */
  static inject() {
    const copyLinkButtons = this.findCopyLinkButtons();

    copyLinkButtons.forEach(button => {
      // Skip if already enhanced
      if (this.isAlreadyEnhanced(button)) return;

      // Find issue key
      const issueKey = IssueKeyFinder.findIssueKey();
      if (!issueKey) {
        // No issue key found, don't inject (graceful degradation)
        return;
      }

      // Create and inject the copy key button
      const copyKeyButton = this.createButton(issueKey);
      this.insertButton(button, copyKeyButton);

      // Mark as enhanced to prevent duplicate injections
      this.markAsEnhanced(button);
    });
  }

  /**
   * Find all copy link buttons on the page
   * @returns {Array<HTMLElement>}
   */
  static findCopyLinkButtons() {
    for (const selector of this.COPY_LINK_SELECTORS) {
      try {
        const buttons = document.querySelectorAll(selector);
        if (buttons.length > 0) {
          return Array.from(buttons);
        }
      } catch (e) {
        // Invalid selector, skip
        console.warn('Invalid selector:', selector, e);
      }
    }
    return [];
  }

  /**
   * Create the copy key button element
   * @param {string} issueKey - The issue key to copy
   * @returns {HTMLButtonElement}
   */
  static createButton(issueKey) {
    const button = document.createElement('button');

    // Add our custom class
    button.className = 'copy-issue-key-btn';

    // Copy classes from a nearby Jira button for styling consistency
    const referenceButton = document.querySelector('button[aria-label*="Copy link" i]');
    if (referenceButton) {
      // Copy relevant classes (excluding specific state classes)
      const classes = Array.from(referenceButton.classList)
        .filter(cls => !cls.includes('active') && !cls.includes('pressed'));
      button.classList.add(...classes);
    }

    // Set attributes
    button.setAttribute('type', 'button');
    button.setAttribute('aria-label', 'Copy issue key');
    button.title = `Copy issue key: ${issueKey}`;

    // Button text/content
    button.textContent = '🔑'; // Key emoji as icon
    button.style.fontSize = '12px';
    button.style.border = 'none';
    button.style.background = 'transparent';
    button.style.padding = '0';
    button.style.margin = '0';
    button.style.minHeight = '0';
    button.style.minWidth = '0';
    button.style.height = 'auto';
    button.style.lineHeight = '1';
    button.style.verticalAlign = 'middle';
    button.style.display = 'inline-flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.color = 'currentColor'; // Inherit Jira's text color
    button.style.opacity = '0.7'; // Match link icon opacity
    button.style.filter = 'grayscale(1) brightness(0.6)'; // Match native icon color
    button.style.position = 'relative';
    button.style.top = '-5px'; // Move up slightly

    // Attach click handler
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.copyToClipboard(issueKey, button);
    });

    return button;
  }

  /**
   * Insert the copy key button next to the copy link button
   * @param {HTMLElement} copyLinkButton - The reference copy link button
   * @param {HTMLElement} copyKeyButton - The button to insert
   */
  static insertButton(copyLinkButton, copyKeyButton) {
    // Find the parent span[role="presentation"] wrapper
    const spanWrapper = copyLinkButton.closest('span[role="presentation"]');
    if (spanWrapper && spanWrapper.parentElement) {
      // Create a new span wrapper for our button
      const newWrapper = document.createElement('span');
      newWrapper.setAttribute('role', 'presentation');
      newWrapper.appendChild(copyKeyButton);

      // Insert the wrapped button after the copy link button's wrapper
      spanWrapper.parentElement.insertBefore(newWrapper, spanWrapper.nextSibling);
    } else {
      // Fallback: insert directly if no wrapper found
      const parent = copyLinkButton.parentElement;
      if (parent) {
        parent.insertBefore(copyKeyButton, copyLinkButton.nextSibling);
      }
    }
  }

  /**
   * Copy text to clipboard with fallback
   * @param {string} text - Text to copy
   * @param {HTMLElement} button - Button element for visual feedback
   */
  static async copyToClipboard(text, button) {
    try {
      // Modern Clipboard API (preferred)
      await navigator.clipboard.writeText(text);
      this.showSuccess(button);
    } catch (err) {
      // Fallback for older browsers or permission issues
      console.warn('Clipboard API failed, using fallback:', err);
      this.fallbackCopy(text, button);
    }
  }

  /**
   * Fallback clipboard copy using execCommand
   * @param {string} text - Text to copy
   * @param {HTMLElement} button - Button element for visual feedback
   */
  static fallbackCopy(text, button) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);

    try {
      textarea.select();
      const successful = document.execCommand('copy');
      if (successful) {
        this.showSuccess(button);
      } else {
        this.showError(button);
      }
    } catch (err) {
      console.error('Fallback copy failed:', err);
      this.showError(button);
    } finally {
      document.body.removeChild(textarea);
    }
  }

  /**
   * Show success feedback on the button
   * @param {HTMLElement} button
   */
  static showSuccess(button) {
    const originalContent = button.textContent;
    const originalTitle = button.title;

    button.textContent = '✅'; // Green checkmark emoji
    button.title = 'Copied!';
    button.classList.add('success');

    setTimeout(() => {
      button.textContent = originalContent;
      button.title = originalTitle;
      button.classList.remove('success');
    }, 2000);
  }

  /**
   * Show error feedback on the button
   * @param {HTMLElement} button
   */
  static showError(button) {
    const originalContent = button.textContent;
    const originalTitle = button.title;

    button.textContent = '✗';
    button.title = 'Copy failed';
    button.style.color = '#de350b'; // Jira's error red

    setTimeout(() => {
      button.textContent = originalContent;
      button.title = originalTitle;
      button.style.color = '';
    }, 2000);
  }

  /**
   * Check if a copy link button has already been enhanced
   * @param {HTMLElement} button
   * @returns {boolean}
   */
  static isAlreadyEnhanced(button) {
    return button.hasAttribute('data-enhanced-copy-key');
  }

  /**
   * Mark a copy link button as enhanced
   * @param {HTMLElement} button
   */
  static markAsEnhanced(button) {
    button.setAttribute('data-enhanced-copy-key', 'true');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ButtonInjector;
}
