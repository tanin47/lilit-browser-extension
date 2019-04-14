import {FileHighlighter} from "./_file_highlighter";
import {LineTokens} from "./_line_tokenizer";

declare let __HOST__: string;

export function processFile(): void {
  console.log(`[Codelab] Process the page as a file: ${window.location.href}`);
  let urlPath = window.location.href.split('/').slice(7).join('/');

  let permalink = document.querySelector('.js-permalink-shortcut');
  if (!permalink) {
    console.error("Unable to detect .js-permalink-shortcut. The page hasn't finished loading yet. Do nothing.");
    return;
  }

  let urlTokens = permalink.getAttribute('href')!.split('/');

  let repoName = `${urlTokens[1]}/${urlTokens[2]}`;
  let revision = urlTokens[4];
  let path = urlTokens.slice(5).join('/');

  if (path != urlPath) {
    console.log("[Codelab] the paths from .js-permalink-shortcut and window.location.href do not match. The new page hasn't finished loading yet. Do nothing.");
    return;
  }

  console.log(`[Codelab] repo: ${repoName}, revision: ${revision}, file: ${path}`);

  let branch = window.location.href.split('/')[6];

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
        new FileHighlighter({
          repoName: repoName,
          revision: revision,
          branch: branch,
          selectedNodeId: selectedNodeId,
          lineTokens: LineTokens.build(resp.data.files[0])
        }).run();
      } else {
        console.log('[Codelab] Failed to fetch data.', resp);
      }
    }
  );
}

