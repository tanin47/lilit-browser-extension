let reloadButton = document.getElementById('reloadButton')!;

chrome.storage.sync.get('color', (data) => {
  reloadButton.onclick = (element) => {
    chrome.tabs.query(
      { active: true, currentWindow: true },
      (tabs) => { // NB: see https://github.com/xpl/crx-hotreload/issues/5
        if (tabs[0]) { chrome.tabs.reload(tabs[0].id!) }
        chrome.runtime.reload();
      }
    );
  };
});