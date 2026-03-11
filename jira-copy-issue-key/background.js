chrome.runtime.onInstalled.addListener(() => {
  // Hidden by default everywhere
  chrome.action.disable();

  chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
    chrome.declarativeContent.onPageChanged.addRules([{
      conditions: [
        new chrome.declarativeContent.PageStateMatcher({
          pageUrl: { hostSuffix: '.atlassian.net' },
        }),
      ],
      actions: [new chrome.declarativeContent.ShowAction()],
    }]);
  });
});
