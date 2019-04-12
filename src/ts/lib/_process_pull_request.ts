import {__HOST__} from "./_global";
import {Definition, Token, Usage} from "./_model";
import {Highlighter} from "./_highlighter";

export function processPullRequest(): void {
  console.log(`[Codelab] Process the page as a pull request: ${window.location.href}`);

  let urlTokens = window.location.href.split('/');

  if (urlTokens[7] == 'files') {
    console.log('[Codelab] The tab "Files changed" is not visible. Do nothing.');
    return;
  }

  let repoName = `${urlTokens[3]}/${urlTokens[4]}`;

  let startCommit = (document.querySelector('input[name=comparison_start_oid]')! as HTMLInputElement).value;
  let endCommit = (document.querySelector('input[name=comparison_end_oid]')! as HTMLInputElement).value;

  let fileViews = document.querySelectorAll('files > js-file');

  let files: object[] = [];
  fileViews.forEach((fileView) => {
    let path = fileView.querySelector('js-file-header')!.getAttribute('data-path')!;

    if (path.endsWith('.java')) {
      files.push({revision: startCommit, path: path});
      files.push({revision: endCommit, path: path});
    }
  });

  console.log(`[Codelab] Fetch data from ${__HOST__}`);
  chrome.runtime.sendMessage(
    {
      repoName: repoName,
      files: files
    },
    (resp) => {
      if (resp.data && resp.data.success) {
        console.log('[Codelab] Fetched data successfully ', resp);

        // let usages = resp.data.usages as Usage[];
        // let defs = resp.data.definitions as Definition[];
        // let tokens: Token[] = [];
        //
        // usages.forEach((u) => tokens.push(u));
        // defs.forEach((d) => tokens.push(d));
        //
        // new Highlighter({
        //   repoName: repoName,
        //   revision: revision,
        //   baseUrl: baseUrl,
        //   selectedNodeId: selectedNodeId,
        //   unsortedTokens: tokens
        // }).run();
      } else {
        console.log('[Codelab] Failed to fetch data.', resp);
      }
    }
  );
}
