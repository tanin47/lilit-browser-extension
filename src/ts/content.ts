import {Definition, Usage, Token} from "./lib/_model";
import {Highlighter} from "./lib/_highlighter";

declare let __HOST__: string;

chrome.runtime.onMessage.addListener(
  (request, sender, sendResponse) => {
    install();
    sendResponse(null);
    return true;
  }
);

function install(): void {
  console.log('[Codelab] Detect github.');

  let permalink = document.querySelector('.js-permalink-shortcut')!;
  let urlTokens = permalink.getAttribute('href')!.split('/');

  let repoName = `${urlTokens[1]}/${urlTokens[2]}`;
  let revision = urlTokens[4];
  let file = urlTokens.slice(5).join('/');

  console.log(`[Codelab] repo: ${repoName}, revision: ${revision}, file: ${file}`);

  let baseUrl = window.location.href.split('/').slice(3, 7).join('/');

  let selectedNodeId = new URLSearchParams(window.location.search).get('p');

  if (!file.endsWith('.java')) {
    console.log('[Codelab] Do nothing. This is not a java file.');
    return;
  }

  console.log(`[Codelab] Fetch data from ${__HOST__}`);
  chrome.runtime.sendMessage(
    {repoName: repoName, revision: revision, file: file},
    (resp) => {
      if (resp.data.success) {
        console.log('[Codelab] Fetched data successfully ', resp);
        let usages = resp.data.usages as Usage[];
        let defs = resp.data.definitions as Definition[];
        let tokens: Token[] = [];

        usages.forEach((u) => tokens.push(u));
        defs.forEach((d) => tokens.push(d));

        new Highlighter({
          repoName: repoName,
          revision: revision,
          baseUrl: baseUrl,
          selectedNodeId: selectedNodeId,
          unsortedTokens: tokens
        }).run();
      } else {
        console.log('[Codelab] Failed to fetch data.', resp);
      }
    }
  );
}


install();
