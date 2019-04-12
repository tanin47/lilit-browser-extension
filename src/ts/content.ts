import {processFile} from "./lib/_process_file";
import {processPullRequest} from "./lib/_process_pull_request";


chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    process();
    sendResponse(null);
    return true;
  }
);

function process(): void {
  console.log('[Codelab] Detect github.');
  let tokens = window.location.href.split('/');

  if (tokens[5] == 'blob') {
    processFile();
  } else if (tokens[5] == 'pull') {
    processPullRequest();
  } else {
    console.log('[Codelab] The page is neither a file nor a pull request.');
  }
}

// Invoke process when the page is first loaded.
process();
