import axios from 'axios';

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

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    console.log("Hello");
    axios
      .get(
        `http://localhost:9000/github/${request.repoName}/${request.revision}/json/${request.file}`,
        {
          headers: { 'Accept': 'application/json' }
        }
      )
      .then((resp) => {
        sendResponse(resp);
      })
      .catch((error) => {
        console.log(error);
      });
    return true;
  }
);