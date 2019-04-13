import {FileResponse} from "./_model";
import {PullRequestFileHighlighter, PullRequestFileTokenSet} from "./_pull_request_file_highlighter";
import {LineTokens} from "./_line_tokenizer";

declare let __HOST__: string;

export function processPullRequest(): void {
  console.log(`[Codelab] Process the page as a pull request: ${window.location.href}`);

  let urlTokens = window.location.href.split('/');

  if (urlTokens[7] !== 'files') {
    console.log('[Codelab] The tab "Files changed" is not visible. Do nothing.');
    return;
  }

  let repoName = `${urlTokens[3]}/${urlTokens[4]}`;

  let startRevision = (document.querySelector('input[name=comparison_start_oid]')! as HTMLInputElement).value;
  let endRevision = (document.querySelector('input[name=comparison_end_oid]')! as HTMLInputElement).value;

  console.log(`[Codelab] Base revision: ${startRevision}, target revision: ${endRevision}`);

  let fileViews = document.querySelectorAll('#files .js-file');
  console.log(`[Codelab] Found ${fileViews.length} files.`);

  let files: object[] = [];
  fileViews.forEach((fileView) => {
    let path = fileView.querySelector('.js-file-header')!.getAttribute('data-path')!;

    if (path.endsWith('.java')) {
      files.push({revision: startRevision, path: path});
      files.push({revision: endRevision, path: path});
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

        let dataByRevisionAndPath = buildData(resp.data.files);

        fileViews.forEach((fileView) => {
          let path = fileView.querySelector('.js-file-header')!.getAttribute('data-path')!;
          let startFileResponse = dataByRevisionAndPath.get(startRevision)!.get(path)!;
          let endFileResponse = dataByRevisionAndPath.get(endRevision)!.get(path)!;

          new PullRequestFileHighlighter({
            repoName: repoName,
            fileView: fileView,
            startTokenSet: new PullRequestFileTokenSet(
              startRevision,
              LineTokens.build(startFileResponse)
            ),
            endTokenSet: new PullRequestFileTokenSet(
              endRevision,
              LineTokens.build(endFileResponse)
            )
          }).run();
        });
      } else {
        console.log('[Codelab] Failed to fetch data.', resp);
      }
    }
  );
}

function buildData(files: FileResponse[]): Map<String, Map<String, FileResponse>> {
  let map = new Map();

  files.forEach((file) => {
    if (!map.has(file.revision)) {
      map.set(file.revision, new Map());
    }

    let revisionMap = map.get(file.revision);
    revisionMap.set(file.path, file);
  });

  return map;
}
