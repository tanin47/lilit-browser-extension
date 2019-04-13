import axios from 'axios';

declare let __HOST__: string;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({color: '#3aa757'}, () => {
    console.log('The color is green.');
  });
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
    chrome.declarativeContent.onPageChanged.addRules([{
        conditions: [new chrome.declarativeContent.PageStateMatcher({
          pageUrl: {hostEquals: 'developer.chrome.com'},
        })
      ],
      actions: [new chrome.declarativeContent.ShowPageAction()]
    }]);
  });
});

// Github.com fires the HistoryStateUpdated twice. Once for starting loading and another for finishing loading.
// We detect the second event and fire the event to the content script.
let counts = new Map();

chrome.webNavigation.onHistoryStateUpdated.addListener(function(details) {
  console.log(details);
  if (!counts.has(details.url)) {
    counts.set(details.url, 0);
  }
  counts.set(details.url, counts.get(details.url) + 1);

  counts.forEach((value, url) => {
    if ((value % 2) == 0) {
      chrome.tabs.sendMessage(details.tabId, details, (resp) => {});

      if (value == 2) {
        counts.delete(url);
      } else {
        counts.set(url, value - 2);
      }
    }
  });
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