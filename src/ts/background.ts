import axios from 'axios';

declare let __HOST__: string;

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: 'github.com'},
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  console.log(`[Codelab] HistoryStateUpdated is fired for ${details.url}`);
  chrome.tabs.sendMessage(details.tabId, details, (resp) => {});
});

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    axios
      .post(
        `${__HOST__}/github/${request.repoName}/fileRequests`,
        { files: request.files },
        {
          headers: { 'Accept': 'application/json' }
        }
      )
      .then((resp) => {
        sendResponse(resp);
      })
      .catch((error) => {
        sendResponse(error);
      });
    return true;
  }
);