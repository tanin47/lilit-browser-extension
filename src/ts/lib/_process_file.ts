import {__HOST__} from "./_global";
import {Definition, Token, Usage} from "./_model";
import {Highlighter} from "./_highlighter";

export function processFile(): void {
  console.log(`[Codelab] Process the page as a file: ${window.location.href}`);

  let permalink = document.querySelector('.js-permalink-shortcut');
  if (!permalink) {
    console.error("Unable to detect a commit sha. This shouldn't have happened.");
    return;
  }

  let urlTokens = permalink.getAttribute('href')!.split('/');

  let repoName = `${urlTokens[1]}/${urlTokens[2]}`;
  let revision = urlTokens[4];
  let path = urlTokens.slice(5).join('/');

  console.log(`[Codelab] repo: ${repoName}, revision: ${revision}, file: ${path}`);

  let baseUrl = window.location.href.split('/').slice(3, 7).join('/');

  let selectedNodeId = new URLSearchParams(window.location.search).get('p');

  if (!path.endsWith('.java')) {
    console.log('[Codelab] Do nothing. This is not a java file.');
    return;
  }

  console.log(`[Codelab] Fetch data from ${__HOST__}`);
  chrome.runtime.sendMessage(
    {
      repoName: repoName,
      files: [{ revision: revision, path: path }]
    },
    (resp) => {
      if (resp.data && resp.data.success) {
        console.log('[Codelab] Fetched data successfully ', resp);
        let usages = resp.data.files[0].usages as Usage[];
        let defs = resp.data.files[0].definitions as Definition[];
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

