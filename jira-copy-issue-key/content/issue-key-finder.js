/**
 * IssueKeyFinder - Extracts Jira issue keys using multiple strategies
 *
 * Tries methods in priority order until a valid key is found:
 * 1. URL parsing
 * 2. Document title parsing
 * 3. DOM metadata (data attributes, meta tags)
 * 4. DOM content parsing (breadcrumbs, headers)
 */
class IssueKeyFinder {
  static ISSUE_KEY_REGEX = /^[A-Z][A-Z0-9]+-\d+$/;

  /**
   * Find the issue key using all available methods
   * @returns {string|null} The issue key (e.g., "SLIDES-1636") or null
   */
  static findIssueKey() {
    return this.fromURL() ||
           this.fromTitle() ||
           this.fromMetadata() ||
           this.fromDOM() ||
           null;
  }

  /**
   * Extract issue key from URL path
   * Works for: /browse/KEY-123 pages
   * @returns {string|null}
   */
  static fromURL() {
    const match = window.location.pathname.match(/\/browse\/([A-Z][A-Z0-9]+-\d+)/);
    if (match) {
      return this.validate(match[1]);
    }
    return null;
  }

  /**
   * Extract issue key from document title
   * Patterns: "[KEY-123]", "KEY-123 - Title", "KEY-123: Title"
   * @returns {string|null}
   */
  static fromTitle() {
    const title = document.title;
    const match = title.match(/\[?([A-Z][A-Z0-9]+-\d+)\]?/);
    if (match) {
      return this.validate(match[1]);
    }
    return null;
  }

  /**
   * Extract issue key from DOM metadata (meta tags, data attributes)
   * @returns {string|null}
   */
  static fromMetadata() {
    // Check meta tag (older Jira versions)
    const metaIssue = document.querySelector('meta[name="ajs-issue-key"]');
    if (metaIssue && metaIssue.content) {
      const validated = this.validate(metaIssue.content);
      if (validated) return validated;
    }

    // Check data-issue-key attributes
    const issueContainer = document.querySelector('[data-issue-key]');
    if (issueContainer && issueContainer.dataset.issueKey) {
      const validated = this.validate(issueContainer.dataset.issueKey);
      if (validated) return validated;
    }

    // Check for data-testid containing issue key
    const testIdElement = document.querySelector('[data-testid*="-"][data-testid*="."]');
    if (testIdElement) {
      const testId = testIdElement.getAttribute('data-testid');
      const match = testId.match(/([A-Z][A-Z0-9]+-\d+)/);
      if (match) {
        return this.validate(match[1]);
      }
    }

    return null;
  }

  /**
   * Extract issue key from visible DOM content
   * Looks in: breadcrumbs, headers, issue links
   * @returns {string|null}
   */
  static fromDOM() {
    // Check breadcrumb
    const breadcrumbs = document.querySelectorAll('nav ol li, [data-testid*="breadcrumb"]');
    for (const breadcrumb of breadcrumbs) {
      const text = breadcrumb.textContent.trim();
      const match = text.match(/\b([A-Z][A-Z0-9]+-\d+)\b/);
      if (match) {
        const validated = this.validate(match[1]);
        if (validated) return validated;
      }
    }

    // Check for issue key in header/title area
    const headers = document.querySelectorAll('h1, [data-testid*="issue"]');
    for (const header of headers) {
      const text = header.textContent.trim();
      const match = text.match(/\b([A-Z][A-Z0-9]+-\d+)\b/);
      if (match) {
        const validated = this.validate(match[1]);
        if (validated) return validated;
      }
    }

    // Check for issue links
    const issueLinks = document.querySelectorAll('a[href*="/browse/"]');
    for (const link of issueLinks) {
      const href = link.getAttribute('href');
      const match = href.match(/\/browse\/([A-Z][A-Z0-9]+-\d+)/);
      if (match) {
        const validated = this.validate(match[1]);
        if (validated) return validated;
      }
    }

    return null;
  }

  /**
   * Validate that a string matches the issue key format
   * @param {string} key - Potential issue key
   * @returns {string|null} The key if valid, null otherwise
   */
  static validate(key) {
    if (!key) return null;
    const trimmed = key.trim().toUpperCase();
    return this.ISSUE_KEY_REGEX.test(trimmed) ? trimmed : null;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IssueKeyFinder;
}
