import {PullRequestView} from "./_pull_request_view";


export function processPullRequest(): void {
  console.log(`[Codelab] Process the page as a pull request: ${window.location.href}`);

  let urlTokens = window.location.href.split('/');

  if (urlTokens[7] !== 'files') {
    console.log('[Codelab] The tab "Files changed" is not visible. Do nothing.');
    return;
  }

  if (!document.querySelector('input[name=comparison_start_oid]')) {
    console.log("[Codelab] The tab 'Files changed' hasn't finished loading yet. Do nothing.");
    return;
  }

  let repoName = `${urlTokens[3]}/${urlTokens[4]}`;

  let startRevision = (document.querySelector('input[name=comparison_start_oid]')! as HTMLInputElement).value;
  let endRevision = (document.querySelector('input[name=comparison_end_oid]')! as HTMLInputElement).value;

  console.log(`[Codelab] Base revision: ${startRevision}, target revision: ${endRevision}`);

  let view = document.querySelector('#files')!;

  new PullRequestView({
    repoName: repoName,
    startRevision: startRevision,
    endRevision: endRevision,
    view: view
  });
}
